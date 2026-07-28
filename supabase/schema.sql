-- =====================================================================
-- MoneyQuest Kids — Database Schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------

-- One row per student, linked 1:1 to Supabase Auth's own auth.users table.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text,
  class text,
  school text,
  coins integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_active_date date,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id serial primary key,
  slug text unique not null,
  title text not null,
  description text,
  icon text default '📘',
  content text,
  order_index integer not null default 0
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id integer not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id integer not null references public.lessons (id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option char(1) not null check (correct_option in ('a', 'b', 'c', 'd')),
  order_index integer not null default 0
);

create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id integer not null references public.lessons (id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  percentage numeric not null,
  completed_at timestamptz not null default now()
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal_name text not null,
  goal_emoji text default '🎯',
  target_amount numeric not null,
  current_amount numeric not null default 0,
  target_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text default '🏅',
  description text,
  criteria_type text not null, -- 'lessons_completed' | 'perfect_quiz' | 'streak' | 'savings_goal'
  criteria_value integer not null
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  certificate_no text unique not null,
  score numeric,
  issued_on date not null default current_date
);

-- ---------------------------------------------------------------------
-- AUTO-CREATE A PROFILE ROW WHENEVER SOMEONE SIGNS UP
-- (name / class / school arrive as "options.data" on supabase.auth.signUp)
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, class, school)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Student'),
    new.email,
    new.raw_user_meta_data ->> 'class',
    new.raw_user_meta_data ->> 'school'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- HELPER: is the currently logged-in user the admin?
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$ language sql security definer stable set search_path = public;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY — "you may only see/change rows that belong to you"
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.savings_goals enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.certificates enable row level security;

-- profiles: everyone can read their own row, admin can read all, only owner can update
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- lessons & quizzes: static content, readable by any logged-in student
create policy "lessons_select" on public.lessons
  for select using (auth.role() = 'authenticated');
create policy "quizzes_select" on public.quizzes
  for select using (auth.role() = 'authenticated');

-- lesson_progress
create policy "lesson_progress_select" on public.lesson_progress
  for select using (auth.uid() = user_id or public.is_admin());
create policy "lesson_progress_insert" on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "lesson_progress_update" on public.lesson_progress
  for update using (auth.uid() = user_id);

-- quiz_results
create policy "quiz_results_select" on public.quiz_results
  for select using (auth.uid() = user_id or public.is_admin());
create policy "quiz_results_insert" on public.quiz_results
  for insert with check (auth.uid() = user_id);

-- savings_goals
create policy "savings_goals_select" on public.savings_goals
  for select using (auth.uid() = user_id or public.is_admin());
create policy "savings_goals_insert" on public.savings_goals
  for insert with check (auth.uid() = user_id);
create policy "savings_goals_update" on public.savings_goals
  for update using (auth.uid() = user_id);
create policy "savings_goals_delete" on public.savings_goals
  for delete using (auth.uid() = user_id);

-- badges: static content, readable by any logged-in student
create policy "badges_select" on public.badges
  for select using (auth.role() = 'authenticated');

-- user_badges
create policy "user_badges_select" on public.user_badges
  for select using (auth.uid() = user_id or public.is_admin());
create policy "user_badges_insert" on public.user_badges
  for insert with check (auth.uid() = user_id);

-- certificates
create policy "certificates_select" on public.certificates
  for select using (auth.uid() = user_id or public.is_admin());
create policy "certificates_insert" on public.certificates
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- To make yourself the admin after you register once through the site:
--   update public.profiles set is_admin = true where email = 'you@example.com';
-- ---------------------------------------------------------------------
