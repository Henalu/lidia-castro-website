create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  phone text not null default '',
  age integer,
  sex text not null default 'not_specified' check (sex in ('male', 'female', 'not_specified')),
  contact_preference text not null default 'email' check (contact_preference in ('whatsapp', 'phone', 'email')),
  role text not null default 'patient' check (role in ('patient', 'superadmin')),
  can_book_direct boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  guest_name text,
  guest_email text,
  guest_phone text,
  contact_preference text not null default 'email' check (contact_preference in ('whatsapp', 'phone', 'email')),
  selected_date date not null,
  selected_time time not null,
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  is_direct_booking boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_request_owner_or_guest check (
    (profile_id is not null and guest_name is null and guest_email is null and guest_phone is null)
    or (profile_id is null and guest_name is not null and guest_email is not null and guest_phone is not null)
  )
);

create table if not exists public.calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  block_type text not null check (block_type in ('day', 'slot')),
  block_date date not null,
  block_time time,
  reason text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint calendar_block_shape check (
    (block_type = 'day' and block_time is null)
    or (block_type = 'slot' and block_time is not null)
  )
);

create table if not exists public.site_content (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists booking_requests_active_slot_unique
  on public.booking_requests (selected_date, selected_time)
  where status in ('pending', 'confirmed');

create index if not exists booking_requests_profile_idx
  on public.booking_requests (profile_id, selected_date desc, selected_time desc);

create unique index if not exists calendar_blocks_day_unique
  on public.calendar_blocks (block_date)
  where block_type = 'day';

create unique index if not exists calendar_blocks_slot_unique
  on public.calendar_blocks (block_date, block_time)
  where block_type = 'slot';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_profile_can_book_direct()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(can_book_direct, false)
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    can_book_direct,
    status,
    admin_notes
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'patient',
    false,
    'active',
    ''
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = case
      when public.profiles.full_name = '' then excluded.full_name
      else public.profiles.full_name
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.current_profile_role() = 'superadmin' then
    return new;
  end if;

  if auth.uid() is distinct from old.id then
    raise exception 'not_allowed';
  end if;

  new.id = old.id;
  new.email = old.email;
  new.role = old.role;
  new.can_book_direct = old.can_book_direct;
  new.status = old.status;
  new.admin_notes = old.admin_notes;
  new.created_at = old.created_at;

  return new;
end;
$$;

create or replace function public.validate_booking_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('pending', 'confirmed') then
    if exists (
      select 1
      from public.calendar_blocks block
      where block.block_date = new.selected_date
        and (
          block.block_type = 'day'
          or (block.block_type = 'slot' and block.block_time = new.selected_time)
        )
    ) then
      raise exception 'slot_blocked';
    end if;

    if exists (
      select 1
      from public.booking_requests booking
      where booking.id <> coalesce(new.id, gen_random_uuid())
        and booking.selected_date = new.selected_date
        and booking.selected_time = new.selected_time
        and booking.status in ('pending', 'confirmed')
    ) then
      raise exception 'slot_already_taken';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists booking_requests_set_updated_at on public.booking_requests;
create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row
execute function public.set_updated_at();

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row
execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

drop trigger if exists protect_profile_fields_trigger on public.profiles;
create trigger protect_profile_fields_trigger
before update on public.profiles
for each row
execute function public.protect_profile_fields();

drop trigger if exists validate_booking_request_trigger on public.booking_requests;
create trigger validate_booking_request_trigger
before insert or update on public.booking_requests
for each row
execute function public.validate_booking_request();

alter table public.profiles enable row level security;
alter table public.booking_requests enable row level security;
alter table public.calendar_blocks enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.current_profile_role() = 'superadmin');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
  and role = 'patient'
  and can_book_direct = false
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.current_profile_role() = 'superadmin')
with check (auth.uid() = id or public.current_profile_role() = 'superadmin');

drop policy if exists "booking_requests_select_self_or_admin" on public.booking_requests;
create policy "booking_requests_select_self_or_admin"
on public.booking_requests
for select
to authenticated
using (public.current_profile_role() = 'superadmin' or profile_id = auth.uid());

drop policy if exists "booking_requests_insert_guest" on public.booking_requests;
create policy "booking_requests_insert_guest"
on public.booking_requests
for insert
to anon
with check (
  profile_id is null
  and status = 'pending'
  and guest_name is not null
  and guest_email is not null
  and guest_phone is not null
);

drop policy if exists "booking_requests_insert_patient_or_admin" on public.booking_requests;
create policy "booking_requests_insert_patient_or_admin"
on public.booking_requests
for insert
to authenticated
with check (
  public.current_profile_role() = 'superadmin'
  or (
    profile_id = auth.uid()
    and guest_name is null
    and guest_email is null
    and guest_phone is null
    and (
      status = 'pending'
      or (status = 'confirmed' and public.current_profile_can_book_direct())
    )
  )
);

drop policy if exists "booking_requests_update_admin" on public.booking_requests;
create policy "booking_requests_update_admin"
on public.booking_requests
for update
to authenticated
using (public.current_profile_role() = 'superadmin')
with check (public.current_profile_role() = 'superadmin');

drop policy if exists "calendar_blocks_admin_select" on public.calendar_blocks;
create policy "calendar_blocks_admin_select"
on public.calendar_blocks
for select
to authenticated
using (public.current_profile_role() = 'superadmin');

drop policy if exists "calendar_blocks_admin_write" on public.calendar_blocks;
create policy "calendar_blocks_admin_write"
on public.calendar_blocks
for all
to authenticated
using (public.current_profile_role() = 'superadmin')
with check (public.current_profile_role() = 'superadmin');

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write"
on public.site_content
for all
to authenticated
using (public.current_profile_role() = 'superadmin')
with check (public.current_profile_role() = 'superadmin');

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
on public.site_settings
for all
to authenticated
using (public.current_profile_role() = 'superadmin')
with check (public.current_profile_role() = 'superadmin');

create or replace view public.public_booking_slots as
select
  id,
  selected_date,
  selected_time,
  status
from public.booking_requests
where status in ('pending', 'confirmed');

create or replace view public.public_calendar_blocks as
select
  id,
  block_type,
  block_date,
  block_time
from public.calendar_blocks;

grant select on public.public_booking_slots to anon, authenticated;
grant select on public.public_calendar_blocks to anon, authenticated;

insert into public.site_content (key, content)
values ('global', '{}'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings (key, settings)
values ('global', '{}'::jsonb)
on conflict (key) do nothing;

-- Promote the first real admin manually after sign-up:
-- update public.profiles
-- set role = 'superadmin', can_book_direct = true
-- where email = 'tu-email@dominio.com';
