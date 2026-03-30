-- Run this in the Supabase SQL Editor
-- Adds a friends_data column to profiles for cross-device friend sync

alter table profiles add column if not exists friends_data jsonb default '[]'::jsonb;
alter table profiles add column if not exists vips_data jsonb default '[]'::jsonb;
alter table profiles add column if not exists bmarks_data jsonb default '[]'::jsonb;
alter table profiles add column if not exists rsvps_data jsonb default '[]'::jsonb;
alter table profiles add column if not exists checkins_data jsonb default '[]'::jsonb;
alter table profiles add column if not exists incog_data jsonb default '[]'::jsonb;
