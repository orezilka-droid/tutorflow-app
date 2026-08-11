# TutorFlow

A Hebrew RTL tutoring-CRM app for private tutors — plan lessons, track students, manage payments, and send WhatsApp reminders. Built with Vite + React, backed by Supabase for authentication and data storage.

## Running locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Supabase setup

This app is already wired to a live Supabase project via `.env` (URL + anon key are filled in). If you ever need to point it at a different project:

1. Copy `.env.example` to `.env` if it doesn't exist.
2. In your [Supabase dashboard](https://supabase.com/dashboard) → your project → **Settings → API**, copy the **Project URL** and the **anon/public key**.
3. Paste them into `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart `npm run dev` after changing `.env`.

`.env` is git-ignored — never commit real credentials.

### Database schema

The live project already has the tables this app expects: `students`, `lessons`, and `templates`, each scoped to the signed-in user via `user_id` + Row Level Security. There is no `schema.sql` file to run — the schema already exists on the Supabase project referenced in `.env`.

If you ever spin up a **fresh** Supabase project, you'll need to create matching tables yourself (via the Table Editor or SQL editor) with these columns:

- **students**: `id`, `user_id (uuid, references auth.users)`, `name`, `phone`, `grade`, `subject`, `hourly_rate`, `notes`, `active (boolean, nullable)`, `created_at`
- **lessons**: `id`, `user_id`, `student_id (references students)`, `student_name`, `date`, `time`, `duration`, `price`, `status ('paid'|'unpaid')`, `subject`, `notes`, `created_at`
- **templates**: `id`, `user_id`, `key (text)`, `label (text, nullable)`, `body (text)`, `created_at` — one row per message template (`reminder`, `payment`, `confirmation`, plus any user-added `custom_N` templates)

Enable Row Level Security on all three tables with policies like:
```sql
create policy "own rows only" on students
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- repeat for lessons and templates
```

### Email/password auth

Email/password sign-up and sign-in work out of the box — Supabase's built-in auth handles this with no extra configuration. Depending on your project's auth settings, new sign-ups may need to confirm their email before they can log in (**Authentication → Providers → Email** in the dashboard controls this).

### Google sign-in (not yet enabled)

The login screen has a "כניסה עם Google" (Sign in with Google) button in place, but it isn't wired up to a working OAuth flow yet — clicking it currently just shows a "coming soon" message. To enable it later:

1. In the [Google Cloud Console](https://console.cloud.google.com/), create an OAuth Client ID (type: **Web application**).
2. Add your Supabase auth callback URL as an **Authorized redirect URI** — find it in the Supabase dashboard under **Authentication → Providers → Google** (it looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`).
3. Copy the generated **Client ID** and **Client Secret** into the Supabase dashboard: **Authentication → Providers → Google** → paste both values → toggle the provider **on** → **Save**.
4. In `src/screens/LoginScreen.jsx`, replace the `handleGoogle` function's body with:
   ```js
   const { error: err } = await supabase.auth.signInWithOAuth({
     provider: "google",
     options: { redirectTo: window.location.origin },
   });
   ```

## Project structure

```
src/
  App.jsx              — top-level auth/session flow (splash → login → app)
  TutorFlowApp.jsx      — main app shell: state, data loading, all modals/overlays
  assets/               — image assets (webp) + images.js re-export
  components/Small.jsx  — shared small components (Badge, SectionCard, Sheet, ...)
  lib/
    theme.js            — design tokens (colors, stroke width)
    dates.js            — date/time helpers
    utils.js             — WhatsApp helpers, template filling, defaults
    supabaseClient.js    — Supabase client instance
    db.js                — all Supabase CRUD calls + row<->app-model mapping
  screens/               — one file per screen/modal (Home, Lessons, Students,
                            Payments, Messages, Settings, Add/Edit forms, etc.)
```

## Notes on scope

- There's no `settings` table in the database — teacher name, default rate, default duration, and the "inactive after N days" threshold are local-only React state (reset on reload). Everything else (students, lessons, message templates) persists to Supabase per signed-in user.
- The `location` field (per-student) and `total_hours` (stored per-student) fields from the original prototype don't have matching database columns; `total_hours` is now computed on the fly from the lessons list instead of stored.
