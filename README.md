# Sangat Restaurant Multan: Website & Admin

A cinematic, fully responsive website for **Sangat Restaurant, Multan**, with a working reservation system and an admin panel for managing the whole site without touching code.

> All restaurant facts come from [`RESEARCH.md`](./RESEARCH.md). Nothing is invented: unverified prices show as **"Price on request"**, and every unconfirmed detail can be edited in the admin panel.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, design tokens in `src/app/globals.css` |
| Motion | GSAP 3 + ScrollTrigger (one animation library, no smooth-scroll hijacking) |
| Database | MongoDB via Mongoose |
| Auth | bcrypt password hashes + signed, httpOnly, SameSite=Strict JWT cookie (`jose`) |
| Validation | Zod, on every API input |
| Fonts | Cormorant Garamond (editorial serif) + Manrope (UI sans), via `next/font` |

## Features

**Public site** (`/`, `/menu`)
- Cinematic intro (warm glow, the SANGAT wordmark rising in perspective, zoom into the hero). About 3 seconds, skippable, shown once per session, skipped for reduced-motion users.
- Full-screen hero with clip-path reveal, staggered headline, slow push-in on scroll.
- Navigation that is transparent over the hero and solid on scroll, with active-section indicator, a full-screen mobile menu (focus trap, Escape to close), skip-to-content link, and a scroll progress bar.
- Brand story with masked image reveals, parallax and an editorial layout. It tells the experience, never an invented history.
- Experience section: a sticky cinematic image that cross-fades per highlight. Only highlights switched on in the admin are shown.
- Signature dishes: pinned horizontal scroll on desktop, native swipe on mobile (no scroll-jacking).
- Menu: category filter, live search, empty state, spice level, dietary tags, availability, and a full `/menu` page.
- Craft section, a gallery with filters, masonry layout and an accessible lightbox (keyboard arrows, swipe, Escape), reviews with source and date, family and group inquiry form, reservation form, location with a lazy-loaded map, directions and WhatsApp, a contact form, and the footer.
- Reservations are clearly labelled as **requests awaiting confirmation**, with a WhatsApp fallback.

**Admin** (`/admin`)
- Dashboard with real counts (reservations by status, menu items, unavailable dishes, unpriced dishes, inquiries), upcoming pending requests and recent activity.
- Reservations: search, filter by status or date, confirm, reject or cancel, edit date, time, guests and seating, internal notes, WhatsApp the guest, delete.
- Menu: add, edit and delete dishes, set prices, upload photos, mark available or signature, plus category management (add, rename, reorder, delete with a safety check).
- Gallery: multi-upload, alt text, captions, categories, reorder, delete.
- Website content: hero, story, contact details, map coordinates, opening hours, socials, experience highlights, craft steps, rating and reviews, reservation and group text, footer.
- Inquiries inbox: new, read or archived.

**Security**
- No public sign-up. Admins are created only with `npm run create-admin`.
- Middleware guards `/admin/*` and `/api/admin/*`, and every admin API and page re-checks the session server-side against the database.
- bcrypt (cost 12), constant-shape login errors, and rate limiting on login, reservations and inquiries.
- Same-origin check on admin mutations, Zod validation everywhere, ObjectId validation, regex-escaped search, and uploads checked by magic bytes (JPEG, PNG, WebP, AVIF only, 4 MB maximum).
- Honeypot fields on public forms, and duplicate-booking prevention (client idempotency plus a unique key on phone, date and time).
- Security headers (`nosniff`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy). Admin pages are `noindex`, and robots disallows `/admin` and `/api`.

**SEO and accessibility**
- Metadata, canonical URLs, Open Graph image, `sitemap.xml`, `robots.txt`, and `Restaurant` JSON-LD built only from stored facts (no self-served rating markup).
- Semantic landmarks, labelled form fields with inline error messages, focus-visible styles, keyboard-operable menus and lightbox, alt text, and `prefers-reduced-motion` support (content is fully visible without animation or JavaScript).

## Project structure

```
src/
  app/
    page.tsx                 Home (all sections)
    menu/page.tsx            Full menu
    admin/login/             Admin sign-in
    admin/(panel)/           Dashboard, reservations, menu, gallery, content, inquiries
    api/reservations         Public: create reservation request
    api/inquiries            Public: contact and group inquiries
    api/media/[id]           Serves uploaded images
    api/admin/*              Protected CRUD APIs
    sitemap.ts robots.ts opengraph-image.tsx
  components/                Public sections (Hero, Story, Experience, Signature, MenuBrowser, Gallery, ...)
  components/admin/          Admin UI
  lib/
    models/                  Mongoose models
    validation.ts            Zod schemas
    defaults.ts              Researched default content (no invented prices)
    data.ts                  Loads site data, falls back to defaults if the DB is unavailable
    auth.ts session.ts       Admin session handling
  middleware.ts              Route protection
scripts/seed.ts              Seeds content and the first admin (safe to re-run)
scripts/create-admin.ts      Creates or resets an admin
tests/                       Unit tests (node:test)
```

### Database collections
`settings` (single document of editable site content: hero, story, contact, hours, socials, reviews), `categories`, `menuitems`, `reservations`, `inquiries`, `galleryimages`, `media` (uploaded image bytes), `adminusers`, `activities`.

Images are stored in MongoDB, so the site runs on serverless hosts (such as Vercel) with no writable disk. For heavy photo libraries you can later swap `api/admin/upload` to S3 or Cloudinary.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes (for bookings and admin) | MongoDB connection string |
| `AUTH_SECRET` | yes | 32+ random characters for signing sessions (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_SITE_URL` | yes in production | e.g. `https://sangatrestaurant.pk`, used for canonical URLs, the sitemap and Open Graph |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for seeding | First admin account. Don't use `#` in values in `.env` files (it starts a comment). |

Without `MONGODB_URI`, the public site still renders using the researched defaults, and the forms explain that online booking is unavailable.

## Local development

```bash
npm install
cp .env.example .env.local          # then fill in values
# MongoDB: use Atlas, or locally: docker run -d -p 27017:27017 mongo:7
npm run seed                        # content + first admin
npm run dev                         # http://localhost:3000, admin at /admin
```

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Deployment (Vercel + MongoDB Atlas)

1. Create a free MongoDB Atlas cluster, add a database user, and allow network access from `0.0.0.0/0` (or Vercel's IPs).
2. Import this repo in Vercel and set `MONGODB_URI`, `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL`.
3. Run the seed once from your machine against the Atlas URI: `MONGODB_URI=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed`.
4. Deploy, then sign in at `/admin` and replace the placeholders.

The in-memory rate limiter protects each server instance. On multi-instance hosting, add a shared limiter (for example Upstash) or a WAF rule.

## Still needs the restaurant's confirmation

See [`RESEARCH.md`](./RESEARCH.md) for sources. Before launch, the owner should confirm or supply:

1. **Menu prices.** None could be verified, so every dish shows "Price on request". Also the full dish list, portion sizes and any family deals.
2. **Real photographs** for the hero, story, experience, signature dishes, craft and gallery. All image slots currently show labelled placeholders, and no stock photos are used.
3. **Opening hours.** Defaults to 5:00 PM to 2:00 AM daily (one directory also lists a noon opening).
4. **WhatsApp.** The WhatsApp buttons use +92 345 8933300 until a dedicated number is set.
5. **Experience highlights.** Charpai seating and family sitting areas come from a single directory and are shown. Live music is hidden until confirmed.
6. **Reviews and rating.** The rating is a Google snapshot (4.0 from 352 reviews, Nov 2026) plus three verbatim Google reviews. Re-check before launch.
7. **Facebook page** (none found), email address, and any founding story the owners want told.
8. **Group dining.** The inquiry form only promises a call back, not packages. Edit the text once services are confirmed.

## Previews

Screenshots are in [`docs/screenshots`](./docs/screenshots), and short walkthrough videos (desktop, mobile, admin) are in [`docs/demo`](./docs/demo).
