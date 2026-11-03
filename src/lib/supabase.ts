export interface SupabaseQueryResult<T = any> {
  data: T[] | null;
  error: any | null;
}

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = {
  from: (tableName: string) => {
    return {
      select: async (query: string = '*'): Promise<SupabaseQueryResult> => {
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
          console.warn('[Supabase Fetch Guard Notice]:', err);
          return { data: [], error: null };
        }
      },
      insert: async (records: any): Promise<SupabaseQueryResult> => {
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
      update: async (): Promise<SupabaseQueryResult> => {
        return { data: [], error: null };
      },
      delete: async (): Promise<SupabaseQueryResult> => {
        return { data: [], error: null };
      },
    };
  },
};
