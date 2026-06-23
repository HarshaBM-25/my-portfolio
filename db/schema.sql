-- Wikipedia-style portfolio — database schema
-- Run with: psql -U postgres -d portfolio_wiki -f schema.sql

DROP TABLE IF EXISTS list_items CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS "references" CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS profile CASCADE;

-- Singleton table: the infobox + intro
CREATE TABLE profile (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  photo_url   TEXT DEFAULT '',
  dob         TEXT DEFAULT '',          -- free text, e.g. "16 March 2005" — easier to edit than a strict date
  education   TEXT DEFAULT '',          -- short line shown in the infobox (full history lives in list_items)
  location    TEXT DEFAULT '',
  occupation  TEXT DEFAULT '',
  interests   TEXT[] DEFAULT '{}',
  intro       TEXT DEFAULT '',          -- the lead paragraph(s) under the title
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Free-text sections: Early Life, Research Interests, Contact, etc.
CREATE TABLE sections (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,     -- e.g. 'early_life'
  title       TEXT NOT NULL,            -- e.g. 'Early life'
  order_index INTEGER NOT NULL DEFAULT 0,
  content     TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Repeatable entries used by Education, Technical Skills, Experience,
-- Projects, Achievements and Certifications. Which section an item
-- belongs to is just a slug, so the admin panel can add/remove freely.
CREATE TABLE list_items (
  id           SERIAL PRIMARY KEY,
  section_slug TEXT NOT NULL,           -- 'education' | 'technical_skills' | 'experience' | 'projects' | 'achievements' | 'certifications'
  title        TEXT NOT NULL DEFAULT '',
  subtitle     TEXT DEFAULT '',
  description  TEXT DEFAULT '',
  link         TEXT DEFAULT '',
  date_start   TEXT DEFAULT '',
  date_end     TEXT DEFAULT '',
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- Timeline section
CREATE TABLE timeline_events (
  id          SERIAL PRIMARY KEY,
  event_date  TEXT NOT NULL DEFAULT '', -- free text, e.g. "2026" or "March 2026"
  title       TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

-- References section (footnotes) — includes the resume
CREATE TABLE "references" (
  id          SERIAL PRIMARY KEY,
  label       TEXT NOT NULL DEFAULT '',
  type        TEXT DEFAULT 'link',      -- 'resume' | 'link' | 'article' | 'other'
  url         TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_list_items_section ON list_items(section_slug);
