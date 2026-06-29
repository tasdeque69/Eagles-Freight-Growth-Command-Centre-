# BUG FIX NOTES — Global Delete Function

## 1. What was broken

Delete was unreliable globally across the app. The project already had an attempted central delete helper, but the implementation was still incomplete and the repo had a TypeScript error in the diagnostics flow.

## 2. Root cause found

The issue was not one single visible button. It was the global delete pathway:

1. `src/lib/deleteRecord.ts` did not guard against missing Supabase configuration and could crash in local/demo mode.
2. `src/lib/deleteRecord.ts` allowed arbitrary table names instead of using a safe table allowlist.
3. The app needed a strict delete verification pattern: delete by `id`, filter by `user_id`, then `.select('id')` and reject zero deleted rows.
4. `Settings.tsx` called `dataService.getSupabaseClient()`, but `dataService` did not provide that method. This caused `npm run lint` / `tsc --noEmit` to fail.
5. Several delete handlers triggered a refetch after deletion but did not await the refetch, making UI verification weaker.
6. Supabase may also block deletes unless explicit DELETE grants and DELETE RLS policies exist. A safe SQL patch has been added as `SUPABASE_DELETE_POLICY_PATCH.sql`.

## 3. Files changed

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
- `DELETE_FIX_GUIDE.md`
- `BUG_FIX_NOTES.md`
- `test_delete.ts`

## 4. Delete function pattern used

For user-owned tables:

```ts
await supabase
  .from(tableName)
  .delete()
  .eq('id', recordId)
  .eq('user_id', user.id)
  .select('id');
```

For `profiles`:

```ts
await supabase
  .from('profiles')
  .delete()
  .eq('id', user.id)
  .select('id');
```

The helper throws an error if no row is deleted.

## 5. Tables covered

Level 1:

- `prospects`
- `customer_touches`
- `shipment_files`
- `route_cards`
- `journal_entries`
- `agents`
- `agent_touches`
- `weekly_reviews`

Level 2:

- `five_year_roadmap`
- `annual_goals`
- `quarterly_sprints`
- `skill_matrix`
- `market_intelligence`
- `ai_prompt_library`
- `growth_portfolio`

## 6. What was not changed

- Level 1 Daily KPI formula was not changed.
- Weekly KPI formula was not changed.
- Login logic was not redesigned.
- Supabase keys were not touched.
- No service role key was used.
- RLS was not disabled.
- No real company data was added.
- Hardcoded test credentials were removed from `test_delete.ts`; it now reads test credentials from local environment variables only.

## 7. Validation completed locally

These checks passed locally after the patch:

```bash
npm run lint
npm run build
```

A live Supabase delete test still requires running the SQL patch in Supabase and testing through the app with the demo account.

## 8. Remaining live action

Run `SUPABASE_DELETE_POLICY_PATCH.sql` once in Supabase SQL Editor. Then test delete on one dummy `prospects` row first. If it passes after browser refresh and Supabase Table Editor confirmation, continue table-by-table.
