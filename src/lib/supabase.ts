/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean check to see if we have valid-looking credentials
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export function getSupabaseSchemaSQL(): string {
  return `-- 1. Create Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'Business Development Executive',
  company_name text not null default 'The Eagles Company',
  roadmap_start_date date not null default current_date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert or update own profile" on public.profiles;
create policy "Users can insert or update own profile" on public.profiles
  for all using (auth.uid() = id);


-- 2. Prospects Table
create table if not exists public.prospects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null,
  location text not null,
  product_type text not null,
  export_market text not null,
  commercial_contact_person text not null,
  phone_or_email text not null,
  possible_shipment_route text not null,
  possible_pain_point text not null,
  next_action text not null,
  status text not null check (status in ('New', 'Contacted', 'Negotiating', 'Closed Won', 'Closed Lost')),
  follow_up_date date not null,
  notes text,
  created_at timestamp with time zone not null default now()
);

alter table public.prospects enable row level security;

drop policy if exists "Users can manage own prospects" on public.prospects;
create policy "Users can manage own prospects" on public.prospects
  for all using (auth.uid() = user_id);


-- 3. Customer Touches Table
create table if not exists public.customer_touches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  prospect_id uuid references public.prospects on delete set null,
  touch_type text not null check (touch_type in (
    'Meeting follow-up',
    'Pending quotation follow-up',
    'Company profile follow-up',
    'Trial quotation request',
    'Shipment route discussion',
    'Backup rate support',
    'Customer value message'
  )),
  date date not null default current_date,
  message_summary text not null,
  response_status text not null,
  next_action text not null,
  follow_up_date date not null,
  trial_quote_asked boolean not null default false,
  created_at timestamp with time zone not null default now()
);

alter table public.customer_touches enable row level security;

drop policy if exists "Users can manage own customer touches" on public.customer_touches;
create policy "Users can manage own customer touches" on public.customer_touches
  for all using (auth.uid() = user_id);


-- 4. Shipment Files Table
create table if not exists public.shipment_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  shipment_route text not null,
  mode text not null check (mode in ('Air', 'Ocean', 'Rail', 'Road', 'Express')),
  customer_requirement text not null,
  booking_status text not null,
  document_status text not null,
  cut_off_date date not null,
  cargo_handover_status text not null,
  problem_or_delay text not null,
  solution_taken text not null,
  key_learning text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.shipment_files enable row level security;

drop policy if exists "Users can manage own shipment files" on public.shipment_files;
create policy "Users can manage own shipment files" on public.shipment_files
  for all using (auth.uid() = user_id);


-- 5. Route Cards Table
create table if not exists public.route_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  origin text not null,
  destination text not null,
  mode text not null check (mode in ('Air', 'Ocean', 'Rail', 'Road', 'Express')),
  carrier_or_airline text not null,
  transit_time text not null,
  transshipment_point text not null,
  common_cargo_type text not null,
  common_issue text not null,
  agent_role text not null,
  customer_objection text not null,
  possible_solution text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.route_cards enable row level security;

drop policy if exists "Users can manage own route cards" on public.route_cards;
create policy "Users can manage own route cards" on public.route_cards
  for all using (auth.uid() = user_id);


-- 6. Journal Entries Table
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  today_i_learned text not null,
  one_document_i_saw text not null,
  one_shipment_route_i_studied text not null,
  one_customer_followed_up text not null,
  one_agent_contacted text not null,
  one_mistake_found text not null,
  tomorrow_target text not null,
  created_at timestamp with time zone not null default now(),
  constraint unique_user_date_journal unique (user_id, date)
);

alter table public.journal_entries enable row level security;

drop policy if exists "Users can manage own journal entries" on public.journal_entries;
create policy "Users can manage own journal entries" on public.journal_entries
  for all using (auth.uid() = user_id);


-- 7. Agents Table
create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  location text not null check (location in ('China', 'Europe', 'Other')),
  contact_person text not null,
  email_or_phone text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.agents enable row level security;

drop policy if exists "Users can manage own agents" on public.agents;
create policy "Users can manage own agents" on public.agents
  for all using (auth.uid() = user_id);


-- 8. Agent Touches Table
create table if not exists public.agent_touches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  agent_id uuid references public.agents on delete set null,
  agent_name text not null,
  agent_location text not null check (agent_location in ('China', 'Europe')),
  date date not null default current_date,
  summary text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.agent_touches enable row level security;

drop policy if exists "Users can manage own agent touches" on public.agent_touches;
create policy "Users can manage own agent touches" on public.agent_touches
  for all using (auth.uid() = user_id);


-- 9. Weekly Reviews Table
create table if not exists public.weekly_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  week_start_date date not null,
  prospects_count integer not null default 0,
  touches_count integer not null default 0,
  trial_quotes_count integer not null default 0,
  shipment_files_count integer not null default 0,
  route_cards_count integer not null default 0,
  agent_touches_count integer not null default 0,
  best_learning text not null,
  biggest_weakness text not null,
  next_week_focus text not null,
  generated_text text not null,
  created_at timestamp with time zone not null default now(),
  constraint unique_user_week unique (user_id, week_start_date)
);

alter table public.weekly_reviews enable row level security;

drop policy if exists "Users can manage own weekly reviews" on public.weekly_reviews;
create policy "Users can manage own weekly reviews" on public.weekly_reviews
  for all using (auth.uid() = user_id);

-- LEVEL 2: GROWTH TABLES

-- 10. Five-Year Roadmap
create table if not exists public.five_year_roadmap (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  phase text not null,
  title text not null,
  description text not null,
  status text not null,
  created_at timestamp with time zone not null default now()
);
alter table public.five_year_roadmap enable row level security;
drop policy if exists "Users can manage own roadmap" on public.five_year_roadmap;
create policy "Users can manage own roadmap" on public.five_year_roadmap for all using (auth.uid() = user_id);

-- 11. Annual Goals
create table if not exists public.annual_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  year text not null,
  goal_name text not null,
  target_value numeric not null,
  current_value numeric not null default 0,
  unit text not null,
  status text not null,
  created_at timestamp with time zone not null default now()
);
alter table public.annual_goals enable row level security;
drop policy if exists "Users can manage own annual goals" on public.annual_goals;
create policy "Users can manage own annual goals" on public.annual_goals for all using (auth.uid() = user_id);

-- 12. Quarterly Sprints
create table if not exists public.quarterly_sprints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  quarter text not null,
  theme text not null,
  priority_outcomes text not null,
  monthly_focus text not null,
  status text not null,
  completion_score numeric not null default 0,
  created_at timestamp with time zone not null default now()
);
alter table public.quarterly_sprints enable row level security;
drop policy if exists "Users can manage own sprints" on public.quarterly_sprints;
create policy "Users can manage own sprints" on public.quarterly_sprints for all using (auth.uid() = user_id);

-- 13. Skill Matrix
create table if not exists public.skill_matrix (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  skill_name text not null,
  maturity_level integer not null,
  next_action text not null,
  last_reviewed date,
  created_at timestamp with time zone not null default now()
);
alter table public.skill_matrix enable row level security;
drop policy if exists "Users can manage own skills" on public.skill_matrix;
create policy "Users can manage own skills" on public.skill_matrix for all using (auth.uid() = user_id);

-- 14. Market Intelligence
create table if not exists public.market_intelligence (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  headline text not null,
  source text not null,
  summary text not null,
  why_it_matters text not null,
  action_for_bd text not null,
  related_route text not null,
  related_customer_segment text not null,
  confidence_level text not null,
  important_flag boolean not null default false,
  created_at timestamp with time zone not null default now()
);
alter table public.market_intelligence enable row level security;
drop policy if exists "Users can manage own market intel" on public.market_intelligence;
create policy "Users can manage own market intel" on public.market_intelligence for all using (auth.uid() = user_id);

-- 15. AI Prompt Library
create table if not exists public.ai_prompt_library (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null,
  recommended_tool text not null,
  prompt_text text not null,
  input_needed text not null,
  output_expected text not null,
  privacy_level text not null,
  last_used date,
  effectiveness_rating integer,
  notes text not null,
  created_at timestamp with time zone not null default now()
);
alter table public.ai_prompt_library enable row level security;
drop policy if exists "Users can manage own ai prompts" on public.ai_prompt_library;
create policy "Users can manage own ai prompts" on public.ai_prompt_library for all using (auth.uid() = user_id);

-- 16. Growth Portfolio
create table if not exists public.growth_portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  evidence_type text not null,
  date date not null,
  summary text not null,
  business_value text not null,
  skill_demonstrated text not null,
  visibility text not null,
  notes text not null,
  created_at timestamp with time zone not null default now()
);
alter table public.growth_portfolio enable row level security;
drop policy if exists "Users can manage own portfolio" on public.growth_portfolio;
create policy "Users can manage own portfolio" on public.growth_portfolio for all using (auth.uid() = user_id);

`;
}
