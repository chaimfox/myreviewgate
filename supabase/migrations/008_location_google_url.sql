-- 008: Add google_review_url to locations
alter table locations add column if not exists google_review_url text;
