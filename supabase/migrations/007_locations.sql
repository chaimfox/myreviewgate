-- 007: Multi-location support

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  address text,
  google_place_id text,
  google_rating numeric,
  google_review_count integer,
  nfc_scans integer not null default 0,
  created_at timestamptz default now()
);

alter table feedback add column if not exists location_id uuid references locations(id);
alter table analytics_events add column if not exists location_id uuid references locations(id);
alter table google_reviews add column if not exists location_id uuid references locations(id);
alter table profiles add column if not exists location_id uuid references locations(id);
