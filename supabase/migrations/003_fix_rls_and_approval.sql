-- ── 1. Fix infinite recursion ──────────────────────────────────
-- Use a SECURITY DEFINER function that bypasses RLS to check role
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Drop all old conflicting policies
drop policy if exists "Super admin reads all profiles" on public.profiles;
drop policy if exists "Super admin manages all stores" on public.stores;
drop policy if exists "Super admin reads all feedback" on public.feedback;
drop policy if exists "Store owners manage own stores" on public.stores;
drop policy if exists "Users can manage their own stores" on public.stores;
drop policy if exists "Public can read stores" on public.stores;

-- Profiles: read own
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "super admin reads all profiles"
  on public.profiles for select
  using (public.get_my_role() = 'super_admin');

-- ── 2. Add approval status to stores ───────────────────────────
alter table public.stores
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'));

-- ── 3. Stores policies ─────────────────────────────────────────
-- Public can read approved stores (for the customer scan page)
create policy "public reads approved stores"
  on public.stores for select
  using (status = 'approved');

-- Store owners manage their own stores
create policy "store owner manages own stores"
  on public.stores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Super admin manages ALL stores
create policy "super admin manages all stores"
  on public.stores for all
  using (public.get_my_role() = 'super_admin')
  with check (public.get_my_role() = 'super_admin');

-- ── 4. Feedback policies ────────────────────────────────────────
create policy "super admin reads all feedback"
  on public.feedback for select
  using (public.get_my_role() = 'super_admin');

-- ── 5. Add pending_store_id to profiles for signup flow ────────
alter table public.profiles
  add column if not exists pending_store_name text,
  add column if not exists pending_slug text,
  add column if not exists pending_google_url text,
  add column if not exists pending_owner_email text;
