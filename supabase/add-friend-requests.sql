-- Run this in the Supabase SQL Editor

-- Column to store incoming friend requests
alter table profiles add column if not exists friend_requests_data jsonb default '[]'::jsonb;

-- Function to notify someone they've been added (writes to THEIR profile)
create or replace function send_friend_request(sender_handle text, sender_name text, sender_pfp text, target_handle text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  curr jsonb;
begin
  select friend_requests_data into curr
  from public.profiles where handle = target_handle;

  -- Don't add duplicate requests
  if curr is null then curr = '[]'::jsonb; end if;
  if not exists (select 1 from jsonb_array_elements(curr) v where v->>'handle' = sender_handle) then
    curr = curr || jsonb_build_object('handle', sender_handle, 'name', sender_name, 'pfp', sender_pfp, 'ts', now());
    update public.profiles set friend_requests_data = curr where handle = target_handle;
  end if;
end;
$$;

-- Function to clear a friend request after accepting/dismissing
create or replace function clear_friend_request(requester_handle text, my_handle text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  curr jsonb;
begin
  select friend_requests_data into curr
  from public.profiles where handle = my_handle;

  if curr is not null then
    curr = (select coalesce(jsonb_agg(v), '[]'::jsonb) from jsonb_array_elements(curr) v where v->>'handle' != requester_handle);
    update public.profiles set friend_requests_data = curr where handle = my_handle;
  end if;
end;
$$;
