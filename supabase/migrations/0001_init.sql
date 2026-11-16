-- 모유 수유 기록지 초기 스키마. 기록일 = 오전 7시 기준(Asia/Seoul).

create table babies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date
);

create table family_members (
  user_id uuid references auth.users on delete cascade,
  baby_id uuid references babies on delete cascade,
  primary key (user_id, baby_id)
);

create type record_kind as enum
  ('feed_direct', 'feed_breast_milk', 'feed_formula', 'pee', 'poop', 'temp', 'vomit');

create table records (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references babies on delete cascade,
  recorded_at timestamptz not null default now(),
  kind record_kind not null,
  amount numeric,            -- feed_direct=분, feed_*=ml, temp=℃, 그 외 null
  memo text,
  created_by uuid default auth.uid() references auth.users,
  created_at timestamptz not null default now(),
  -- 하루 = 07:00 ~ 익일 06:59
  care_date date generated always as
    (((recorded_at at time zone 'Asia/Seoul') - interval '7 hours')::date) stored,
  slot_hour smallint generated always as
    (extract(hour from recorded_at at time zone 'Asia/Seoul')::smallint) stored
);
create index on records (baby_id, care_date);

-- RLS: 가족 구성원만 접근
alter table babies enable row level security;
alter table family_members enable row level security;
alter table records enable row level security;

create policy "own membership" on family_members
  for select using (user_id = auth.uid());

create policy "family reads baby" on babies
  for select using (id in (select baby_id from family_members where user_id = auth.uid()));

create policy "family all records" on records
  for all using (baby_id in (select baby_id from family_members where user_id = auth.uid()))
  with check (baby_id in (select baby_id from family_members where user_id = auth.uid()));

-- 일별 통계 (주/월은 이 뷰를 기간으로 합산)
create view daily_summary with (security_invoker = true) as
select baby_id, care_date,
  coalesce(sum(amount) filter (where kind = 'feed_direct'), 0)      as direct_min,
  coalesce(sum(amount) filter (where kind = 'feed_breast_milk'), 0) as breast_milk_ml,
  coalesce(sum(amount) filter (where kind = 'feed_formula'), 0)     as formula_ml,
  count(*) filter (where kind in ('feed_direct','feed_breast_milk','feed_formula')) as feed_count,
  count(*) filter (where kind = 'pee')   as pee_count,
  count(*) filter (where kind = 'poop')  as poop_count,
  count(*) filter (where kind = 'vomit') as vomit_count,
  max(amount) filter (where kind = 'temp') as max_temp
from records
group by baby_id, care_date;
