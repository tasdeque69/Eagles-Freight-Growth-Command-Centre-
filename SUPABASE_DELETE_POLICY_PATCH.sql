-- The Eagles Freight Growth Command Center
-- Safe global DELETE policy patch
-- Run this once in Supabase SQL Editor.
-- This does NOT delete any data. It only allows authenticated users to delete their own rows.

-- 1) Give authenticated users explicit DELETE permission on app tables.
grant delete on table
  public.prospects,
  public.customer_touches,
  public.shipment_files,
  public.route_cards,
  public.journal_entries,
  public.agents,
  public.agent_touches,
  public.weekly_reviews,
  public.five_year_roadmap,
  public.annual_goals,
  public.quarterly_sprints,
  public.skill_matrix,
  public.market_intelligence,
  public.ai_prompt_library,
  public.growth_portfolio
to authenticated;

-- 2) Explicit DELETE policies for Level 1 tables.
drop policy if exists "Users can delete own prospects" on public.prospects;
create policy "Users can delete own prospects"
on public.prospects
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own customer touches" on public.customer_touches;
create policy "Users can delete own customer touches"
on public.customer_touches
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own shipment files" on public.shipment_files;
create policy "Users can delete own shipment files"
on public.shipment_files
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own route cards" on public.route_cards;
create policy "Users can delete own route cards"
on public.route_cards
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own journal entries" on public.journal_entries;
create policy "Users can delete own journal entries"
on public.journal_entries
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own agents" on public.agents;
create policy "Users can delete own agents"
on public.agents
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own agent touches" on public.agent_touches;
create policy "Users can delete own agent touches"
on public.agent_touches
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own weekly reviews" on public.weekly_reviews;
create policy "Users can delete own weekly reviews"
on public.weekly_reviews
for delete
to authenticated
using (auth.uid() = user_id);

-- 3) Explicit DELETE policies for Level 2 Growth tables.
drop policy if exists "Users can delete own five year roadmap" on public.five_year_roadmap;
create policy "Users can delete own five year roadmap"
on public.five_year_roadmap
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own annual goals" on public.annual_goals;
create policy "Users can delete own annual goals"
on public.annual_goals
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own quarterly sprints" on public.quarterly_sprints;
create policy "Users can delete own quarterly sprints"
on public.quarterly_sprints
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own skill matrix" on public.skill_matrix;
create policy "Users can delete own skill matrix"
on public.skill_matrix
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own market intelligence" on public.market_intelligence;
create policy "Users can delete own market intelligence"
on public.market_intelligence
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own ai prompt library" on public.ai_prompt_library;
create policy "Users can delete own ai prompt library"
on public.ai_prompt_library
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own growth portfolio" on public.growth_portfolio;
create policy "Users can delete own growth portfolio"
on public.growth_portfolio
for delete
to authenticated
using (auth.uid() = user_id);
