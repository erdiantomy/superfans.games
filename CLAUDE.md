# SuperFans Pro — Fan Engagement Platform

## Stack
- React 18 + TypeScript + Vite
- Supabase (auth, DB, edge functions, realtime)
- shadcn/ui + Tailwind CSS
- Remotion (video generation in /remotion)
- Xendit (payments: create-payment, xendit-webhook)
- Vitest for testing

## Architecture
- `/src/components/fanprize/` — core fan prize/match experience
- `/src/components/arena/` — arena/competition features
- `/src/components/wallet/` — credits, transactions
- `/src/components/profile/` — player profiles, claims, donations
- `/src/components/ui/` — shadcn components (DO NOT manually edit)
- `/src/pages/` — route-level pages
- `/src/hooks/` — useAuth, useArena, useData, useRealtime, useVenue, useNotifications, useAdmin
- `/src/lib/` — gamification logic, admin notifications, utils
- `/src/data/` — constants + tests
- `/src/integrations/supabase/` — client + types
- `/supabase/functions/` — create-payment, notify-admin, send-notification-email, xendit-webhook
- `/supabase/migrations/` — DB schema (20+ migrations)
- `/remotion/` — video generation (separate package.json)

## Auth & Roles
- Supabase Auth
- Roles: player, host, admin, super-admin
- RLS enforced — never expose cross-user data
- Admin panel at `/admin`, super-admin at `/super-admin`

## Key Domain Concepts
- XP/gamification system (`src/lib/gamification.ts`)
- Credits/wallet with top-up and payment flows
- Match results and fan prizes
- Player profiles with slug-based routing
- Venue registration and management
- Real-time updates via Supabase realtime

## Build & Test
```bash
npm run dev          # local dev
npm run build        # MUST pass before PR
npm run lint
npx tsc --noEmit
npx vitest run       # run tests
```

## Edge Functions (Deno)
- No Playwright/headless browser in Deno runtime
- Xendit webhook handles payment callbacks
- Notification email via edge function

## Testing
- Vitest setup in `/src/test/`
- Integration tests: session-lifecycle, support-payout, venue-registration, xp-progression
- Mock fixtures in `/src/test/mocks/`
- Page-level tests for all major pages
