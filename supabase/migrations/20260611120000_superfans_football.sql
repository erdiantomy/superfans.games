-- ============================================================================
-- Superfans — Football vertical (ADDITIVE, sf_ prefix)
-- Reputation-based sports social network. NO gambling / no real-money wagering.
-- Coexists with the legacy padel schema (public.matches, public.profiles, ...).
-- References auth.users directly for simple, robust RLS.
-- ============================================================================

-- ---------- Extensions (idempotent) ----------------------------------------
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ---------- Enums -----------------------------------------------------------
do $$ begin
  create type public.sf_match_status as enum ('scheduled','live','finished','postponed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sf_prediction_status as enum ('pending','correct','incorrect','void');
exception when duplicate_object then null; end $$;

-- ---------- Leagues ---------------------------------------------------------
create table if not exists public.sf_leagues (
  id           uuid primary key default gen_random_uuid(),
  external_ref text unique,                      -- TheSportsDB idLeague
  name         text not null,
  slug         text unique not null,
  country      text,
  logo_url     text,
  badge_url    text,
  sport        text not null default 'Soccer',
  season       text,
  priority     int  not null default 100,
  created_at   timestamptz not null default now()
);

-- ---------- Teams -----------------------------------------------------------
create table if not exists public.sf_teams (
  id           uuid primary key default gen_random_uuid(),
  external_ref text unique,                      -- TheSportsDB idTeam
  league_id    uuid references public.sf_leagues(id) on delete set null,
  name         text not null,
  short_name   text,
  slug         text unique not null,
  badge_url    text,
  country      text,
  stadium      text,
  created_at   timestamptz not null default now()
);

-- ---------- Matches (football fixtures) ------------------------------------
create table if not exists public.sf_matches (
  id             uuid primary key default gen_random_uuid(),
  external_ref   text unique,                    -- TheSportsDB idEvent
  league_id      uuid references public.sf_leagues(id) on delete set null,
  league_name    text,
  season         text,
  round          text,
  home_team_id   uuid references public.sf_teams(id) on delete set null,
  away_team_id   uuid references public.sf_teams(id) on delete set null,
  home_team_name text not null,
  away_team_name text not null,
  home_badge     text,
  away_badge     text,
  status         public.sf_match_status not null default 'scheduled',
  kickoff_at     timestamptz,
  home_score     int,
  away_score     int,
  winner         text check (winner in ('home','away','draw')),
  venue          text,
  thumb_url      text,
  updated_at     timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
create index if not exists sf_matches_kickoff_idx       on public.sf_matches (kickoff_at);
create index if not exists sf_matches_status_kickoff_idx on public.sf_matches (status, kickoff_at);
create index if not exists sf_matches_league_idx         on public.sf_matches (league_id, kickoff_at);

-- ---------- Predictions (reputation-based, NOT bets) -----------------------
create table if not exists public.sf_predictions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  match_id       uuid not null references public.sf_matches(id) on delete cascade,
  pick           text not null check (pick in ('home','away','draw')),
  confidence     smallint not null default 50 check (confidence between 1 and 100),
  status         public.sf_prediction_status not null default 'pending',
  points_awarded numeric(6,2),
  resolved_at    timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, match_id)
);
create index if not exists sf_pred_match_idx on public.sf_predictions (match_id);
create index if not exists sf_pred_user_idx  on public.sf_predictions (user_id, created_at desc);

-- ---------- Reputation (per user) ------------------------------------------
create table if not exists public.sf_reputation (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  accuracy            numeric(6,2) not null default 0,
  total_predictions   int not null default 0,
  correct_predictions int not null default 0,
  points              numeric(10,2) not null default 0,
  current_streak      int not null default 0,
  best_streak         int not null default 0,
  tier                text not null default 'Rookie',
  updated_at          timestamptz not null default now()
);

-- ---------- Follows (polymorphic) ------------------------------------------
create table if not exists public.sf_follows (
  id          uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('user','team','league')),
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (follower_id, target_type, target_id)
);
create index if not exists sf_follows_target_idx on public.sf_follows (target_type, target_id);

-- ---------- Posts (social feed) --------------------------------------------
create table if not exists public.sf_posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references auth.users(id) on delete cascade,
  match_id      uuid references public.sf_matches(id) on delete set null,
  prediction_id uuid references public.sf_predictions(id) on delete set null,
  body          text not null check (char_length(body) between 1 and 2000),
  like_count    int not null default 0,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists sf_posts_created_idx on public.sf_posts (created_at desc);
create index if not exists sf_posts_author_idx  on public.sf_posts (author_id, created_at desc);

-- ---------- Post likes ------------------------------------------------------
create table if not exists public.sf_post_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    uuid not null references public.sf_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.sf_leagues     enable row level security;
alter table public.sf_teams       enable row level security;
alter table public.sf_matches     enable row level security;
alter table public.sf_predictions enable row level security;
alter table public.sf_reputation  enable row level security;
alter table public.sf_follows     enable row level security;
alter table public.sf_posts       enable row level security;
alter table public.sf_post_likes  enable row level security;

-- Public reference data: world-readable, no client writes (service role only).
do $$ begin
  create policy "sf_leagues read" on public.sf_leagues for select using (true);
  create policy "sf_teams read"   on public.sf_teams   for select using (true);
  create policy "sf_matches read" on public.sf_matches for select using (true);
exception when duplicate_object then null; end $$;

-- Reputation: world-readable (leaderboards), writes via SECURITY DEFINER only.
do $$ begin
  create policy "sf_reputation read" on public.sf_reputation for select using (true);
exception when duplicate_object then null; end $$;

-- Predictions: world-readable; users insert their own on an OPEN match; no edits.
do $$ begin
  create policy "sf_pred read" on public.sf_predictions for select using (true);
  create policy "sf_pred insert own" on public.sf_predictions for insert
    with check (
      auth.uid() = user_id
      and exists (
        select 1 from public.sf_matches m
        where m.id = match_id
          and m.status = 'scheduled'
          and (m.kickoff_at is null or m.kickoff_at > now())
      )
    );
exception when duplicate_object then null; end $$;

-- Follows: world-readable; users manage only their own edges.
do $$ begin
  create policy "sf_follows read" on public.sf_follows for select using (true);
  create policy "sf_follows insert own" on public.sf_follows for insert with check (auth.uid() = follower_id);
  create policy "sf_follows delete own" on public.sf_follows for delete using (auth.uid() = follower_id);
exception when duplicate_object then null; end $$;

-- Posts: visible unless soft-deleted; authored/edited/deleted by owner.
do $$ begin
  create policy "sf_posts read" on public.sf_posts for select using (deleted_at is null);
  create policy "sf_posts insert own" on public.sf_posts for insert with check (auth.uid() = author_id);
  create policy "sf_posts update own" on public.sf_posts for update using (auth.uid() = author_id);
exception when duplicate_object then null; end $$;

-- Likes: world-readable; users manage only their own.
do $$ begin
  create policy "sf_likes read" on public.sf_post_likes for select using (true);
  create policy "sf_likes insert own" on public.sf_post_likes for insert with check (auth.uid() = user_id);
  create policy "sf_likes delete own" on public.sf_post_likes for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Reputation tiers + resolution engine
-- ============================================================================
create or replace function public.sf_tier_for(points numeric)
returns text language sql immutable as $$
  select case
    when points >= 5000 then 'Legend'
    when points >= 2000 then 'Elite'
    when points >= 750  then 'Pro'
    when points >= 200  then 'Rising'
    when points >= 50   then 'Amateur'
    else 'Rookie'
  end;
$$;

-- Recompute a user's aggregate reputation from their resolved predictions.
create or replace function public.sf_recompute_reputation(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_total int; v_correct int; v_points numeric; v_streak int; v_best int;
  r record;
begin
  select count(*) filter (where status in ('correct','incorrect')),
         count(*) filter (where status = 'correct'),
         coalesce(sum(points_awarded),0)
    into v_total, v_correct, v_points
    from public.sf_predictions where user_id = p_user;

  -- current streak: walk resolved predictions newest→oldest
  v_streak := 0;
  for r in
    select status from public.sf_predictions
    where user_id = p_user and status in ('correct','incorrect')
    order by resolved_at desc nulls last, created_at desc
  loop
    exit when r.status <> 'correct';
    v_streak := v_streak + 1;
  end loop;

  select greatest(coalesce(best_streak,0), v_streak) into v_best
    from public.sf_reputation where user_id = p_user;
  v_best := coalesce(v_best, v_streak);

  insert into public.sf_reputation as rep
    (user_id, accuracy, total_predictions, correct_predictions, points,
     current_streak, best_streak, tier, updated_at)
  values
    (p_user,
     case when v_total > 0 then round(100.0 * v_correct / v_total, 2) else 0 end,
     v_total, v_correct, v_points, v_streak, coalesce(v_best, v_streak),
     public.sf_tier_for(v_points), now())
  on conflict (user_id) do update set
     accuracy            = excluded.accuracy,
     total_predictions   = excluded.total_predictions,
     correct_predictions = excluded.correct_predictions,
     points              = excluded.points,
     current_streak      = excluded.current_streak,
     best_streak         = greatest(rep.best_streak, excluded.current_streak),
     tier                = excluded.tier,
     updated_at          = now();
end $$;

-- Resolve all pending predictions for a finished match, then recompute users.
create or replace function public.sf_resolve_match(p_match uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_winner text;
  v_users uuid[];
  p record;
begin
  select winner into v_winner from public.sf_matches
   where id = p_match and status = 'finished';
  if v_winner is null then return; end if;

  v_users := array(select distinct user_id from public.sf_predictions
                   where match_id = p_match and status = 'pending');

  for p in
    select id, user_id, pick, confidence from public.sf_predictions
    where match_id = p_match and status = 'pending'
  loop
    if p.pick = v_winner then
      update public.sf_predictions
        set status = 'correct',
            -- base 10 + confidence-weighted bonus (max 20 pts per correct call)
            points_awarded = round(10 + (p.confidence::numeric / 10), 2),
            resolved_at = now()
        where id = p.id;
    else
      update public.sf_predictions
        set status = 'incorrect', points_awarded = 0, resolved_at = now()
        where id = p.id;
    end if;
  end loop;

  if array_length(v_users,1) is not null then
    perform public.sf_recompute_reputation(u) from unnest(v_users) as u;
  end if;
end $$;

-- Trigger: when a match flips to finished with a winner, auto-resolve.
create or replace function public.sf_on_match_finished()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'finished' and new.winner is not null
     and (tg_op = 'INSERT' or old.status is distinct from 'finished') then
    perform public.sf_resolve_match(new.id);
  end if;
  return new;
end $$;

drop trigger if exists sf_match_finished_trg on public.sf_matches;
create trigger sf_match_finished_trg
  after insert or update of status, winner on public.sf_matches
  for each row execute function public.sf_on_match_finished();

-- ============================================================================
-- Like counter maintenance
-- ============================================================================
create or replace function public.sf_like_count_trg()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.sf_posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.sf_posts set like_count = greatest(0, like_count - 1) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists sf_post_like_trg on public.sf_post_likes;
create trigger sf_post_like_trg
  after insert or delete on public.sf_post_likes
  for each row execute function public.sf_like_count_trg();

-- ============================================================================
-- Leaderboard view (reputation joined to shared profiles)
-- ============================================================================
create or replace view public.sf_leaderboard as
  select r.user_id,
         coalesce(nullif(p.display_name,''), nullif(p.username,''), 'Fan') as display_name,
         p.username, p.avatar_url,
         r.points, r.accuracy, r.total_predictions, r.correct_predictions,
         r.current_streak, r.best_streak, r.tier,
         rank() over (order by r.points desc, r.accuracy desc) as position
    from public.sf_reputation r
    left join public.profiles p on p.user_id = r.user_id;

grant select on public.sf_leaderboard to anon, authenticated;
