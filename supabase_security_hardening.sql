-- ============================================================================
-- RADAR EGYPT SECURITY HARDENING & RLS POLICIES (radaregypt.store)
-- Founder: jassmeinnour@gmail.com | Real Trader: mahmeudsaid4@gmail.com
-- Execute this script in Supabase SQL Editor.
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
WHERE sku IN ('OFFICE-CHAIR-BLK-01', 'DESK-WOOD-120', 'MONITOR-MOUNT-DUAL', 'LED-DESK-LAMP-03', 'ANK-65W-EG-01', 'CBL-TC-02')
   OR trader_id IS NULL
   OR TRIM(trader_id) = ''
   OR trader_id NOT IN (SELECT id FROM public.traders);

DELETE FROM public.traders
WHERE LOWER(COALESCE(email, gmail, '')) <> 'mahmeudsaid4@gmail.com'
  AND COALESCE(seller_id, '') <> 'A37JIM7LHQI6IM';

-- Ensure remaining real trader record has complete fields
UPDATE public.traders
SET
  gmail = COALESCE(NULLIF(gmail, ''), email, 'mahmeudsaid4@gmail.com'),
  email = COALESCE(NULLIF(email, ''), gmail, 'mahmeudsaid4@gmail.com'),
  seller_id = COALESCE(NULLIF(seller_id, ''), 'A37JIM7LHQI6IM'),
  destination_url = COALESCE(NULLIF(destination_url, ''), seller_link, 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM'),
  store_url = COALESCE(NULLIF(store_url, ''), storefront_link, 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM')
WHERE LOWER(COALESCE(email, gmail, '')) = 'mahmeudsaid4@gmail.com'
   OR seller_id = 'A37JIM7LHQI6IM';

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
