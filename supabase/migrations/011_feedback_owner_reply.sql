-- Lets a store owner reply to a private feedback submission from the dashboard.
-- The reply is emailed to the customer if they left an email address.
alter table public.feedback add column if not exists owner_reply text;
alter table public.feedback add column if not exists owner_reply_at timestamptz;
