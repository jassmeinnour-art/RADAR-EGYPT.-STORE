import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

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
  destination_url?: string;
  storefront_link?: string;
  store_url?: string;
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

let activeAuthenticatedEmail: string | null = null;
let activeAccessToken: string | null = null;

// Real Supabase JS Client instance if credentials are valid
export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const headers = new Headers(init?.headers || {});
          const urlStr =
            typeof input === 'string'
              ? input
              : input instanceof URL
              ? input.toString()
              : input.url;
          const isApiCall =
            urlStr.includes('/rest/v1/') ||
            urlStr.includes('/rpc/') ||
            urlStr.includes('/functions/v1/');
          if (isApiCall && activeAccessToken) {
            const currentAuth = headers.get('Authorization') || headers.get('authorization') || '';
            if (!currentAuth || currentAuth === `Bearer ${SUPABASE_ANON_KEY}`) {
              headers.set('Authorization', `Bearer ${activeAccessToken}`);
            }
          }
          if (!init?.signal && typeof AbortController !== 'undefined') {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);
            return fetch(input, { ...init, headers, signal: controller.signal }).finally(() =>
              clearTimeout(timer)
            );
          }
          return fetch(input, { ...init, headers });
        },
      },
    })
  : null;

const FOUNDER_EMAIL = 'jassmeinnour@gmail.com';
const DEMO_SKUS = new Set([
  'OFFICE-CHAIR-BLK-01',
  'DESK-WOOD-120',
  'MONITOR-MOUNT-DUAL',
  'LED-DESK-LAMP-03',
  'ANK-65W-EG-01',
  'CBL-TC-02',
]);
const PROTECTED_TABLES = new Set([
  'traders',
  'products',
  'invoices',
  'invoice_items',
  'inventory_sync',
  'platform_connections',
  'split_invoices',
  'notifications',
]);

export function setSupabaseSession(session: Session | null): void {
  activeAccessToken = session?.access_token || null;
  activeAuthenticatedEmail = session?.user?.email
    ? session.user.email.trim().toLowerCase()
    : null;
  if (supabaseClient?.realtime) {
    try {
      supabaseClient.realtime.setAuth(session?.access_token || SUPABASE_ANON_KEY);
    } catch {
      // safe
    }
  }
}

// Keep activeAccessToken & activeAuthenticatedEmail synced whenever Supabase refreshes or updates session
if (supabaseClient) {
  try {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
    });
  } catch {
    // safe
  }
}

export async function getActiveSupabaseSession(timeoutMs = 2000): Promise<Session | null> {
  if (!supabaseClient) return null;
  try {
    const timeout = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), timeoutMs)
    );
    const result: any = await Promise.race([supabaseClient.auth.getSession(), timeout]);
    const session: Session | null = result?.data?.session || null;
    if (session?.access_token) {
      setSupabaseSession(session);
    } else if (!activeAccessToken) {
      setSupabaseSession(null);
    }
    return session;
  } catch {
    return null;
  }
}

export async function signInWithSupabasePassword(email: string, password: string) {
  if (!supabaseClient) {
    return { data: { user: null, session: null }, error: { message: 'Supabase is not configured' } };
  }
  const cleanEmail = email.trim().toLowerCase();
  const res = await supabaseClient.auth.signInWithPassword({ email: cleanEmail, password });
  if (!res.error && res.data?.session) {
    setSupabaseSession(res.data.session);
  }
  return res;
}

export async function signUpWithSupabasePassword(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  if (!supabaseClient) {
    return { data: { user: null, session: null }, error: { message: 'Supabase is not configured' } };
  }
  const cleanEmail = email.trim().toLowerCase();
  const res = await supabaseClient.auth.signUp({
    email: cleanEmail,
    password,
    options: metadata ? { data: metadata } : undefined,
  });
  if (!res.error && res.data?.session) {
    setSupabaseSession(res.data.session);
  }
  return res;
}

export async function signOutSupabase(): Promise<void> {
  setSupabaseSession(null);
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch {
      // safe
    }
  }
}

export function setSupabaseActiveEmail(email: string | null): void {
  activeAuthenticatedEmail = email ? email.trim().toLowerCase() : null;
  if (!email) {
    activeAccessToken = null;
  }
}

export function getSupabaseActiveEmail(): string | null {
  if (activeAuthenticatedEmail) return activeAuthenticatedEmail;
  if (typeof window !== 'undefined' && !isSupabaseConfigured) {
    try {
      const demoRaw = localStorage.getItem('merchant_radar_demo_user');
      if (demoRaw) {
        const parsed = JSON.parse(demoRaw);
        if (parsed?.email) return String(parsed.email).trim().toLowerCase();
      }
      const override = localStorage.getItem('merchant_radar_session_email_override');
      if (override) return override.trim().toLowerCase();
    } catch {
      // safe
    }
  }
  return null;
}

export function isFounderSession(): boolean {
  return getSupabaseActiveEmail() === FOUNDER_EMAIL;
}

export function isDemoOrOrphanProduct(p: any): boolean {
  if (!p) return true;
  const id = String(p.id || '');
  const sku = String(p.sku || '').trim().toUpperCase();
  const title = String(p.title || '');
  const traderId = String(p.trader_id || '').trim();
  if (!traderId) return true;
  if (DEMO_SKUS.has(sku)) return true;
  if (
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
    title.includes('كرسي مكتب هيدروليك')
  ) {
    return true;
  }
  return false;
}

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
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) return [];
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
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) return [];
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
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) return [];
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
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) return [];
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
    if (supabaseClient) {
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) return [];
    }
    const activeEmail = getSupabaseActiveEmail();
    if (!traderId || !activeEmail) return [];

    let fetchedProducts: Product[] = [];

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('trader_id', traderId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          fetchedProducts = (data as Product[]).filter(p => !isDemoOrOrphanProduct(p));
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
            fetchedProducts = (json.products as Product[]).filter(p => !isDemoOrOrphanProduct(p));
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
            const cleaned = parsed.filter((p: any) => !isDemoOrOrphanProduct(p) && p.trader_id === traderId);
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
  private rangeConfig?: { from: number; to: number };
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
    this.rangeConfig = { from, to };
    this.limitCount = Math.max(1, (to - from) + 1);
    return this;
  }

  async insert(records: any): Promise<{ data: any; error: any }> {
    if (supabaseClient && PROTECTED_TABLES.has(this.tableName)) {
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) {
        return { data: null, error: { message: 'Unauthorized: active session required' } };
      }
    }
    const activeEmail = getSupabaseActiveEmail();
    if (PROTECTED_TABLES.has(this.tableName) && !activeEmail) {
      return { data: null, error: { message: 'Unauthorized: authentication required' } };
    }

    const rawArr = Array.isArray(records) ? records : [records];
    const arr = this.tableName === 'products' ? rawArr.filter(p => !isDemoOrOrphanProduct(p)) : rawArr;
    if (arr.length === 0) {
      return { data: this.isSingle ? null : [], error: null };
    }

    if (supabaseClient) {
      try {
        const res = await supabaseClient.from(this.tableName).insert(arr).select();
        if (!res.error && res.data) {
          return { data: this.isSingle ? res.data[0] : res.data, error: null };
        }
        if (res.error) {
          return { data: null, error: res.error };
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
    if (supabaseClient && PROTECTED_TABLES.has(this.tableName)) {
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) {
        return { data: null, error: { message: 'Unauthorized: active session required' } };
      }
    }
    const activeEmail = getSupabaseActiveEmail();
    if (PROTECTED_TABLES.has(this.tableName) && !activeEmail) {
      return { data: null, error: { message: 'Unauthorized: authentication required' } };
    }

    if (supabaseClient) {
      try {
        let builder: any = supabaseClient.from(this.tableName).update(this.updatePayload);
        for (const f of this.filters) {
          if (f.type === 'eq') builder = builder.eq(f.col, f.val);
          if (f.type === 'neq') builder = builder.neq(f.col, f.val);
        }
        const res = await builder.select();
        if (!res.error && res.data && res.data.length > 0) {
          return { data: this.isSingle ? res.data[0] : res.data, error: null };
        }
        if (res.error) {
          return { data: null, error: res.error };
        }
      } catch {}
    }

    // Also update localStorage fallback so edits remain consistent
    const eqId = this.filters.find(f => f.col === 'id' && f.type === 'eq')?.val;
    let updatedRow: any = this.updatePayload;
    if (this.tableName === 'traders' && eqId) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('radar_multi_tenant_traders_') || k.includes('traders'))) {
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) continue;
            let modified = false;
            const nextList = list.map((t: any) => {
              if (t && String(t.id) === String(eqId)) {
                const ownerEmail = String(t.email || t.gmail || '').trim().toLowerCase();
                if (activeEmail === FOUNDER_EMAIL || ownerEmail === activeEmail) {
                  modified = true;
                  updatedRow = { ...t, ...this.updatePayload };
                  return updatedRow;
                }
              }
              return t;
            });
            if (modified) {
              localStorage.setItem(k, JSON.stringify(nextList));
            }
          }
        }
      } catch {}
    }

    return { data: this.isSingle ? updatedRow : [updatedRow], error: null };
  }

  private async executeDelete(): Promise<{ data: any; error: any }> {
    if (supabaseClient && PROTECTED_TABLES.has(this.tableName)) {
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) {
        return { data: null, error: { message: 'Unauthorized: active session required' } };
      }
    }
    const activeEmail = getSupabaseActiveEmail();
    if (PROTECTED_TABLES.has(this.tableName) && !activeEmail) {
      return { data: null, error: { message: 'Unauthorized: authentication required' } };
    }

    if (supabaseClient) {
      try {
        let builder: any = supabaseClient.from(this.tableName).delete();
        for (const f of this.filters) {
          if (f.type === 'eq') builder = builder.eq(f.col, f.val);
          if (f.type === 'neq') builder = builder.neq(f.col, f.val);
          if (f.type === 'in') builder = builder.in(f.col, f.val);
          if (f.type === 'not') builder = builder.not(f.col, f.operator || 'is', f.val);
        }
        const res = await builder;
        if (res?.error) {
          return { data: null, error: res.error };
        }
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

    // Strict Session Verification: NEVER query protected Supabase tables without an active user access_token
    if (supabaseClient && PROTECTED_TABLES.has(this.tableName)) {
      const session = activeAccessToken ? { access_token: activeAccessToken } : await getActiveSupabaseSession(2000);
      if (!session?.access_token) {
        return {
          data: this.isSingle ? null : [],
          error: { message: 'Unauthorized: active session required' },
          count: 0,
        };
      }
    }

    const activeEmail = getSupabaseActiveEmail();

    // Enforce authentication for all protected tables
    if (PROTECTED_TABLES.has(this.tableName) && !activeEmail) {
      return {
        data: this.isSingle ? null : [],
        error: { message: 'Unauthorized: authentication required' },
        count: 0,
      };
    }

    const isFounder = activeEmail === FOUNDER_EMAIL;

    // Resolve allowed trader IDs for non-founder isolation
    const getAllowedTraderIds = (): Set<string> => {
      const allowed = new Set<string>();
      if (activeEmail === 'mahmeudsaid4@gmail.com') {
        allowed.add('A37JIM7LHQI6IM');
      }
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('radar_multi_tenant_traders_') || k === 'radar_multi_tenant_traders_default')) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach((t: any) => {
                    const tEmail = String(t?.email || t?.gmail || '').trim().toLowerCase();
                    if (t?.id && tEmail && tEmail === activeEmail) {
                      allowed.add(String(t.id));
                    }
                  });
                }
              }
            } catch {}
          }
        }
      }
      return allowed;
    };

    // 1. Try real Supabase if configured
    if (supabaseClient) {
      try {
        let query: any = this.returnCount
          ? supabaseClient.from(this.tableName).select(this.selectFields, { count: 'exact' })
          : supabaseClient.from(this.tableName).select(this.selectFields);
        for (const f of this.filters) {
          if (f.type === 'eq') query = query.eq(f.col, f.val);
          if (f.type === 'neq') query = query.neq(f.col, f.val);
          if (f.type === 'in') query = query.in(f.col, f.val);
          if (f.type === 'not') query = query.not(f.col, f.operator || 'is', f.val);
        }
        if (this.orderConfig) {
          query = query.order(this.orderConfig.col, { ascending: this.orderConfig.ascending });
        }
        if (this.rangeConfig) {
          query = query.range(this.rangeConfig.from, this.rangeConfig.to);
        } else if (this.limitCount) {
          query = query.limit(this.limitCount);
        }
        if (this.isSingle) {
          query = query.single();
        }
        const queryTimeout = new Promise<any>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Query timeout' } }), 8000)
        );
        const res = await Promise.race([query, queryTimeout]);
        if (!res.error && res.data !== null && res.data !== undefined) {
          let safeData = res.data;
          // Defense-in-depth client-side filtering (purge demo SKUs & enforce trader row isolation)
          if (Array.isArray(safeData)) {
            if (this.tableName === 'products') {
              safeData = safeData.filter((p: any) => !isDemoOrOrphanProduct(p));
              if (!isFounder) {
                const allowedIds = getAllowedTraderIds();
                safeData = safeData.filter((p: any) => allowedIds.has(String(p.trader_id)));
              }
            } else if (this.tableName === 'traders' && !isFounder) {
              safeData = safeData.filter((t: any) => {
                const tEmail = String(t?.email || t?.gmail || '').trim().toLowerCase();
                return tEmail === activeEmail;
              });
            }
          }
          return {
            data: safeData,
            error: null,
            count: typeof res.count === 'number' ? (Array.isArray(safeData) ? Math.min(res.count, safeData.length || res.count) : res.count) : undefined,
          };
        }
        // If RLS denied (401/403/42501), return empty cleanly instead of leaking local fallback
        if (res.error) {
          const msg = String(res.error?.message || '').toLowerCase();
          if (
            res.error?.code === '42501' ||
            res.error?.code === 'PGRST301' ||
            msg.includes('jwt') ||
            msg.includes('permission') ||
            msg.includes('unauthorized')
          ) {
            return {
              data: this.isSingle ? null : [],
              error: res.error,
              count: 0,
            };
          }
        }
      } catch (err) {
        console.warn(`[Supabase Query error on ${this.tableName}, falling back to local storage]:`, err);
      }
    }

    // 2. Fallback to local dataset (strictly isolated & purged of demo data)
    let dataset: any[] = [];
    if (this.tableName === 'traders') {
      try {
        const seenIds = new Set<string>();

        // Only expose Mahmoud Saeed real trader record to Founder or Mahmoud Saeed himself
        if (isFounder || activeEmail === 'mahmeudsaid4@gmail.com') {
          const mahmeudSaeed: Trader = {
            id: 'A37JIM7LHQI6IM',
            user_id: 'mahmeudsaid4',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            gmail: 'mahmeudsaid4@gmail.com',
            phone: '+20 100 000 0000',
            platform: 'amazon',
            seller_id: 'A37JIM7LHQI6IM',
            destination_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            seller_link: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            store_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            storefront_link: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
            status: 'active',
            created_at: new Date().toISOString()
          };
          dataset.push(mahmeudSaeed);
          seenIds.add(mahmeudSaeed.id);
        }

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('radar_multi_tenant_traders_') || k === 'radar_multi_tenant_traders_default')) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach(t => {
                    if (!t || !t.id || seenIds.has(t.id)) return;
                    const tEmail = String(t.email || t.gmail || '').trim().toLowerCase();
                    if (!tEmail || String(t.id).includes('star-steel')) return;
                    if (!isFounder && tEmail !== activeEmail) return;
                    seenIds.add(t.id);
                    dataset.push(t);
                  });
                }
              }
            } catch {}
          }
        }
      } catch {}
    } else if (this.tableName === 'products') {
      try {
        const seenIds = new Set<string>();
        const allowedIds = !isFounder ? getAllowedTraderIds() : null;

        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith('radar_multi_tenant_products_')) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  const cleanList = parsed.filter((p: any) => !isDemoOrOrphanProduct(p));
                  if (cleanList.length !== parsed.length) {
                    localStorage.setItem(k, JSON.stringify(cleanList));
                  }
                  cleanList.forEach(p => {
                    if (!p || !p.id || seenIds.has(p.id)) return;
                    if (allowedIds && !allowedIds.has(String(p.trader_id))) return;
                    seenIds.add(p.id);
                    dataset.push(p);
                  });
                }
              }
            } catch {}
          }
        }
      } catch {}

      if (this.selectFields.includes('traders')) {
        const traderMap = new Map<string, any>();
        traderMap.set('A37JIM7LHQI6IM', { seller_name: 'محمود سعيد' });
        dataset = dataset.map(p => {
          const trd = traderMap.get(p.trader_id);
          return {
            ...p,
            traders: {
              seller_name: trd?.seller_name || 'تاجر معتمد'
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
            const allowedIds = !isFounder ? getAllowedTraderIds() : null;
            dataset = parsed.filter((item: any) => {
              if (isDemoOrOrphanProduct(item)) return false;
              if (allowedIds && !allowedIds.has(String(item.trader_id))) return false;
              return true;
            });
          }
        }
      } catch {}
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

    const totalMatchedCount = dataset.length;

    // Apply range or limit
    if (this.rangeConfig) {
      dataset = dataset.slice(this.rangeConfig.from, this.rangeConfig.to + 1);
    } else if (this.limitCount !== undefined) {
      dataset = dataset.slice(0, this.limitCount);
    }

    // Single item handling
    if (this.isSingle) {
      return {
        data: dataset[0] || null,
        error: dataset.length > 0 ? null : { message: 'Row not found' },
        count: this.returnCount ? totalMatchedCount : undefined
      };
    }

    return { 
      data: dataset, 
      error: null, 
      count: this.returnCount ? totalMatchedCount : undefined 
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
export const SUPABASE_RLS_SQL = `-- ============================================================================
-- RADAR EGYPT SECURITY HARDENING & RLS POLICIES (radaregypt.store)
-- Founder: jassmeinnour@gmail.com | Real Trader: mahmeudsaid4@gmail.com
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure complete schema columns exist on traders & products
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS gmail TEXT;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS seller_id TEXT;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS destination_url TEXT;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS store_url TEXT;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS seller_link TEXT;
ALTER TABLE public.traders ADD COLUMN IF NOT EXISTS storefront_link TEXT;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS asin TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_url TEXT;

-- 2. Purge all demo products, orphan rows, and demo traders
DELETE FROM public.products
WHERE sku IN ('OFFICE-CHAIR-BLK-01', 'DESK-WOOD-120', 'MONITOR-MOUNT-DUAL', 'LED-DESK-LAMP-03')
   OR trader_id IS NULL
   OR TRIM(trader_id) = ''
   OR trader_id NOT IN (SELECT id FROM public.traders);

DELETE FROM public.traders
WHERE LOWER(COALESCE(email, gmail, '')) <> 'mahmeudsaid4@gmail.com'
  AND COALESCE(seller_id, '') <> 'A37JIM7LHQI6IM';

-- 3. Drop ALL existing open / "Allow all" policies across protected tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'traders', 'products', 'invoices', 'invoice_items',
        'inventory_sync', 'platform_connections', 'split_invoices', 'notifications'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 4. Revoke anonymous public access and lock down RLS
REVOKE ALL ON public.traders FROM anon;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.invoices FROM anon;
REVOKE ALL ON public.invoice_items FROM anon;
REVOKE ALL ON public.inventory_sync FROM anon;
REVOKE ALL ON public.platform_connections FROM anon;
REVOKE ALL ON public.split_invoices FROM anon;
REVOKE ALL ON public.notifications FROM anon;

ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sync FORCE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.split_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

-- 5. Founder (jassmeinnour@gmail.com) FULL ACCESS on all tables
CREATE POLICY "founder_all_traders" ON public.traders FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_products" ON public.products FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_invoices" ON public.invoices FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_invoice_items" ON public.invoice_items FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_inventory_sync" ON public.inventory_sync FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_platform_connections" ON public.platform_connections FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_split_invoices" ON public.split_invoices FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

CREATE POLICY "founder_all_notifications" ON public.notifications FOR ALL TO authenticated
  USING (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com')
  WITH CHECK (LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')) = 'jassmeinnour@gmail.com');

-- 6. Trader strict row-level isolation (READ / UPDATE own data ONLY)
CREATE POLICY "trader_select_own" ON public.traders FOR SELECT TO authenticated
  USING (LOWER(COALESCE(email, gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')));

CREATE POLICY "trader_update_own" ON public.traders FOR UPDATE TO authenticated
  USING (LOWER(COALESCE(email, gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')))
  WITH CHECK (LOWER(COALESCE(email, gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email')));

CREATE POLICY "trader_products_select_own" ON public.products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));

CREATE POLICY "trader_products_insert_own" ON public.products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));

CREATE POLICY "trader_products_update_own" ON public.products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));

CREATE POLICY "trader_invoices_select_own" ON public.invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));

CREATE POLICY "trader_invoices_update_own" ON public.invoices FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));

CREATE POLICY "trader_invoice_items_select_own" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i JOIN public.traders t ON t.id = i.trader_id
    WHERE i.id = invoice_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))
  ));

CREATE POLICY "trader_inventory_sync_own" ON public.inventory_sync FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));

CREATE POLICY "trader_notifications_own" ON public.notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.traders t WHERE t.id = trader_id AND LOWER(COALESCE(t.email, t.gmail)) = LOWER(COALESCE(auth.email(), auth.jwt() ->> 'email'))));
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

