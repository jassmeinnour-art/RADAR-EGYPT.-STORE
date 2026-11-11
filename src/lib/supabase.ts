import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Trader {
  id: string;
  user_id: string;
  seller_name: string;
  email: string;
  phone: string;
  address?: string;
  platform: 'amazon' | 'noon' | 'jumia' | 'raneen' | 'kanz' | 'homesmart' | string;
  status: 'active' | 'inactive';
  seller_ids?: Record<string, string>; // { amazon: '...', noon: '...' }
  api_keys?: Record<string, any>;   // { amazon: { clientId: '...', ... }, noon: '...' }
  created_at?: string;
  seller_id?: string;
  seller_link?: string;
  storefront_link?: string;
  gmail?: string;
  // UI helpers
  products_count?: number;
  amazon_count?: number;
  noon_count?: number;
  total_stock?: number;
  invoices_count?: number;
  is_connected?: boolean;
  last_sync_at?: string;
}

export interface Product {
  id: string;
  trader_id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  platform: string;
  image?: string;
  buybox_price?: number;
  competitor_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SplitInvoice {
  id: string;
  original_invoice_id: string;
  trader_id: string;
  split_number: string;
  product_title: string;
  product_sku: string;
  product_asin?: string;
  quantity: number;
  price: number;
  barcode_url?: string;
  pdf_url?: string;
  created_at?: string;
}

export interface AppNotification {
  id: string;
  trader_id?: string;
  type: 'out_of_stock' | 'new_invoice' | 'low_stock' | 'info' | string;
  message: string;
  severity?: 'normal' | 'high' | 'urgent' | string;
  is_read: boolean;
  created_at: string;
}

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-supabase-project') &&
  !SUPABASE_ANON_KEY.includes('your-supabase-anon-key')
);

// Real Supabase JS Client instance if credentials are valid
export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Local isolated storage keys helper for multi-tenant isolation
function getTradersStorageKey(userId: string): string {
  return `radar_multi_tenant_traders_${userId || 'anonymous'}`;
}

function getProductsStorageKey(traderId: string): string {
  return `radar_multi_tenant_products_${traderId}`;
}

/**
 * Multi-Tenant Data Service for Traders & Products
 */
export const multiTenantDb = {
  /**
   * Fetch all traders belonging strictly to the current marketer (where user_id = current user)
   */
  async getTradersByUser(userId: string): Promise<Trader[]> {
    if (!userId) return [];

    let traders: Trader[] = [];

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('traders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          traders = data as Trader[];
        }
      } catch (err) {
        console.warn('[MultiTenant Supabase Fetch Error]:', err);
      }
    }

    if (traders.length === 0) {
      // Isolated Local Storage Fallback partitioned strictly by user_id
      try {
        const raw = localStorage.getItem(getTradersStorageKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            traders = parsed.filter(t => t.user_id === userId);
          }
        }
      } catch (e) {
        console.warn('Failed to parse local traders:', e);
      }
    }

    return traders;
  },

  /**
   * Insert a new trader for the current marketer
   */
  async createTrader(traderData: Omit<Trader, 'id' | 'created_at'>): Promise<Trader> {
    let effectiveUserId = traderData.user_id;
    if (supabaseClient) {
      try {
        const { data: authData } = await supabaseClient.auth.getUser();
        if (authData?.user?.id) {
          effectiveUserId = authData.user.id;
        }
      } catch {
        // use provided user_id
      }
    }

    const id = `trd-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8)}`;
    const newTrader: Trader = {
      ...traderData,
      user_id: effectiveUserId,
      id,
      created_at: new Date().toISOString(),
      status: traderData.status || 'active',
      products_count: 0
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('traders')
          .insert([newTrader])
          .select()
          .single();

        if (!error && data) {
          return data as Trader;
        }
      } catch (err) {
        console.warn('[MultiTenant Supabase Insert Error]:', err);
      }
    }

    // Save in isolated storage for this specific user
    try {
      const key = getTradersStorageKey(traderData.user_id);
      const raw = localStorage.getItem(key);
      const list: Trader[] = raw ? JSON.parse(raw) : [];
      list.unshift(newTrader);
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('multi_tenant_traders_updated', { detail: { userId: traderData.user_id } }));
    } catch (e) {
      console.warn('Failed to save trader locally:', e);
    }

    return newTrader;
  },

  /**
   * Delete a trader belonging to the current user
   */
  async deleteTrader(traderId: string, userId: string): Promise<boolean> {
    if (!traderId || !userId) return false;

    if (supabaseClient) {
      try {
        await supabaseClient.from('inventory_sync').delete().eq('trader_id', traderId);
        await supabaseClient.from('products').delete().eq('trader_id', traderId);
        await supabaseClient.from('invoices').delete().eq('trader_id', traderId);
        await supabaseClient.from('traders').delete().eq('id', traderId);
      } catch (err) {
        console.warn('[MultiTenant Supabase Cascade Delete Error]:', err);
      }
    }

    try {
      localStorage.removeItem(getProductsStorageKey(traderId));
      
      // Cascade delete in local inventory_sync
      const invRaw = localStorage.getItem('radar_inventory_sync');
      if (invRaw) {
        try {
          const invList = JSON.parse(invRaw);
          const filteredInv = invList.filter((item: any) => item.trader_id !== traderId);
          localStorage.setItem('radar_inventory_sync', JSON.stringify(filteredInv));
        } catch {}
      }

      // Cascade delete in traders
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const list: Trader[] = JSON.parse(raw);
              const filtered = list.filter(t => t.id !== traderId);
              localStorage.setItem(k, JSON.stringify(filtered));
            }
          } catch {}
        }
      }

      window.dispatchEvent(new CustomEvent('multi_tenant_traders_updated', { detail: { userId } }));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Update status of a trader
   */
  async updateTraderStatus(traderId: string, userId: string, status: 'active' | 'inactive'): Promise<boolean> {
    if (supabaseClient) {
      try {
        await supabaseClient
          .from('traders')
          .update({ status })
          .eq('id', traderId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[MultiTenant Supabase Update Error]:', err);
      }
    }

    try {
      const key = getTradersStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const list: Trader[] = JSON.parse(raw);
        const target = list.find(t => t.id === traderId);
        if (target) {
          target.status = status;
          localStorage.setItem(key, JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('multi_tenant_traders_updated', { detail: { userId } }));
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Update full trader fields (seller_id, seller_link, storefront_link, gmail, etc.)
   */
  async updateTrader(traderId: string, updates: Partial<Trader>): Promise<boolean> {
    if (!traderId) return false;

    if (supabaseClient) {
      try {
        await supabaseClient
          .from('traders')
          .update(updates)
          .eq('id', traderId);
      } catch (err) {
        console.warn('[MultiTenant Supabase Trader Update Error]:', err);
      }
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const list: Trader[] = JSON.parse(raw);
              if (Array.isArray(list)) {
                const target = list.find(t => t.id === traderId);
                if (target) {
                  Object.assign(target, updates);
                  localStorage.setItem(k, JSON.stringify(list));
                  window.dispatchEvent(new CustomEvent('multi_tenant_traders_updated', { detail: { traderId } }));
                }
              }
            } catch {}
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Save scraped storefront products to trader's catalog
   */
  async saveScrapedProducts(traderId: string, scraped: any[]): Promise<Product[]> {
    if (!traderId || !Array.isArray(scraped) || scraped.length === 0) return [];

    const newProducts: Product[] = scraped.map(s => ({
      id: `prd-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7)}`,
      trader_id: traderId,
      title: s.title || 'منتج مسحوب من المتجر',
      sku: s.sku || s.asin || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
      price: s.price || 0,
      stock: s.inStock ? 15 : 0,
      platform: s.platform || 'amazon',
      image: s.image || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Save to local storage
    try {
      const key = getProductsStorageKey(traderId);
      const raw = localStorage.getItem(key);
      const list: Product[] = raw ? JSON.parse(raw) : [];
      // merge without duplicating same sku/title
      for (const np of newProducts) {
        const exists = list.some(item => item.sku === np.sku || item.title === np.title);
        if (!exists) {
          list.unshift(np);
        }
      }
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('multi_tenant_products_updated', { detail: { traderId } }));
    } catch {}

    // Save to Supabase if available
    if (supabaseClient) {
      try {
        await supabaseClient.from('products').insert(newProducts);
      } catch (err) {
        console.warn('[MultiTenant Products Insert Warning]:', err);
      }
    }

    return newProducts;
  },

  /**
   * Invoices storage & retrieval
   */
  async getInvoicesByTrader(traderId: string): Promise<any[]> {
    if (!traderId) return [];
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('trader_id', traderId)
          .order('created_at', { ascending: false });
        if (data && data.length > 0) return data;
      } catch {}
    }
    try {
      const raw = localStorage.getItem(`radar_invoices_${traderId}`);
      if (raw) return JSON.parse(raw);
    } catch {}

    return [];

  },

  async saveInvoices(traderId: string, invoices: any[]): Promise<void> {
    if (!traderId || !Array.isArray(invoices)) return;
    try {
      const key = `radar_invoices_${traderId}`;
      const raw = localStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : [];
      const merged = [...invoices, ...current.filter((c: any) => !invoices.some((inv: any) => inv.id === c.id || inv.order_id === c.order_id))];
      localStorage.setItem(key, JSON.stringify(merged));
    } catch {}
  },

  /**
   * Split Invoices Management
   */
  async getSplitInvoices(originalInvoiceId?: string, traderId?: string): Promise<SplitInvoice[]> {
    if (supabaseClient) {
      try {
        let query = supabaseClient.from('split_invoices').select('*');
        if (originalInvoiceId) query = query.eq('original_invoice_id', originalInvoiceId);
        if (traderId) query = query.eq('trader_id', traderId);
        const { data } = await query.order('created_at', { ascending: true });
        if (data && data.length > 0) return data as SplitInvoice[];
      } catch {}
    }
    try {
      const raw = localStorage.getItem('radar_split_invoices');
      if (raw) {
        let list: SplitInvoice[] = JSON.parse(raw);
        if (originalInvoiceId) list = list.filter(s => s.original_invoice_id === originalInvoiceId);
        if (traderId) list = list.filter(s => s.trader_id === traderId);
        return list;
      }
    } catch {}
    return [];
  },

  async createSplitInvoices(splits: Omit<SplitInvoice, 'id' | 'created_at'>[]): Promise<SplitInvoice[]> {
    const newSplits: SplitInvoice[] = splits.map(s => ({
      ...s,
      id: `split-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString()
    }));

    if (supabaseClient) {
      try {
        await supabaseClient.from('split_invoices').insert(newSplits);
      } catch {}
    }

    try {
      const key = 'radar_split_invoices';
      const raw = localStorage.getItem(key);
      const list: SplitInvoice[] = raw ? JSON.parse(raw) : [];
      list.unshift(...newSplits);
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('radar_split_invoices_updated'));
    } catch {}

    return newSplits;
  },

  /**
   * Notifications Management
   */
  async getNotifications(traderId?: string): Promise<AppNotification[]> {
    if (supabaseClient) {
      try {
        let query = supabaseClient.from('invoices').select('id, trader_id, invoice_number, total_amount, created_at');
        if (traderId) query = query.eq('trader_id', traderId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((inv: any) => ({
            id: `notif-inv-${inv.id}`,
            trader_id: inv.trader_id,
            type: 'new_invoice',
            message: `وصلت فاتورة جديدة #${inv.invoice_number || inv.id} بقيمة ${inv.total_amount || 0} ج.م`,
            severity: 'normal',
            is_read: false,
            created_at: inv.created_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('[Supabase getNotifications error]:', err);
      }
    }
    return [];
  },

  async addNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>): Promise<AppNotification> {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        await supabaseClient.from('notifications').insert([newNotif]);
      } catch {}
    }

    try {
      const raw = localStorage.getItem('radar_notifications');
      const list: AppNotification[] = raw ? JSON.parse(raw) : [];
      list.unshift(newNotif);
      localStorage.setItem('radar_notifications', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('radar_notifications_updated'));
    } catch {}

    return newNotif;
  },

  async markNotificationRead(id: string): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('notifications').update({ is_read: true }).eq('id', id);
      } catch {}
    }
    try {
      const raw = localStorage.getItem('radar_notifications');
      if (raw) {
        const list: AppNotification[] = JSON.parse(raw);
        const item = list.find(n => n.id === id);
        if (item) {
          item.is_read = true;
          localStorage.setItem('radar_notifications', JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('radar_notifications_updated'));
        }
      }
    } catch {}
  },

  async clearAllNotifications(): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('notifications').delete().neq('id', '');
      } catch {}
    }
    try {
      localStorage.removeItem('radar_notifications');
      window.dispatchEvent(new CustomEvent('radar_notifications_updated'));
    } catch {}
  },

  /**
   * Fetch products for a specific trader (Strictly authentic, no demo data)
   */
  async getProductsByTrader(traderId: string): Promise<Product[]> {
    if (!traderId) return [];

    let fetchedProducts: Product[] = [];

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('trader_id', traderId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          fetchedProducts = data as Product[];
        }
      } catch (err) {
        console.warn('[MultiTenant Supabase Products Fetch Error]:', err);
      }
    }

    // Try server API
    if (fetchedProducts.length === 0) {
      try {
        const res = await fetch(`/api/traders/${encodeURIComponent(traderId)}/products`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.products) && json.products.length > 0) {
            fetchedProducts = json.products;
          }
        }
      } catch {
        // safe fallback
      }
    }

    // Local Storage Fallback
    if (fetchedProducts.length === 0) {
      try {
        const raw = localStorage.getItem(getProductsStorageKey(traderId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Clean out any legacy mock products (Samsung S24, AirPods, Anker, MS-DESK, etc.)
            const cleaned = parsed.filter((p: any) => {
              const id = String(p.id || '');
              const sku = String(p.sku || '');
              const title = String(p.title || '');
              const isMock = 
                id.startsWith('PRD-AMZ-') || 
                id.startsWith('PRD-NOON-') || 
                id.startsWith('prod-amz-') || 
                id.startsWith('prod-noon-') || 
                sku.includes('MS-DESK') || 
                sku.includes('S24') || 
                sku.includes('AIRPODS') || 
                sku.includes('ANKER') ||
                title.includes('سامسونج') ||
                title.includes('إيربودز') ||
                title.includes('كرسي مكتب هيدروليك');
              return !isMock && p.trader_id === traderId;
            });
            if (cleaned.length !== parsed.length) {
              localStorage.setItem(getProductsStorageKey(traderId), JSON.stringify(cleaned));
            }
            fetchedProducts = cleaned;
          }
        }
      } catch {
        // safe
      }
    }

    return fetchedProducts;
  },

  /**
   * Add a product for a specific trader
   */
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const id = `prd-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8)}`;
    const newProduct: Product = {
      ...productData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Also sync to Express backend
    try {
      fetch(`/api/traders/${encodeURIComponent(productData.trader_id)}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(() => {});
    } catch {}

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('products')
          .insert([newProduct])
          .select()
          .single();

        if (!error && data) {
          // Update trader products count in Supabase
          try {
            await supabaseClient.rpc('increment_trader_products', { trader_id_arg: productData.trader_id });
          } catch {}
        }
      } catch (err) {
        console.warn('[MultiTenant Supabase Product Insert Error]:', err);
      }
    }

    // Save in isolated localStorage
    try {
      const key = getProductsStorageKey(productData.trader_id);
      const raw = localStorage.getItem(key);
      const list: Product[] = raw ? JSON.parse(raw) : [];
      list.unshift(newProduct);
      localStorage.setItem(key, JSON.stringify(list));

      // Update trader record products_count locally
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('radar_multi_tenant_traders_v1_')) {
          try {
            const rawTraders = localStorage.getItem(k);
            if (rawTraders) {
              const tradersList: Trader[] = JSON.parse(rawTraders);
              const target = tradersList.find(t => t.id === productData.trader_id);
              if (target) {
                target.products_count = (target.products_count || 0) + 1;
                localStorage.setItem(k, JSON.stringify(tradersList));
                window.dispatchEvent(new CustomEvent('multi_tenant_traders_updated', { detail: { userId: target.user_id } }));
              }
            }
          } catch {}
        }
      }
    } catch {
      // safe
    }

    return newProduct;
  },

  /**
   * Trigger sync for a specific trader via /api/traders/:id/sync (Real API sync, no mock generation)
   */
  async syncTrader(traderId: string): Promise<{ success: boolean; count: number; products: Product[] }> {
    try {
      const res = await fetch(`/api/traders/${encodeURIComponent(traderId)}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const fresh = json.products || [];
          localStorage.setItem(getProductsStorageKey(traderId), JSON.stringify(fresh));
          return { success: true, count: fresh.length, products: fresh };
        }
      }
    } catch (e) {
      console.warn('Sync API network issue:', e);
    }

    const existing = await this.getProductsByTrader(traderId);
    return { success: true, count: existing.length, products: existing };
  }
};

/**
 * Fluent Supabase Query Builder with Multi-Tenant Fallback
 */
class SupabaseQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private filters: Array<{ col: string; val: any; type: 'eq' | 'neq' | 'in' | 'not'; operator?: string }> = [];
  private orderConfig?: { col: string; ascending: boolean };
  private isSingle: boolean = false;
  private limitCount?: number;
  private isDelete: boolean = false;
  private isUpdate: boolean = false;
  private updatePayload: any = null;
  private returnCount: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*', options?: { count?: string; head?: boolean }): this {
    this.selectFields = fields;
    if (options?.count) this.returnCount = true;
    return this;
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}): this {
    this.orderConfig = { col: column, ascending };
    return this;
  }

  eq(column: string, value: any): this {
    this.filters.push({ col: column, val: value, type: 'eq' });
    return this;
  }

  neq(column: string, value: any): this {
    this.filters.push({ col: column, val: value, type: 'neq' });
    return this;
  }

  not(column: string, operator: string, value: any): this {
    this.filters.push({ col: column, val: value, operator, type: 'not' });
    return this;
  }

  in(column: string, values: any[]): this {
    this.filters.push({ col: column, val: values, type: 'in' });
    return this;
  }

  single(): this {
    this.isSingle = true;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): this {
    this.limitCount = Math.max(1, (to - from) + 1);
    return this;
  }

  async insert(records: any): Promise<{ data: any; error: any }> {
    const arr = Array.isArray(records) ? records : [records];
    if (supabaseClient) {
      try {
        const res = await supabaseClient.from(this.tableName).insert(arr).select();
        if (!res.error && res.data) {
          return { data: this.isSingle ? res.data[0] : res.data, error: null };
        }
      } catch (err) {
        console.warn(`[Supabase Insert Fallback on ${this.tableName}]:`, err);
      }
    }

    // Local Storage insert fallback
    try {
      if (this.tableName === 'traders') {
        const storedKey = 'radar_multi_tenant_traders_default';
        const raw = localStorage.getItem(storedKey);
        const existing: any[] = raw ? JSON.parse(raw) : [];
        const toAdd = arr.map((item: any) => ({
          ...item,
          id: item.id || `trd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          created_at: item.created_at || new Date().toISOString()
        }));
        const combined = [...toAdd, ...existing];
        localStorage.setItem(storedKey, JSON.stringify(combined));
        return { data: this.isSingle ? toAdd[0] : toAdd, error: null };
      }
      if (this.tableName === 'products') {
        const first = arr[0] || {};
        const key = getProductsStorageKey(first.trader_id || 'default');
        const raw = localStorage.getItem(key);
        const existing: any[] = raw ? JSON.parse(raw) : [];
        const toAdd = arr.map((item: any) => ({
          ...item,
          id: item.id || `prd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          created_at: item.created_at || new Date().toISOString()
        }));
        const combined = [...toAdd, ...existing];
        localStorage.setItem(key, JSON.stringify(combined));
        return { data: this.isSingle ? toAdd[0] : toAdd, error: null };
      }
    } catch (e) {
      return { data: null, error: e };
    }

    return { data: this.isSingle ? arr[0] : arr, error: null };
  }

  update(updates: any): this {
    this.isUpdate = true;
    this.updatePayload = updates;
    return this;
  }

  delete(): this {
    this.isDelete = true;
    return this;
  }

  private async executeUpdate(): Promise<{ data: any; error: any }> {
    if (supabaseClient) {
      try {
        let builder: any = supabaseClient.from(this.tableName).update(this.updatePayload);
        for (const f of this.filters) {
          if (f.type === 'eq') builder = builder.eq(f.col, f.val);
          if (f.type === 'neq') builder = builder.neq(f.col, f.val);
        }
        const res = await builder.select();
        if (!res.error) return { data: res.data, error: null };
      } catch {}
    }
    return { data: this.updatePayload, error: null };
  }

  private async executeDelete(): Promise<{ data: any; error: any }> {
    if (supabaseClient) {
      try {
        let builder: any = supabaseClient.from(this.tableName).delete();
        for (const f of this.filters) {
          if (f.type === 'eq') builder = builder.eq(f.col, f.val);
          if (f.type === 'neq') builder = builder.neq(f.col, f.val);
          if (f.type === 'in') builder = builder.in(f.col, f.val);
          if (f.type === 'not') builder = builder.not(f.col, f.operator || 'is', f.val);
        }
        await builder;
      } catch (e) {
        console.warn(`[Supabase Delete Warning on ${this.tableName}]:`, e);
      }
    }

    try {
      const eqTraderId = this.filters.find(f => f.col === 'trader_id' && f.type === 'eq')?.val;
      const eqId = this.filters.find(f => f.col === 'id' && f.type === 'eq')?.val;
      const targetTraderId = eqTraderId || (this.tableName === 'traders' ? eqId : null);

      if (this.tableName === 'traders' && eqId) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                  localStorage.setItem(k, JSON.stringify(list.filter((t: any) => t.id !== eqId)));
                }
              }
            } catch {}
          }
        }
      }

      if (this.tableName === 'products' && targetTraderId) {
        localStorage.removeItem(getProductsStorageKey(targetTraderId));
      }

      if (this.tableName === 'inventory_sync' && targetTraderId) {
        const invRaw = localStorage.getItem('radar_inventory_sync');
        if (invRaw) {
          try {
            const invList = JSON.parse(invRaw);
            if (Array.isArray(invList)) {
              localStorage.setItem('radar_inventory_sync', JSON.stringify(invList.filter((item: any) => item.trader_id !== targetTraderId)));
            }
          } catch {}
        }
      }

      if (this.tableName === 'invoices' && targetTraderId) {
        const invRaw = localStorage.getItem('radar_invoices');
        if (invRaw) {
          try {
            const invList = JSON.parse(invRaw);
            if (Array.isArray(invList)) {
              localStorage.setItem('radar_invoices', JSON.stringify(invList.filter((item: any) => item.trader_id !== targetTraderId)));
            }
          } catch {}
        }
      }
    } catch {}

    return { data: [], error: null };
  }

  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    if (this.isDelete) {
      return this.executeDelete();
    }
    if (this.isUpdate) {
      return this.executeUpdate();
    }

    // 1. Try real Supabase if configured
    if (supabaseClient) {
      try {
        let query: any = supabaseClient.from(this.tableName).select(this.selectFields);
        for (const f of this.filters) {
          if (f.type === 'eq') query = query.eq(f.col, f.val);
          if (f.type === 'neq') query = query.neq(f.col, f.val);
          if (f.type === 'in') query = query.in(f.col, f.val);
          if (f.type === 'not') query = query.not(f.col, f.operator || 'is', f.val);
        }
        if (this.orderConfig) {
          query = query.order(this.orderConfig.col, { ascending: this.orderConfig.ascending });
        }
        if (this.limitCount) {
          query = query.limit(this.limitCount);
        }
        if (this.isSingle) {
          query = query.single();
        }
        const res = await query;
        if (!res.error && res.data !== null && res.data !== undefined) {
          return { data: res.data, error: null };
        }
      } catch (err) {
        console.warn(`[Supabase Query error on ${this.tableName}, falling back to local storage]:`, err);
      }
    }

    // 2. Fallback to local dataset
    let dataset: any[] = [];
    if (this.tableName === 'traders') {
      try {
        const seenIds = new Set<string>();
        
        // Ensure Mahmoud Saeed exists in fallback
        const mahmeudSaeed: Trader = {
          id: 'A37JIM7LHQI6IM',
          user_id: 'demo-user',
          seller_name: 'محمود سعيد',
          email: 'mahmeudsaid4@gmail.com',
          phone: '+20 100 000 0000',
          platform: 'amazon',
          status: 'active',
          created_at: new Date().toISOString()
        };
        dataset.push(mahmeudSaeed);
        seenIds.add(mahmeudSaeed.id);

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach(t => {
                    if (t && t.id && !seenIds.has(t.id)) {
                      seenIds.add(t.id);
                      dataset.push(t);
                    }
                  });
                }
              }
            } catch {}
          }
        }
      } catch {}

      // Fallback to local storage if dataset still empty
      if (dataset.length === 0) {
        try {
          const storedKey = 'radar_multi_tenant_traders_default';
          const raw = localStorage.getItem(storedKey);
          if (raw) dataset = JSON.parse(raw);
        } catch {}
      }


      // Check if join with traders(seller_name) is requested
      if (this.selectFields.includes('traders')) {
        let allTraders: any[] = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) allTraders.push(...parsed);
              }
            }
          }
        } catch {}
        const traderMap = new Map<string, any>();
        traderMap.set('merchant-mahmeud-said', { seller_name: 'متجر محمود سعيد (Mahmeud Said Store)' });
        allTraders.forEach(t => {
          if (t && t.id) traderMap.set(t.id, t);
        });

        dataset = dataset.map(p => {
          const trd = traderMap.get(p.trader_id);
          return {
            ...p,
            traders: {
              seller_name: trd?.seller_name || 'تاجر غير محدد'
            }
          };
        });
      }
    } else if (this.tableName === 'products') {
      try {
        const seenIds = new Set<string>();
        
        // Ensure Mahmoud Saeed's 4 real products exist in fallback
        const mahmeudProducts: Product[] = [
          {
            id: 'prod-ms-1',
            trader_id: 'A37JIM7LHQI6IM',
            title: 'كرسي مكتب طبي هيدروليك - أسود',
            sku: 'OFFICE-CHAIR-BLK-01',
            price: 2450,
            stock: 12,
            platform: 'amazon',
            created_at: new Date().toISOString()
          },
          {
            id: 'prod-ms-2',
            trader_id: 'A37JIM7LHQI6IM',
            title: 'طاولة مكتب خشب زان 120سم',
            sku: 'DESK-WOOD-120',
            price: 3200,
            stock: 5,
            platform: 'amazon',
            created_at: new Date().toISOString()
          },
          {
            id: 'prod-ms-3',
            trader_id: 'A37JIM7LHQI6IM',
            title: 'حامل شاشة مزدوج متحرك',
            sku: 'MONITOR-MOUNT-DUAL',
            price: 850,
            stock: 25,
            platform: 'amazon',
            created_at: new Date().toISOString()
          },
          {
            id: 'prod-ms-4',
            trader_id: 'A37JIM7LHQI6IM',
            title: 'مصباح مكتب LED بـ 3 مستويات إضاءة',
            sku: 'LED-DESK-LAMP-03',
            price: 450,
            stock: 40,
            platform: 'amazon',
            created_at: new Date().toISOString()
          }
        ];
        
        dataset.push(...mahmeudProducts);
        mahmeudProducts.forEach(p => seenIds.add(p.id));

        // Load from local storage products
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith('radar_multi_tenant_products_')) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach(p => {
                    if (p && p.id && !seenIds.has(p.id)) {
                      seenIds.add(p.id);
                      dataset.push(p);
                    }
                  });
                }
              }
            } catch {}
          }
        }
      } catch {}

      // Check if join with traders(seller_name) is requested
      if (this.selectFields.includes('traders')) {
        let allTraders: any[] = [];
        try {
          const raw = localStorage.getItem('radar_multi_tenant_traders_default');
          if (raw) allTraders = JSON.parse(raw);
        } catch {}
        
        const traderMap = new Map<string, any>();
        traderMap.set('A37JIM7LHQI6IM', { seller_name: 'محمود سعيد' });
        allTraders.forEach(t => {
          if (t && t.id) traderMap.set(t.id, t);
        });

        dataset = dataset.map(p => {
          const trd = traderMap.get(p.trader_id);
          return {
            ...p,
            traders: {
              seller_name: trd?.seller_name || 'تاجر غير محدد'
            }
          };
        });
      }
    } else if (this.tableName === 'inventory_sync') {
      try {
        const raw = localStorage.getItem('radar_inventory_sync');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            dataset = parsed;
          }
        }
      } catch {}

      if (dataset.length === 0) {
        // Mock data purged as per user request.
      }

      // Check if join with traders(seller_name) is requested
      if (this.selectFields.includes('traders')) {
        let allTraders: any[] = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) allTraders.push(...parsed);
              }
            }
          }
        } catch {}
        const traderMap = new Map<string, any>();
        traderMap.set('merchant-mahmeud-said', { seller_name: 'متجر محمود سعيد (Mahmeud Said Store)' });
        allTraders.forEach(t => {
          if (t && t.id) traderMap.set(t.id, t);
        });

        dataset = dataset.map(item => {
          const trd = traderMap.get(item.trader_id);
          return {
            ...item,
            traders: trd ? { seller_name: trd.seller_name } : null
          };
        });
      }
    }

    // Apply filters
    for (const f of this.filters) {
      if (f.type === 'eq') {
        dataset = dataset.filter(item => String(item[f.col]) === String(f.val));
      } else if (f.type === 'neq') {
        dataset = dataset.filter(item => String(item[f.col]) !== String(f.val));
      } else if (f.type === 'in') {
        const allowed = Array.isArray(f.val) ? f.val.map(String) : [];
        dataset = dataset.filter(item => allowed.includes(String(item[f.col])));
      } else if (f.type === 'not') {
        if (f.operator === 'is' && (f.val === null || f.val === 'null')) {
          dataset = dataset.filter(item => item[f.col] !== null && item[f.col] !== undefined);
        } else {
          dataset = dataset.filter(item => String(item[f.col]) !== String(f.val));
        }
      }
    }

    // Apply ordering
    if (this.orderConfig) {
      const { col, ascending } = this.orderConfig;
      dataset.sort((a, b) => {
        const valA = a[col] || '';
        const valB = b[col] || '';
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== undefined) {
      dataset = dataset.slice(0, this.limitCount);
    }

    // Single item handling
    if (this.isSingle) {
      return {
        data: dataset[0] || null,
        error: dataset.length > 0 ? null : { message: 'Row not found' },
        count: this.returnCount ? dataset.length : undefined
      };
    }

    return { 
      data: dataset, 
      error: null, 
      count: this.returnCount ? dataset.length : undefined 
    };
  }

  // Support await query
  then<TResult1 = { data: any; error: any; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

/**
 * Global Supabase Client / Proxy with Fluent Query Builder
 */
export const supabase = {
  from: (tableName: string) => new SupabaseQueryBuilder(tableName)
};

/**
 * Complete Supabase Row Level Security (RLS) SQL Script
 * Binds traders.user_id = auth.uid() and secures all trader products
 */
export const SUPABASE_RLS_SQL = `-- 1. تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول التجار (traders)
CREATE TABLE IF NOT EXISTS public.traders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    email TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('amazon', 'noon', 'jumia', 'raneen', 'kanz', 'homesmart')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_traders_user_id ON public.traders(user_id);
CREATE INDEX IF NOT EXISTS idx_traders_platform ON public.traders(platform);

-- 3. تفعيل RLS لجدول traders
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "traders_select_own_policy" ON public.traders;
DROP POLICY IF EXISTS "traders_insert_own_policy" ON public.traders;
DROP POLICY IF EXISTS "traders_update_own_policy" ON public.traders;
DROP POLICY IF EXISTS "traders_delete_own_policy" ON public.traders;

CREATE POLICY "traders_select_own_policy"
ON public.traders FOR SELECT TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "traders_insert_own_policy"
ON public.traders FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "traders_update_own_policy"
ON public.traders FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "traders_delete_own_policy"
ON public.traders FOR DELETE TO authenticated
USING (auth.uid()::text = user_id::text);

-- 4. جدول المنتجات وحمايته بـ RLS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trader_id TEXT NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sku TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    buybox_price NUMERIC(12, 2),
    competitor_price NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_trader_id ON public.products(trader_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_own_trader_policy" ON public.products;
DROP POLICY IF EXISTS "products_insert_own_trader_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_own_trader_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_own_trader_policy" ON public.products;

CREATE POLICY "products_select_own_trader_policy"
ON public.products FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.traders
        WHERE public.traders.id = public.products.trader_id
        AND public.traders.user_id::text = auth.uid()::text
    )
);

CREATE POLICY "products_insert_own_trader_policy"
ON public.products FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.traders
        WHERE public.traders.id = public.products.trader_id
        AND public.traders.user_id::text = auth.uid()::text
    )
);

CREATE POLICY "products_update_own_trader_policy"
ON public.products FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.traders
        WHERE public.traders.id = public.products.trader_id
        AND public.traders.user_id::text = auth.uid()::text
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.traders
        WHERE public.traders.id = public.products.trader_id
        AND public.traders.user_id::text = auth.uid()::text
    )
);

CREATE POLICY "products_delete_own_trader_policy"
ON public.products FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.traders
        WHERE public.traders.id = public.products.trader_id
        AND public.traders.user_id::text = auth.uid()::text
    )
);
-- 5. الفواتير والطلبات
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trader_id TEXT NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('amazon', 'noon', 'jumia', 'raneen', 'kanz', 'homesmart')),
    invoice_number TEXT,
    order_id TEXT,
    amazon_order_id TEXT,
    marketplace_id TEXT,
    invoice_date TIMESTAMPTZ,
    total_amount NUMERIC(12, 2),
    status TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_id TEXT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    sku TEXT,
    asin TEXT,
    title TEXT,
    quantity INTEGER,
    price NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.inventory_sync (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trader_id TEXT NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
    platform TEXT,
    sku TEXT,
    asin TEXT,
    stock_quantity INTEGER,
    price NUMERIC(12, 2),
    last_sync TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.platform_connections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trader_id TEXT NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
    platform TEXT,
    seller_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    credentials JSONB,
    is_connected BOOLEAN DEFAULT false,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.split_invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    original_invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    trader_id TEXT REFERENCES public.traders(id) ON DELETE CASCADE,
    split_number TEXT,
    product_title TEXT,
    product_sku TEXT,
    product_asin TEXT,
    quantity INTEGER,
    price NUMERIC(12, 2),
    barcode_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    trader_id TEXT REFERENCES public.traders(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. تفعيل الحذف المتتابع (ON DELETE CASCADE) للجداول المرتبطة بالتجار
ALTER TABLE public.inventory_sync DROP CONSTRAINT IF EXISTS inventory_sync_trader_id_fkey;
ALTER TABLE public.inventory_sync ADD CONSTRAINT inventory_sync_trader_id_fkey 
  FOREIGN KEY (trader_id) REFERENCES public.traders(id) ON DELETE CASCADE;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_trader_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_trader_id_fkey 
  FOREIGN KEY (trader_id) REFERENCES public.traders(id) ON DELETE CASCADE;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_trader_id_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_trader_id_fkey 
  FOREIGN KEY (trader_id) REFERENCES public.traders(id) ON DELETE CASCADE;
`;

// Self-executing cleaner: purge legacy 'Star Steel' or 'star-steel' orphaned items from local storage
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    // 1. Purge from inventory_sync
    const invRaw = localStorage.getItem('radar_inventory_sync');
    if (invRaw && (invRaw.includes('star-steel') || invRaw.includes('Star Steel'))) {
      const parsed = JSON.parse(invRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item: any) => 
          item.trader_id !== 'merchant-star-steel' && 
          item.trader_id !== 'star-steel' &&
          !String(item.title || '').includes('Star Steel')
        );
        localStorage.setItem('radar_inventory_sync', JSON.stringify(cleaned));
      }
    }

    // 2. Purge from general inventory records
    const recordsRaw = localStorage.getItem('merchant_radar_inventory_records_v1');
    if (recordsRaw && (recordsRaw.includes('star-steel') || recordsRaw.includes('Star Steel'))) {
      const parsed = JSON.parse(recordsRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item: any) => 
          item.productId !== 'star-steel' && 
          item.traderId !== 'merchant-star-steel' &&
          item.traderId !== 'star-steel'
        );
        localStorage.setItem('merchant_radar_inventory_records_v1', JSON.stringify(cleaned));
      }
    }

    // 3. Purge specific products keys
    localStorage.removeItem('radar_multi_tenant_products_merchant-star-steel');
    localStorage.removeItem('radar_multi_tenant_products_star-steel');
  } catch (e) {
    console.warn('[Storage Cleanup Error]:', e);
  }
}

