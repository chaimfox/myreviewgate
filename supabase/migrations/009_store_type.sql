-- 009: Store type (single location vs chain) + location limit
alter table stores add column if not exists type text not null default 'single';
alter table stores add column if not exists max_locations integer not null default 1;
alter table stores add column if not exists location_slug_prefix text;
