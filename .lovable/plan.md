

## Add Revenue/Earnings Tracking to Super Admin Dashboard

### What will be built

A new **"💰 Revenue"** tab in the SuperAdmin dashboard showing:

1. **Platform-wide totals** — Total pool across all matches, total support volume, and estimated platform fees (10% of pools)
2. **Per-venue revenue breakdown** — Each venue's total pool amount, match count, and fan engagement, displayed as sortable cards
3. **Revenue stat cards** at top — Total revenue (pools), platform fee earnings, total supports value

### How

**Single file change**: `src/pages/SuperAdminPage.tsx`

1. Add `"revenue"` to the `TabKey` union and add a `💰 Revenue` tab button
2. Query `supports` table for total support amounts (already public SELECT)
3. Compute revenue data from existing `matches` and `venues` queries:
   - Group matches by title (which contains venue info) to calculate per-venue pool totals
   - Sum all `pool` values across matches for platform total
   - Calculate 10% platform fee from total pools
4. Render the revenue tab with:
   - 3 StatCards: Total Pools, Platform Fees (10%), Total Supports
   - Per-venue breakdown cards showing pool totals, match counts, average pool per match

### Technical details

- No new database tables or queries needed beyond adding a `supports` aggregate query
- Revenue calculations use the existing 10% fee model from the platform economics
- All data derived from already-fetched `matches` array plus a new supports sum query
- Venue attribution done by cross-referencing match data with venues list

