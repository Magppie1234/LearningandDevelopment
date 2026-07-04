-- Address Supabase security-advisor WARNs surfaced after 0001-0003.

-- Fix function_search_path_mutable on remaining functions.
create or replace function public.is_domain_allowed(p_email text)
returns boolean language sql stable set search_path = public as $$
  select exists (
    select 1 from public.allowed_email_domains
    where domain = lower(split_part(p_email, '@', 2))
  );
$$;

create or replace function public.knowledge_tsv_trigger() returns trigger
language plpgsql set search_path = public as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('english', array_to_string(new.tags,' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body,'')), 'C');
  return new;
end $$;

create or replace function public.before_user_created_hook(event jsonb)
returns jsonb language plpgsql set search_path = public as $$
declare
  v_email text := event #>> '{user,email}';
begin
  if v_email is null or not public.is_domain_allowed(v_email) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Access is restricted to Magppie company accounts.'
      )
    );
  end if;
  return event;
end $$;

-- Trigger/hook functions are never meant to be called via the REST RPC surface.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.enforce_email_domain() from anon, authenticated, public;
revoke execute on function public.before_user_created_hook(jsonb) from anon, authenticated, public;
grant execute on function public.before_user_created_hook(jsonb) to supabase_auth_admin;
grant execute on function public.is_domain_allowed(text) to supabase_auth_admin;

-- NOTE (accepted WARNs): the RLS helper functions (is_admin, is_manager_of,
-- is_active, is_trainer, can_author, can_review, app_role) remain EXECUTE-able by
-- authenticated/anon by design — RLS policies invoke them under the caller's role.
-- They only reveal the caller's own authorization state. Do not revoke these.
-- The `vector` extension lives in `public` (extension_in_public WARN); revisit in
-- the AI stage (move to an `extensions` schema) if desired.
