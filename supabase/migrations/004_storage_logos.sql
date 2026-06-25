-- Create public storage bucket for store logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Allow anyone to read logos (public bucket)
create policy "Public read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Allow authenticated users to upload logos
create policy "Authenticated upload logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

-- Allow users to update/delete their own logos
create policy "Owner manage logos"
  on storage.objects for all
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
