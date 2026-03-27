# WallNos — Architecture

## Overview

WallNos is a client-side React SPA. There is no custom backend — all server-side concerns (auth, database) are delegated to Supabase. Photos are fetched from the Unsplash API directly from the browser.

```
Browser (React SPA)
    ├── Unsplash API          → photos, search, pagination
    ├── Supabase Auth         → login, signup, session management
    ├── Supabase Database     → favorites table (per user)
    └── IndexedDB             → uploaded photos (local, per device)
```

---

## Data Flow

### Photo browsing
```
User types search / picks category
  → usePhotos hook debounces (500ms)
  → GET api.unsplash.com/search/photos
  → photos state updated
  → PhotoGrid renders cards
  → IntersectionObserver at bottom → fetches next page
```

### Favorites
```
User clicks heart
  ↓
Not logged in?  → open AuthModal
Logged in?      → useFavorites.toggleFav(photo)
                    → INSERT/DELETE favorites row in Supabase
                    → local state updated immediately (optimistic)
```

### Auth
```
App mounts
  → useAuth calls supabase.auth.getSession()
  → sets user state
  → onAuthStateChange keeps it in sync

Login modal submitted
  → supabase.auth.signInWithPassword()
  → success: 1.4s animation → modal closes → user state updates
  → failure: error message shown inline
```

### Uploads
```
User drops / picks file
  → useUploads.addUpload(file)
  → FileReader → base64
  → stored in IndexedDB (browser-local)
  → displayed in "My Uploads" view
  → NOT synced to Supabase
```

---

## Component Tree

```
App
├── Header
│   ├── Logo (gradient text)
│   ├── SearchInput
│   ├── CategoryPills
│   ├── ViewModeToggle (grid / masonry / large)
│   ├── DarkModeToggle
│   ├── FavoritesToggle
│   ├── UploadsToggle
│   └── AuthButton (Sign in / Avatar + Sign out)
├── PhotoGrid
│   ├── HeroCard (first photo, featured)
│   ├── SkeletonCards (12 shimmer cards while loading)
│   └── PhotoCard × N
│       ├── ShimmerPlaceholder (while image loads)
│       ├── img (lazy loaded)
│       └── CardOverlay (photographer, Preview btn, Heart, Download)
├── PreviewModal (portal-like, always in tree)
│   ├── img (full size)
│   ├── NavButtons (prev / next)
│   ├── PreviewBar (photographer, copy, heart, download)
│   └── CloseButton
├── UploadZone (only when uploads tab active)
└── AuthModal (only when showAuthModal = true)
    ├── SuccessScreen (animated, 1.4s)
    └── Form (login / signup / forgot)
```

---

## State Management

All state lives in `App.tsx` via `useState` — no external state library. Hooks encapsulate async logic and return plain values.

| State | Where | Persisted |
|---|---|---|
| `photos` | `usePhotos` | No (re-fetched) |
| `favorites` | `useFavorites` | Supabase DB |
| `uploads` | `useUploads` | IndexedDB |
| `user` | `useAuth` | Supabase session cookie |
| `darkMode` | `App` | localStorage |
| `search`, `activeCategory`, `page` | `App` | No |
| `viewMode` | `App` | No |
| `previewIndex` | `App` | No |

---

## Styling System

No CSS files. Two layers:

1. **`src/styles/styles.ts`** — a single `StyleMap` object of `CSSProperties`. Used as inline styles on every element. Covers all components, modal, hero, grid, etc.

2. **`src/main.tsx` `<style>` block** — injected into `document.head` on startup. Contains:
   - CSS custom properties (`--bg`, `--text`, etc.) for light and dark themes
   - `body.dark` overrides for dark mode
   - `@keyframes` (fadeIn, fadeInUp, modalIn, shimmer, spin, scaleIn, slideUp)
   - Media query overrides targeting `.wallnos-*` class names

**Why two layers?** Inline styles can't do media queries or pseudo-selectors, so responsive/hover/dark overrides use the injected stylesheet with class names as hooks.

### CSS variable reference
| Variable | Purpose |
|---|---|
| `--bg` | Page background |
| `--bg-header` | Header with opacity |
| `--bg-card` | Card / skeleton background |
| `--bg-search` | Search input background |
| `--border` | Divider lines |
| `--border-ui` | Button borders |
| `--text` | Primary text |
| `--text-sec` | Secondary text |
| `--text-muted` | Placeholder / muted text |
| `--shimmer-highlight` | Shimmer animation highlight |
| `--active-bg` / `--active-text` | Generic active state (mostly unused now — replaced by gradient) |

### Accent system
All interactive active states use the brand gradient:
```css
linear-gradient(135deg, #8b5cf6, #ec4899)  /* violet → pink */
```
Applied to: active category pills, view mode active, logo text, sign-in button, auth modal submit, auth modal logo icon.

---

## Mobile Strategy

| Concern | Solution |
|---|---|
| Responsive layout | CSS media queries in `main.tsx` on `.wallnos-*` classes |
| Card overlays on touch | `@media (hover: none)` always shows overlay |
| Swipe in modal | `onTouchStart` / `onTouchEnd` with 50px threshold |
| Body scroll lock (iOS) | `position: fixed` + `top: -scrollY` on body, restored on close |
| Safe area (iPhone home bar) | `env(safe-area-inset-bottom)` on preview bar padding |
| Modal position | Centered with `align-items: center` (not bottom sheet) |

---

## Supabase

### Auth providers
- **Email + password** — enabled by default
- **Google OAuth** — configured in Supabase but requires Google Cloud Console credentials

### Database
Single table: `favorites`

```
favorites
  id          uuid PK
  user_id     uuid FK → auth.users(id) CASCADE DELETE
  photo_id    text  (Unsplash photo ID)
  photo_data  jsonb (full Photo object snapshot)
  created_at  timestamptz
  UNIQUE(user_id, photo_id)
```

Row Level Security is enabled. Users can only read/write their own rows.

### URL configuration (Supabase → Auth → URL Configuration)
```
Site URL:      https://wallnos.vercel.app
Redirect URLs: https://wallnos.vercel.app/**
               http://localhost:5173/**
```

---

## Deployment

```
git push main
  → Vercel detects push
  → runs: npm run build (vite build)
  → deploys dist/ to CDN
  → live at wallnos.vercel.app
```

Environment variables are set in Vercel → project → Settings → Environment Variables (not team-level).

---

## Known Limitations

| Limitation | Notes |
|---|---|
| Uploads not synced | Stored in IndexedDB — lost on different device / browser clear |
| Google OAuth not fully configured | Needs Google Cloud Console OAuth app |
| No Unsplash key in production | Running in demo mode (picsum photos) unless key is added |
| No error UI | API failures fail silently (fall back to demo or show nothing) |
| No image optimization | Uses Unsplash's `urls.small` for cards, `urls.regular` for modal |
