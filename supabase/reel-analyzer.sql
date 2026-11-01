-- Run in the Supabase SQL editor. Enable RLS; browser clients receive no direct table grants.
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text not null default 'Instagram Reel',
  source text not null default 'manual',
  transcript text,
  summary text,
  key_points jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  status text not null default 'captured',
  created_at timestamptz not null default now(),
  analyzed_at timestamptz
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.reels enable row level security;
alter table public.notes enable row level security;
-- Server-side service role is used only by Vercel API routes. Do not expose it in the browser.
