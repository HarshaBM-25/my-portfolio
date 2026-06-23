# Harsha BM — Wikipedia-style portfolio

A personal portfolio that looks and reads like a Wikipedia article: a
title, an infobox, a table of contents, and numbered sections, all
editable from a password-protected `/admin` panel. No CMS, no
page builder — just three folders.

```
portfolio-wiki/
├── frontend/   Next.js (App Router) + Tailwind CSS — the public page and /admin
├── backend/    Node.js + Express — REST API, JWT-protected writes
└── db/         PostgreSQL schema + seed data (pre-filled from your resume)
```

## 1. Database

Create a database and load the schema + seed data:

```bash
createdb portfolio_wiki
psql -U postgres -d portfolio_wiki -f db/schema.sql
psql -U postgres -d portfolio_wiki -f db/seed.sql
```

`seed.sql` pre-fills the page with your resume content (education,
skills, projects, certifications, a generated timeline, etc.) so the
site has real content on first run — everything in it is editable
later from `/admin`.

## 2. Backend

```bash
cd backend
cp .env.example .env     # edit DB credentials, ADMIN_PASSWORD, JWT_SECRET
npm install
npm run dev               # or: npm start
```

Runs on `http://localhost:5000`. Your resume PDF is already sitting in
`backend/uploads/resume_final.pdf` and is referenced from the
References section — it's served at `/uploads/resume_final.pdf`.

**Set a real `ADMIN_PASSWORD` in `backend/.env` before deploying.**
That's the password for `/admin` — it's read from the environment, not
committed to the repo.

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # points at the backend API
npm install
npm run dev                        # or: npm run build && npm start
```

Runs on `http://localhost:3000`.

- `/` — the public wiki page
- `/admin` — log in with `ADMIN_PASSWORD` to edit literally everything:
  infobox fields + photo, intro, Early life / Research interests /
  Contact text, Education, Technical Skills, Experience, Projects,
  Achievements, Certifications, Timeline, and References (add, edit,
  delete, reorder — and upload files like your resume directly from
  the References tab).

## How content maps to the page

| Section          | Stored as                                  |
|-------------------|---------------------------------------------|
| Infobox + intro   | `profile` table (one row)                   |
| Early life, Research interests, Contact | `sections` table (free text) |
| Education, Technical Skills, Experience, Projects, Achievements, Certifications | `list_items` table, grouped by `section_slug` |
| Timeline          | `timeline_events` table                     |
| References        | `references` table (includes your resume)   |

## Notes

- Auth is intentionally simple: one hardcoded password (in `.env`)
  exchanged for a short-lived JWT, checked on every write route. No
  user accounts, no signup — it's a single-owner admin panel.
- Deploying: point `NEXT_PUBLIC_API_URL` (frontend) at your deployed
  backend URL, and `CORS_ORIGIN` (backend) at your deployed frontend
  URL. Any host that runs Node + Postgres works (Render, Railway,
  a VPS, etc.).
