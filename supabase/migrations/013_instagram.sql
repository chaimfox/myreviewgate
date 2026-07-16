-- Instagram Graph API connection (OAuth via linked Facebook Page).
create table if not exists instagram_oauth_tokens (
  store_id uuid primary key references stores(id) on delete cascade,
  access_token text not null,
  expires_at timestamptz not null,
  facebook_page_id text,
  instagram_business_id text,
  instagram_username text,
  updated_at timestamptz default now()
);

alter table stores add column if not exists instagram_followers integer;
alter table stores add column if not exists instagram_media_count integer;
