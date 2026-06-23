const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('./db');
const { login, requireAdmin } = require('./auth');
const supabase = require('./supabase');
const router = express.Router();

// ---------------------------------------------------------------------
// File uploads (photo, resume) — saved to /uploads, served statically
// by server.js. Admin-only.
// ---------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file received' });
    }

    const safeName =
      Date.now() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(safeName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    res.json({ url: publicUrlData.publicUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------
router.post('/auth/login', (req, res) => {
  const token = login(req.body.password);
  if (!token) return res.status(401).json({ error: 'Incorrect password' });
  res.json({ token });
});

// ---------------------------------------------------------------------
// Profile (singleton — infobox + intro)
// ---------------------------------------------------------------------
router.get('/profile', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM profile ORDER BY id LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) { next(err); }
});

router.put('/profile', requireAdmin, async (req, res, next) => {
  try {
    const { name, photo_url, dob, education, location, occupation, interests, intro } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM profile ORDER BY id LIMIT 1');

    let result;
    if (existing.length === 0) {
      result = await pool.query(
        `INSERT INTO profile (name, photo_url, dob, education, location, occupation, interests, intro)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [name, photo_url, dob, education, location, occupation, interests, intro]
      );
    } else {
      result = await pool.query(
        `UPDATE profile SET name=$1, photo_url=$2, dob=$3, education=$4, location=$5,
         occupation=$6, interests=$7, intro=$8, updated_at=now() WHERE id=$9 RETURNING *`,
        [name, photo_url, dob, education, location, occupation, interests, intro, existing[0].id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------
// Sections (free-text: Early life, Research interests, Contact, ...)
// ---------------------------------------------------------------------
router.get('/sections', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sections ORDER BY order_index ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/sections', requireAdmin, async (req, res, next) => {
  try {
    const { slug, title, order_index, content } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO sections (slug, title, order_index, content) VALUES ($1,$2,$3,$4) RETURNING *`,
      [slug, title, order_index || 0, content || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/sections/:id', requireAdmin, async (req, res, next) => {
  try {
    const { slug, title, order_index, content } = req.body;
    const { rows } = await pool.query(
      `UPDATE sections SET slug=$1, title=$2, order_index=$3, content=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [slug, title, order_index || 0, content || '', req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Section not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/sections/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM sections WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------
// List items (Education, Technical Skills, Experience, Projects,
// Achievements, Certifications — anything with repeatable entries)
// ---------------------------------------------------------------------
router.get('/list-items', async (req, res, next) => {
  try {
    const { section } = req.query;
    const { rows } = section
      ? await pool.query(
          'SELECT * FROM list_items WHERE section_slug=$1 ORDER BY order_index ASC, id ASC',
          [section]
        )
      : await pool.query('SELECT * FROM list_items ORDER BY section_slug, order_index ASC, id ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/list-items', requireAdmin, async (req, res, next) => {
  try {
    const { section_slug, title, subtitle, description, link, date_start, date_end, order_index } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO list_items (section_slug, title, subtitle, description, link, date_start, date_end, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [section_slug, title, subtitle || '', description || '', link || '', date_start || '', date_end || '', order_index || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/list-items/:id', requireAdmin, async (req, res, next) => {
  try {
    const { section_slug, title, subtitle, description, link, date_start, date_end, order_index } = req.body;
    const { rows } = await pool.query(
      `UPDATE list_items SET section_slug=$1, title=$2, subtitle=$3, description=$4,
       link=$5, date_start=$6, date_end=$7, order_index=$8 WHERE id=$9 RETURNING *`,
      [section_slug, title, subtitle || '', description || '', link || '', date_start || '', date_end || '', order_index || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/list-items/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM list_items WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------
router.get('/timeline', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM timeline_events ORDER BY order_index ASC, id ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/timeline', requireAdmin, async (req, res, next) => {
  try {
    const { event_date, title, description, order_index } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO timeline_events (event_date, title, description, order_index)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [event_date, title, description || '', order_index || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/timeline/:id', requireAdmin, async (req, res, next) => {
  try {
    const { event_date, title, description, order_index } = req.body;
    const { rows } = await pool.query(
      `UPDATE timeline_events SET event_date=$1, title=$2, description=$3, order_index=$4
       WHERE id=$5 RETURNING *`,
      [event_date, title, description || '', order_index || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/timeline/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM timeline_events WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------
// References (footnotes — includes the resume)
// ---------------------------------------------------------------------
router.get('/references', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "references" ORDER BY order_index ASC, id ASC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/references', requireAdmin, async (req, res, next) => {
  try {
    const { label, type, url, order_index } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO "references" (label, type, url, order_index) VALUES ($1,$2,$3,$4) RETURNING *`,
      [label, type || 'link', url || '', order_index || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/references/:id', requireAdmin, async (req, res, next) => {
  try {
    const { label, type, url, order_index } = req.body;
    const { rows } = await pool.query(
      `UPDATE "references" SET label=$1, type=$2, url=$3, order_index=$4 WHERE id=$5 RETURNING *`,
      [label, type || 'link', url || '', order_index || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Reference not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/references/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM "references" WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------------------------------------------------------------------
// One combined endpoint so the homepage can load everything in one call
// ---------------------------------------------------------------------
router.get('/page-data', async (req, res, next) => {
  try {
    const [profile, sections, listItems, timeline, references] = await Promise.all([
      pool.query('SELECT * FROM profile ORDER BY id LIMIT 1'),
      pool.query('SELECT * FROM sections ORDER BY order_index ASC'),
      pool.query('SELECT * FROM list_items ORDER BY section_slug, order_index ASC, id ASC'),
      pool.query('SELECT * FROM timeline_events ORDER BY order_index ASC, id ASC'),
      pool.query('SELECT * FROM "references" ORDER BY order_index ASC, id ASC'),
    ]);
    res.json({
      profile: profile.rows[0] || null,
      sections: sections.rows,
      listItems: listItems.rows,
      timeline: timeline.rows,
      references: references.rows,
    });
  } catch (err) { next(err); }
});

module.exports = router;
