# WallNos — Claude Kickstart

## What it is
A wallpaper discovery app. Users browse/search Unsplash photos, preview, download, upload their own, and save favorites. Favorites require a login. Deployed at wallnos.vercel.app.

## Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Inline styles via `src/styles/styles.ts` + global CSS injected in `src/main.tsx`
- **Auth + DB:** Supabase (email/password + Google OAuth, favorites in `favorites` table)
- **Photos:** Unsplash API (falls back to demo photos if no API key)
- **Uploads:** IndexedDB via `useUploads` hook (local only, not in Supabase)
- **Deployment:** Vercel — auto-deploys on push to `main`
- **Icons:** lucide-react

## Project structure
```
src/
  components/
    Header.tsx        # Search, categories, view modes, dark toggle, auth button
    PhotoGrid.tsx     # Hero + skeleton loading + card grid + infinite scroll
    PhotoCard.tsx     # Single card — shimmer placeholder, hover/tap overlay
    PreviewModal.tsx  # Full image modal — swipe nav, download, favorite, copy
    UploadZone.tsx    # Drag-and-drop / click-to-upload
    AuthModal.tsx     # Login / signup / forgot password + success animation
  hooks/
    useAuth.ts        # Supabase session state, signOut
    useFavorites.ts   # Favorites CRUD against Supabase (requires login)
    usePhotos.ts      # Unsplash API fetch + pagination + demo fallback
    useUploads.ts     # IndexedDB uploads (browser-local, not synced)
  lib/
    supabase.ts       # Supabase client (placeholder fallback if env missing)
  styles/
    styles.ts         # All CSSProperties style objects
  constants/
    categories.ts     # Category labels + Unsplash search queries + demo data
  main.tsx            # CSS variables, keyframes, media queries, app entry
  types.ts            # Photo type definition
  vite-env.d.ts       # Vite import.meta.env types
```

## Environment variables
```
VITE_UNSPLASH_ACCESS_KEY   # Unsplash API key (optional — shows demo photos if missing)
VITE_SUPABASE_URL          # https://oyfsbuwccadapgxyayzq.supabase.co
VITE_SUPABASE_ANON_KEY     # Legacy anon key (eyJ...) from Supabase → Settings → API Keys → Legacy tab
```
Local: `.env` file (gitignored). Production: Vercel → project Settings → Environment Variables.

## Supabase schema
```sql
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  photo_id text not null,
  photo_data jsonb not null,
  created_at timestamp with time zone default now(),
  unique(user_id, photo_id)
);
alter table favorites enable row level security;
create policy "Users can manage their own favorites"
  on favorites for all using (auth.uid() = user_id);
```

## Key conventions
- **All styles** are inline `CSSProperties` in `styles.ts` — no CSS files, no Tailwind, no CSS modules.
- **Responsive overrides** use CSS class names (e.g. `wallnos-grid`, `wallnos-overlay`) targeted in the `<style>` block in `main.tsx`. Add a className + override there, don't touch inline styles for mobile.
- **Theming** uses CSS variables (`--bg`, `--text`, `--border`, etc.) toggled by `body.dark` class. Dark mode preference saved in `localStorage`.
- **Accent gradient:** `linear-gradient(135deg, #8b5cf6, #ec4899)` (violet → pink) — used on active pills, logo, buttons, auth modal.
- **Favorites** require login — clicking heart when logged out opens `AuthModal`.
- **Uploads** are IndexedDB only (not in Supabase).
- **Swipe navigation** in `PreviewModal` via `onTouchStart`/`onTouchEnd` (50px threshold).
- **Card overlays** always visible on touch devices via `@media (hover: none)` CSS.
- **Skeleton loading** shows 12 shimmer cards (matching grid layout) instead of a spinner.

## Mobile breakpoints (in main.tsx)
| Breakpoint | Changes |
|---|---|
| `≤ 768px` | Header wraps, search full-width, view modes hidden, hero 260px, overlay centered |
| `≤ 480px` | Grid 1 column, hero 200px |
| `hover: none` | Card overlays always visible (touch devices) |

## Auth flow
- `useAuth` → Supabase session on mount + `onAuthStateChange` listener
- Login success → 1.4s animated success screen → modal closes
- Logout → 800ms checkmark animation → `supabase.auth.signOut()`
- Google OAuth configured in Supabase but requires Google Cloud Console setup

## Dev
```bash
npm run dev     # local dev (reads .env)
npm run build   # production build
git push        # triggers Vercel auto-deploy
```
