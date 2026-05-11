-- 家事分担アプリ Supabase セットアップSQL
-- Supabaseダッシュボード > SQL Editor で実行してください

-- ユーザーテーブル
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null,
  created_at timestamptz default now()
);

-- タスクテーブル
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points integer not null check (points > 0),
  created_at timestamptz default now()
);

-- 完了記録テーブル
create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  task_name text not null,
  points integer not null,
  completed_at timestamptz default now()
);

-- RLSを無効化（個人2名限定アプリのため）
alter table users disable row level security;
alter table tasks disable row level security;
alter table completions disable row level security;
