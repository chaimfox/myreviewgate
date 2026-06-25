-- Custom links per store (up to 5)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_links jsonb DEFAULT '[]'::jsonb;

-- Blocked reason when super admin suspends a store
ALTER TABLE stores ADD COLUMN IF NOT EXISTS blocked_reason text;

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id    uuid        NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_type  text        NOT NULL, -- 'view' | 'click_google' | 'click_private' | 'click_custom'
  link_label  text,                 -- for click_custom: which link was clicked
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous customers) can insert events
CREATE POLICY "Anyone can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Store owner reads only their own events
CREATE POLICY "Store owner reads own analytics"
  ON analytics_events FOR SELECT
  USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- Super admin reads all events
CREATE POLICY "Super admin reads all analytics"
  ON analytics_events FOR SELECT
  USING (get_my_role() = 'super_admin');

-- Index for fast per-store time queries
CREATE INDEX IF NOT EXISTS analytics_events_store_created
  ON analytics_events (store_id, created_at DESC);
