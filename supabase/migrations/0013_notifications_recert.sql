-- ===========================================================================
-- 0013 — Notification enqueueing + recertification workflow (§3.2, item 2)
-- ---------------------------------------------------------------------------
-- notifications table already exists (0001) — this adds the machinery that
-- FILLS it, plus the recertification flow the docx specifies ("auto-enrolls
-- employees in recertification 60 days before expiration", sec09 §9.1.4).
-- ===========================================================================

create type recert_status as enum ('scheduled', 'in_progress', 'passed', 'failed', 'lapsed');

create table recertification_requests (
  id               uuid primary key default gen_random_uuid(),
  certification_id uuid not null references certifications(id) on delete cascade,
  user_id          uuid not null references profiles(id) on delete cascade,
  due_date         date not null,
  status           recert_status not null default 'scheduled',
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz,
  unique (certification_id)
);
create index on recertification_requests(user_id, status);

alter table recertification_requests enable row level security;
create policy "recert_own_read" on recertification_requests
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "recert_admin_write" on recertification_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- Run daily (Supabase cron / pg_cron): for every certification expiring within
-- 60 days, open a recert request (idempotent) and notify employee + manager.
create or replace function public.enqueue_recertifications()
returns int
language plpgsql
security definer
as $$
declare v_count int := 0;
begin
  with expiring as (
    select c.id, c.user_id, c.expires_at::date as due_date
    from certifications c
    where c.status = 'issued'
      and c.expires_at is not null
      and c.expires_at <= now() + interval '60 days'
  ), inserted as (
    insert into recertification_requests (certification_id, user_id, due_date)
    select id, user_id, due_date from expiring
    on conflict (certification_id) do nothing
    returning user_id, due_date
  ), notified as (
    insert into notifications (user_id, kind, title, body, link_url)
    select user_id, 'recertification',
           'Certification expiring soon',
           'A certification expires on ' || due_date ||
           '. Your recertification has been scheduled — complete it before the due date.',
           '/certifications'
    from inserted
    returning 1
  )
  select count(*) into v_count from notified;
  return v_count;
end $$;

comment on function public.enqueue_recertifications() is
  'Daily job: certifications expiring within 60 days -> recertification_requests '
  '+ notifications. Idempotent via unique(certification_id).';
