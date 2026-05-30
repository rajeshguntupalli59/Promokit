-- Run this in your Supabase SQL editor

create table if not exists profiles (
  id uuid references auth.users primary key,
  email text,
  plan text default 'free',
  generations_this_month int default 0,
  billing_period_start timestamptz default date_trunc('month', now()),
  razorpay_subscription_id text,
  created_at timestamptz default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text,
  description text,
  location text,
  whatsapp text,
  language text default 'Hindi',
  tone text default 'Friendly & Warm',
  festivals boolean default true,
  created_at timestamptz default now()
);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  business_id uuid references businesses(id) on delete cascade,
  business_name text,
  content jsonb,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS policies
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table generations enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can manage own businesses" on businesses for all using (auth.uid() = user_id);
create policy "Users can manage own generations" on generations for all using (auth.uid() = user_id);

-- ── MIGRATIONS (run after initial setup) ────────────────────────────────────

-- Referral system
alter table profiles add column if not exists referral_code text unique default substr(md5(random()::text), 1, 8);
alter table profiles add column if not exists referral_credits int default 0;
alter table profiles add column if not exists referred_by text;

-- Logo on businesses
alter table businesses add column if not exists logo_url text;

-- Reminders
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  scheduled_at timestamptz not null,
  content text,
  created_at timestamptz default now()
);
alter table reminders enable row level security;
create policy "Users can manage own reminders" on reminders for all using (auth.uid() = user_id);

-- Broadcast contacts
create table if not exists broadcast_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text,
  phone text not null,
  created_at timestamptz default now(),
  unique (owner_id, phone)
);
alter table broadcast_contacts enable row level security;
create policy "Owners can manage their contacts" on broadcast_contacts for all using (auth.uid() = owner_id);
create policy "Anyone can insert contact" on broadcast_contacts for insert with check (true);

-- Supabase Storage bucket for logos (run in SQL editor or create via Dashboard)
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;
