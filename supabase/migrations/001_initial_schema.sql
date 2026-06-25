-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Stores table
create table public.stores (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  google_review_url text not null,
  owner_email text not null,
  logo_url text
);

-- Feedback table
create table public.feedback (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  store_id uuid references public.stores(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  customer_name text,
  customer_phone text,
  comment text not null
);

-- RLS: Enable but allow public inserts on feedback, authenticated reads on stores
alter table public.stores enable row level security;
alter table public.feedback enable row level security;

-- Stores: owners can CRUD their own stores
create policy "Users can manage their own stores"
  on public.stores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stores: anyone can read a store by slug (needed for the public scan page)
create policy "Public can read stores"
  on public.stores for select
  using (true);

-- Feedback: anyone can insert (customers submit without auth)
create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

-- Feedback: store owners can read feedback for their stores
create policy "Store owners can read their feedback"
  on public.feedback for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = feedback.store_id
        and stores.user_id = auth.uid()
    )
  );
