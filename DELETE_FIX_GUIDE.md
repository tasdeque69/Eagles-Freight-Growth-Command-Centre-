# Delete Function Fix Guide

## What was fixed in code

1. `src/lib/deleteRecord.ts` was rebuilt as the single global delete service.
2. The delete service now validates table name and record id before calling Supabase.
3. The delete service now blocks unapproved table names.
4. The delete service now gets the current Supabase user before deleting.
5. The delete service now deletes by both `id` and `user_id` for all user-owned tables.
6. The delete service uses `.select('id')` after `.delete()` so the app can verify that a row was actually deleted.
7. The delete service throws a clear error if zero rows are deleted.
8. Local/demo mode now has a safe fallback instead of crashing when `supabase` is null.
9. `dataService.getSupabaseClient()` was added because `Settings.tsx` was calling it but it did not exist.
10. Delete handlers now await their refetch functions after successful delete so UI state is refreshed before the handler finishes.

## Files changed

- `src/lib/deleteRecord.ts`
- `src/lib/dataService.ts`
- `src/pages/ProspectTracker.tsx`
- `src/pages/CustomerTouchTracker.tsx`
- `src/pages/ShipmentFileStudy.tsx`
- `src/pages/RouteCards.tsx`
- `src/pages/FreightJournal.tsx`
- `src/components/growth/FiveYearRoadmapTab.tsx`
- `src/components/growth/AnnualGoalsTab.tsx`
- `src/components/growth/QuarterlySprintsTab.tsx`
- `src/components/growth/SkillMatrixTab.tsx`
- `src/components/growth/MarketIntelligenceTab.tsx`
- `src/components/growth/AIPromptLibraryTab.tsx`
- `src/components/growth/GrowthPortfolioTab.tsx`
- `SUPABASE_DELETE_POLICY_PATCH.sql`
- `BUG_FIX_NOTES.md`
- `test_delete.ts`

## What must still be done in Supabase

Run `SUPABASE_DELETE_POLICY_PATCH.sql` once in the Supabase SQL Editor.

This patch does not delete app data. It only makes DELETE permission explicit for signed-in users and keeps RLS restricted to the owner by `user_id`.

## Testing checklist

For each table:

1. Add one dummy record.
2. Confirm it appears in the UI.
3. Confirm it appears in Supabase Table Editor.
4. Click Delete.
5. Confirm the browser confirmation.
6. Confirm success message.
7. Confirm the row disappears from UI.
8. Refresh browser.
9. Confirm the row does not return.
10. Confirm the row disappeared from Supabase Table Editor.

Test order:

1. `prospects`
2. `customer_touches`
3. `shipment_files`
4. `route_cards`
5. `journal_entries`
6. `agents`
7. `agent_touches`
8. `weekly_reviews`
9. `five_year_roadmap`
10. `annual_goals`
11. `quarterly_sprints`
12. `skill_matrix`
13. `market_intelligence`
14. `ai_prompt_library`
15. `growth_portfolio`

## Do not do this

- Do not disable RLS.
- Do not use the service role key in the frontend.
- Do not rebuild the database from scratch.
- Do not move to Level 3 until Level 1 and Level 2 Delete pass.
- Do not use real customer/rate/shipment/agent data while testing.
