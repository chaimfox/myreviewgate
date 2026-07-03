-- customer_email was never a real column — the API was accidentally saving
-- the customer's email into customer_name instead, so private feedback
-- displayed the email in the "name" slot throughout the dashboard.
alter table public.feedback add column if not exists customer_email text;
