# WallNos — Claude Kickstart

## What it is
A wallpaper discovery app. Users browse/search photos (Unsplash API), preview, download, upload their own, and save favorites. Favorites require login.

## Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Inline styles via `src/styles/styles.ts` + global CSS injected in `src/main.tsx`
- **Auth + DB:** Supabase (email/password auth, favorites stored in `favorites` table)
- **Deployment:** Vercel (auto-deploys on push to `main`)
- **Icons:** lucide-react

## Project structure
```
src/
  components/
    Header.tsx        # Search, categories, view modes, auth button
    PhotoGrid.tsx     # Hero + grid of cards + infinite scroll sentinel
    PhotoCard.tsx     # Single card with hover overlay
    PreviewModal.tsx  # Full image modal with nav, download, favorite
    UploadZone.tsx    # Drag-and-drop upload area
    AuthModal.tsx     # Login / signup / forgot password modal
  hooks/
    useAuth.ts        # Supabase session, signOut
    useFavorites.ts   # Favorites CRUD against Supabase (requires login)
    usePhotos.ts      # Unsplash API fetching + pagination
    useUploads.ts     # Local uploaded images (browser memory)
  lib/
    supabase.ts       # Supabase client (falls back to placeholder if env missing)
  styles/
    styles.ts         # All inline style objects (CSSProperties)
  constants/
    categories.ts     # Category list with Unsplash search queries
  main.tsx            # Global CSS vars, keyframes, media queries, app mount
  types.ts            # Photo type
```

## Environment variables
```
VITE_UNSPLASH_ACCESS_KEY   # Unsplash API key (optional — falls back to demo photos)
VITE_SUPABASE_URL          # https://oyfsbuwccadapgxyayzq.supabase.co
VITE_SUPABASE_ANON_KEY     # Supabase anon/publishable key
```
Local: `.env` file (gitignored). Production: set in Vercel dashboard → Environment Variables.

## Supabase schema
```sql
-- favorites table
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
- **All styles** are inline via `styles.ts` — no CSS files. Responsive overrides use CSS class names (e.g. `wallnos-grid`) targeted in the `<style>` block in `main.tsx`.
- **No CSS modules, no Tailwind.**
- Color theme uses CSS variables (`--bg`, `--text`, etc.) toggled by `body.dark` class.
- Accent color: `linear-gradient(135deg, #8b5cf6, #ec4899)` (violet → pink).
- Favorites: not stored if user is not logged in — clicking heart opens `AuthModal`.
- Uploads: stored in browser memory only (not persisted to Supabase yet).

## Dev
```bash
npm run dev     # local dev server
npm run build   # production build
```
