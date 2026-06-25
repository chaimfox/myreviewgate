-- Profiles table (one per auth user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  role text not null check (role in ('super_admin', 'store_owner', 'customer')),
  full_name text,
  phone text,
  email text
);

-- Add customer_id to feedback to track who rated + prevent duplicates
alter table public.feedback
  add column if not exists customer_id uuid references auth.users(id);

-- One private complaint per customer per store
create unique index if not exists feedback_unique_customer_store
  on public.feedback(store_id, customer_id);

-- RLS
alter table public.profiles enable row level security;

-- Anyone can read their own profile
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Super admin can read all profiles
create policy "Super admin reads all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'full_name',
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Store owner can only select their own stores
drop policy if exists "Users can manage their own stores" on public.stores;
create policy "Store owners manage own stores"
  on public.stores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Super admin can manage ALL stores
create policy "Super admin manages all stores"
  on public.stores for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Super admin can read all feedback
create policy "Super admin reads all feedback"
  on public.feedback for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- =============================================
-- IMPORTANT: After running this migration,
-- set your own account as super_admin:
--
-- UPDATE public.profiles
-- SET role = 'super_admin'
-- WHERE email = 'YOUR-EMAIL-HERE';
-- =============================================
