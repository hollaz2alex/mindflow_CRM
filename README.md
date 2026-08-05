# MindFlow CRM

A single-tenant CRM: contacts move through a pipeline, and every interaction is
logged as an activity against a contact. Two tables, one relationship.

**Stack:** React 18 + Vite · Tailwind + shadcn/ui · React Router v6 ·
TanStack Query · Recharts · lucide-react · Supabase (Postgres + Auth + RLS) ·
deployed on Vercel.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev
```

### Environment

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Anon key only — the service role key must never reach the client bundle. Set the
same two vars in Vercel project settings.

## Database

Apply the SQL migrations in `supabase/migrations/` to your Supabase project, in
order:

1. `20260723000001_init_schema.sql` — tables, triggers, indexes
2. `20260723000002_rls_policies.sql` — Row Level Security policies

With the Supabase CLI:

```bash
npx supabase db push
```

Or paste each file into the Supabase SQL editor.

### Schema

- **`contacts`** — the people in your pipeline.
- **`activities`** — interactions logged against a contact
  (`contact_id → contacts.id`, `ON DELETE CASCADE`).

Two triggers:
- `update_updated_date()` keeps `updated_date` fresh on every UPDATE.
- `update_last_contacted()` bumps `contacts.last_contacted` after each activity
  insert. **The client relies on this — it never writes `last_contacted`
  itself.**

## Auth

Supabase Auth — email/password (with email confirmation) plus Google OAuth.
In the Supabase dashboard: enable Email + Google providers and set redirect URLs
to `https://your-app.vercel.app/**` (and your local dev origin).

## Commands

```bash
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview the build
npm run lint      # eslint
```

## Conventions

- All data access goes through TanStack Query hooks in `src/hooks/` — no bare
  `useEffect` + `fetch`, and no Supabase calls in component bodies.
- Enums live in `src/lib/crmConstants.js` and must stay in sync with the Postgres
  CHECK constraints.
- `cn()` from `src/lib/utils.js` for conditional classNames.
- Modals are shadcn `Dialog`; forms are controlled with `onClick` submit
  handlers (no `<form>` submit).
- JavaScript (JSX), not TypeScript.

## Project structure

```
src/
├── pages/          Dashboard, Contacts, ContactDetail, ActivityPage, auth/
├── components/
│   ├── crm/        Layout, Sidebar, forms, cards, StageBar, import wizard
│   └── ui/         shadcn primitives
├── hooks/          useContacts, useActivities, useAuth
└── lib/            supabaseClient, crmConstants, format, csv, utils
supabase/
└── migrations/     schema + RLS
```
