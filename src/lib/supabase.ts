import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Trader {
  id: string;
  user_id: string;
  seller_name: string;
  email: string;
  phone: string;
  address?: string;
  platform: 'amazon' | 'noon' | 'jumia' | 'raneen' | 'kanz' | 'homesmart' | 'bayyaa' | string;
  status: 'active' | 'inactive';
  seller_ids?: Record<string, string>; // { amazon: '...', noon: '...' }
  api_keys?: Record<string, any>;   // { amazon: { clientId: '...', ... }, noon: '...' }
  created_at?: string;
  // UI helpers
  products_count?: number;
  total_stock?: number;
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

    // If still empty, return an empty array (no mock merchants)
    if (traders.length === 0) {
      traders = [];
      try {
        localStorage.setItem(getTradersStorageKey(userId), JSON.stringify(traders));
      } catch {}
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
        await supabaseClient
          .from('traders')
          .delete()
          .eq('id', traderId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[MultiTenant Supabase Delete Error]:', err);
      }
    }

    try {
      const key = getTradersStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const list: Trader[] = JSON.parse(raw);
        const filtered = list.filter(t => t.id !== traderId);
        localStorage.setItem(key, JSON.stringify(filtered));
        localStorage.removeItem(getProductsStorageKey(traderId));
        window.dispatchEvent(new CustomEvent('multi_tenant_traders_updated', { detail: { userId } }));
      }
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
 * Backward compatibility object for legacy calls
 */
export const supabase = {
  from: (tableName: string) => {
    return {
      select: async (query: string = '*'): Promise<{ data: any[]; error: any | null }> => {
        if (!isSupabaseConfigured) {
          return { data: [], error: null };
        }
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=${encodeURIComponent(query)}`, {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          });
          if (!res.ok) {
            return { data: [], error: null };
          }
          const data = await res.json();
          return { data: Array.isArray(data) ? data : [], error: null };
        } catch (err) {
          return { data: [], error: null };
        }
      },
      insert: async (records: any): Promise<{ data: any[]; error: any | null }> => {
        if (!isSupabaseConfigured) {
          return { data: Array.isArray(records) ? records : [records], error: null };
        }
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(records),
          });
          const data = await res.json();
          return { data: Array.isArray(data) ? data : [data], error: null };
        } catch {
          return { data: Array.isArray(records) ? records : [records], error: null };
        }
      },
      update: async (): Promise<{ data: any[]; error: any | null }> => {
        return { data: [], error: null };
      },
      delete: async (): Promise<{ data: any[]; error: any | null }> => {
        return { data: [], error: null };
      },
    };
  },
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
    platform TEXT NOT NULL CHECK (platform IN ('amazon', 'noon', 'jumia', 'raneen', 'kanz', 'homesmart', 'bayyaa')),
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
`;

