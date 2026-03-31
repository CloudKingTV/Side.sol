-- Run this in the Supabase SQL Editor
-- Adds pending_requests_data and approved_users_data columns for the approval flow

alter table profiles add column if not exists pending_requests_data jsonb default '[]'::jsonb;
alter table profiles add column if not exists approved_users_data jsonb default '{}'::jsonb;
