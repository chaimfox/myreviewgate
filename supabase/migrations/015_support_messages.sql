create table if not exists support_messages (
  id         uuid default gen_random_uuid() primary key,
  store_id   uuid references stores(id) on delete cascade,
  category   text,
  message    text not null,
  created_at timestamptz default now()
);

alter table support_messages enable row level security;

drop policy if exists "Store owners submit support messages" on support_messages;
create policy "Store owners submit support messages"
  on support_messages for insert with check (true);

drop policy if exists "Super admin reads support messages" on support_messages;
create policy "Super admin reads support messages"
  on support_messages for select using (get_my_role() = 'super_admin');
