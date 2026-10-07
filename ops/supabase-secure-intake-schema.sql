-- Stonebridge secure website intake tables
-- Apply only to the approved HIPAA-configured Supabase project.
-- No browser/client key is used by the website. Inserts occur server-to-server
-- through the Vercel Functions service role.

create extension if not exists pgcrypto;

create table if not exists public.fit_safety_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  expires_at timestamptz,
  delete_at timestamptz not null,
  routing_rules_version text not null,
  name text not null,
  date_of_birth date not null,
  email text not null,
  mobile text not null,
  service text not null,
  routing_state text not null check (
    routing_state in (
      'direct_request_eligible',
      'administrative_resolution_required',
      'clinical_review_required'
    )
  ),
  routing_reason_codes jsonb not null default '[]'::jsonb,
  operational_status text not null default 'pending_review',
  resolved_at timestamptz,
  resolved_by text
);

create index if not exists fit_safety_match_idx
  on public.fit_safety_submissions (lower(email), date_of_birth, submitted_at desc);

create index if not exists fit_safety_status_idx
  on public.fit_safety_submissions (operational_status, submitted_at desc);

alter table public.fit_safety_submissions enable row level security;

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  delete_at timestamptz not null,
  inquiry_type text not null default 'consultation',
  full_name text not null,
  date_of_birth date not null,
  email text not null,
  phone text not null,
  preferred_contact text,
  service_requested text not null,
  psychotherapy_format text,
  preferred_clinician text,
  general_availability text,
  insurance_preference text,
  reason text not null,
  landing_source text,
  operational_status text not null default 'pending_review',
  resolved_at timestamptz,
  resolved_by text
);

create index if not exists consultation_status_idx
  on public.consultation_requests (operational_status, submitted_at desc);

alter table public.consultation_requests enable row level security;

-- Intentionally create no anon/authenticated RLS policies. The public website
-- has no Supabase client credentials. Authorized staff access must be provided
-- through the approved Supabase organization/project access controls.
