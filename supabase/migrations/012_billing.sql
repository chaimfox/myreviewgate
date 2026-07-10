-- Lightweight manual billing tracking — no payment gateway yet.
-- Pricing is negotiated per-store (not a fixed formula), so price is a free field.
alter table stores add column if not exists billing_price_monthly numeric;
alter table stores add column if not exists billing_cycle text check (billing_cycle in ('monthly','annual'));
alter table stores add column if not exists billing_status text default 'none'
  check (billing_status in ('none','active','overdue'));
alter table stores add column if not exists next_billing_date date;
alter table stores add column if not exists billing_notes text;
