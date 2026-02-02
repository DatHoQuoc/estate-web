# Agent Guide

## Overview
- Vite + React 19 + React Router 7 single-page app; components live under `app/` and are imported via path aliases rather than Next.js routing.
- Styling uses Tailwind v4 (PostCSS inline `@theme`) with design tokens defined in `app/globals.css`; Radix UI primitives + shadcn-style wrappers in `components/ui/`.
- Icons from `lucide-react`; utility helpers in `lib/utils.ts` (`cn`).
- Mock data for UI demos in `lib/mock-data.ts`; real API helpers in `lib/api-client.ts` with `VITE_API_BASE` (default `http://localhost:8080`).

## Run & Build
- Install: `pnpm install` (pnpm lockfile present).
- Dev server: `pnpm dev` (Vite).
- Production build: `pnpm build`; preview: `pnpm preview`.
- Environment: set `VITE_API_BASE` to your backend base URL; defaults to local.

## Entry Points & Routing
- App bootstraps in [src/main.tsx](src/main.tsx) and renders routes defined in [src/App.tsx](src/App.tsx).
- Routes:
  - `/` → landing page ([app/page.tsx](app/page.tsx)).
  - `/seller` → seller dashboard listing table ([app/seller/page.tsx](app/seller/page.tsx)).
  - `/seller/create` → create listing flow ([app/seller/create/page.tsx](app/seller/create/page.tsx)).
  - `/seller/listings/:id` → listing detail ([app/seller/listings/[id]/page.tsx](app/seller/listings/[id]/page.tsx)).
  - `/seller/listings/:id/feedback` → AI/staff feedback view ([app/seller/listings/[id]/feedback/page.tsx](app/seller/listings/[id]/feedback/page.tsx)).
  - `/seller/listings/:id/edit` → edit listing ([app/seller/listings/[id]/edit/edit-listing.tsx](app/seller/listings/[id]/edit/edit-listing.tsx)).
  - `/seller/listings/:id/tour/edit` → virtual tour editor ([app/seller/listings/[id]/edit/tour-editor.tsx](app/seller/listings/[id]/edit/tour-editor.tsx)).
  - `/staff` → staff review queue ([app/staff/page.tsx](app/staff/page.tsx)).
  - `/staff/review/:id` → staff review detail ([app/staff/review/[id]/page.tsx](app/staff/review/[id]/page.tsx)).

## Data Layer
- API helper `fetchJson` wraps `fetch` with JSON handling and an `X-User-Id` header; see [lib/api-client.ts](lib/api-client.ts).
- Listing endpoints: `listSellerListings`, `getListingDetails`, CRUD operations, submit for review, amenity updates, document upload (`FormData`), virtual tours, POI fetch.
- Geocoding via Nominatim in `getCoordinates`.
- Mock datasets (`mockListings`, `mockReviewQueue`, `mockAIChecks`, etc.) drive UI when backend is absent.

## Types & Models
- Primary domain types live in [lib/types.ts](lib/types.ts) (listing, user, location, feedback, review queue, pagination).
- Note: `Listing` is defined twice with differing shapes; reconcile before relying on strict typing.

## UI & Styling
- Global theme tokens and dark-mode variants are defined in [app/globals.css](app/globals.css); uses OKLCH palette and Tailwind CSS v4 imports (`@import 'tailwindcss'; @import 'tw-animate-css';`).
- Layout wrappers: [components/layout/navbar.tsx](components/layout/navbar.tsx), [components/layout/seller-sidebar.tsx](components/layout/seller-sidebar.tsx), [components/layout/staff-sidebar.tsx](components/layout/staff-sidebar.tsx).
- Common widgets: stats cards, search/filter controls, pagination, badges, tables under `components/common/` and `components/ui/`.

## Development Notes
- Path aliases set in [tsconfig.json](tsconfig.json): `@app/*`, `@/components/*`, `@/lib/*`, etc.
- Components are marked `"use client"` but run in a Vite SPA; keep React Router context when adding pages.
- API_BASE defaults to localhost; update `.env` with `VITE_API_BASE` for real backends. API calls expect UUID-like `X-User-Id` header; adjust if backend auth changes.
- Tailwind v4 is configured via CSS imports (no `tailwind.config.js`). Use the CSS variables in `:root`/`.dark` for consistent theming.

## Quick Tasks Checklist
- Need data? Swap mock data with `lib/api-client` calls and wire loading/error states.
- Adding a route? Declare in `src/App.tsx` and place the component under `app/...` following existing structure.
- Styling tweaks? Edit `app/globals.css` tokens or component-level classes; keep consistency with CSS variables.
- Type cleanup recommended: deduplicate `Listing` shape in `lib/types.ts` and align mapping in `lib/api-client.ts`.
