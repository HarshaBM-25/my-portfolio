'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const TABS = [
  { key: 'profile', label: 'Profile & Infobox' },
  { key: 'text', label: 'Early Life / Research / Contact' },
  { key: 'education', label: 'Education' },
  { key: 'technical_skills', label: 'Technical Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'references', label: 'References' },
];

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    setLoggedIn(api.isLoggedIn());
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!loggedIn) {
    return <LoginScreen onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-wiki-panel">
      <header className="bg-white border-b border-wiki-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-serifHead text-xl">Admin panel</h1>
          <div className="flex gap-4 items-center text-sm">
            <a href="/" className="wiki-link">View page</a>
            <button
              onClick={() => { api.setToken(null); setLoggedIn(false); }}
              className="text-red-700 hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:flex gap-6">
        <nav className="sm:w-56 shrink-0 mb-6 sm:mb-0">
          <ul className="space-y-1">
            {TABS.map((t) => (
              <li key={t.key}>
                <button
                  onClick={() => setTab(t.key)}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    tab === t.key ? 'bg-wiki-link text-white' : 'bg-white border border-wiki-border hover:bg-wiki-infobox'
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 bg-white border border-wiki-border p-5">
          {tab === 'profile' && <ProfileEditor />}
          {tab === 'text' && <TextSectionsEditor />}
          {['education', 'technical_skills', 'experience', 'projects', 'achievements', 'certifications'].includes(tab) && (
            <ListItemsEditor sectionSlug={tab} label={TABS.find((t) => t.key === tab).label} />
          )}
          {tab === 'timeline' && <TimelineEditor />}
          {tab === 'references' && <ReferencesEditor />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function LoginScreen({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(password);
      api.setToken(token);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-wiki-panel px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-wiki-border p-6 w-full max-w-sm">
        <h1 className="font-serifHead text-xl mb-1">Admin login</h1>
        <p className="text-sm text-wiki-subtle mb-4">Enter the admin password to edit the page.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-wiki-border px-3 py-2 mb-3 text-sm"
        />
        {error && <p className="text-red-700 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-wiki-link text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Log in'}
        </button>
        <a href="/" className="block text-center text-sm wiki-link mt-3">Back to page</a>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-semibold text-wiki-subtle mb-1">{label}</span>
      {children}
    </label>
  );
}
const inputCls = 'w-full border border-wiki-border px-3 py-1.5 text-sm';

function SaveBar({ status, onSave }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <button onClick={onSave} className="bg-wiki-link text-white px-4 py-1.5 text-sm font-medium">
        Save changes
      </button>
      {status && <span className="text-sm text-wiki-subtle">{status}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------
function ProfileEditor() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('Loading…');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.getPageData().then((d) => {
      const p = d.profile || {};
      setForm({ ...p, interests: (p.interests || []).join(', ') });
      setStatus('');
    });
  }, []);

  if (!form) return <p className="text-sm text-wiki-subtle">{status}</p>;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload(file);
      update('photo_url', url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${url}`);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setStatus('Saving…');
    try {
      await api.updateProfile({
        ...form,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setStatus('Saved ✓');
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div>
      <h2 className="wiki-h2 !mt-0">Profile & infobox</h2>
      <Field label="Name">
        <input className={inputCls} value={form.name || ''} onChange={(e) => update('name', e.target.value)} />
      </Field>
      <Field label="Photo">
        <div className="flex items-center gap-3">
          {form.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photo_url} alt="" className="w-16 h-16 object-cover border border-wiki-border" />
          )}
          <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
          {uploading && <span className="text-xs text-wiki-subtle">Uploading…</span>}
        </div>
      </Field>
      <Field label="Date of birth">
        <input className={inputCls} value={form.dob || ''} onChange={(e) => update('dob', e.target.value)} />
      </Field>
      <Field label="Education (short line for the infobox)">
        <input className={inputCls} value={form.education || ''} onChange={(e) => update('education', e.target.value)} />
      </Field>
      <Field label="Location">
        <input className={inputCls} value={form.location || ''} onChange={(e) => update('location', e.target.value)} />
      </Field>
      <Field label="Occupation">
        <input className={inputCls} value={form.occupation || ''} onChange={(e) => update('occupation', e.target.value)} />
      </Field>
      <Field label="Interests (comma-separated)">
        <input className={inputCls} value={form.interests || ''} onChange={(e) => update('interests', e.target.value)} />
      </Field>
      <Field label="Intro paragraph(s) — one paragraph per line">
        <textarea rows={6} className={inputCls} value={form.intro || ''} onChange={(e) => update('intro', e.target.value)} />
      </Field>
      <SaveBar status={status} onSave={save} />
    </div>
  );
}

// ---------------------------------------------------------------------
const TEXT_SLUGS = [
  { slug: 'early_life', defaultTitle: 'Early life' },
  { slug: 'research_interests', defaultTitle: 'Research interests' },
  { slug: 'contact', defaultTitle: 'Contact' },
];

function TextSectionsEditor() {
  const [sections, setSections] = useState(null);
  const [status, setStatus] = useState({});

  function reload() {
    api.getPageData().then((d) => setSections(d.sections));
  }
  useEffect(reload, []);

  if (!sections) return <p className="text-sm text-wiki-subtle">Loading…</p>;

  async function saveOne(section, content, title) {
    setStatus((s) => ({ ...s, [section.slug]: 'Saving…' }));
    try {
      if (section.id) {
        await api.updateSection(section.id, { ...section, title, content });
      } else {
        await api.createSection({ slug: section.slug, title, content, order_index: 0 });
      }
      setStatus((s) => ({ ...s, [section.slug]: 'Saved ✓' }));
      reload();
    } catch (err) {
      setStatus((s) => ({ ...s, [section.slug]: err.message }));
    }
  }

  return (
    <div>
      <h2 className="wiki-h2 !mt-0">Early life, research interests & contact</h2>
      {TEXT_SLUGS.map(({ slug, defaultTitle }) => {
        const existing = sections.find((s) => s.slug === slug) || { slug, title: defaultTitle, content: '' };
        return (
          <TextSectionBlock
            key={slug}
            section={existing}
            status={status[slug]}
            onSave={(content, title) => saveOne(existing, content, title)}
          />
        );
      })}
    </div>
  );
}

function TextSectionBlock({ section, status, onSave }) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  return (
    <div className="border border-wiki-border p-4 mb-4">
      <Field label="Section title">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Content (one paragraph per line)">
        <textarea rows={5} className={inputCls} value={content} onChange={(e) => setContent(e.target.value)} />
      </Field>
      <SaveBar status={status} onSave={() => onSave(content, title)} />
    </div>
  );
}

// ---------------------------------------------------------------------
const EMPTY_ITEM = { title: '', subtitle: '', description: '', link: '', date_start: '', date_end: '', order_index: 0 };

function ListItemsEditor({ sectionSlug, label }) {
  const [items, setItems] = useState(null);
  const [draft, setDraft] = useState(EMPTY_ITEM);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');

  function reload() {
    api.getPageData().then((d) => setItems(d.listItems.filter((i) => i.section_slug === sectionSlug)));
  }
  useEffect(reload, [sectionSlug]);

  if (!items) return <p className="text-sm text-wiki-subtle">Loading…</p>;

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({ ...item });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_ITEM);
  }

  async function save() {
    setStatus('Saving…');
    try {
      if (editingId) {
        await api.updateListItem(editingId, { ...draft, section_slug: sectionSlug });
      } else {
        await api.createListItem({ ...draft, section_slug: sectionSlug });
      }
      cancelEdit();
      setStatus('Saved ✓');
      reload();
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this entry?')) return;
    await api.deleteListItem(id);
    reload();
  }

  return (
    <div>
      <h2 className="wiki-h2 !mt-0">{label}</h2>

      <ul className="space-y-2 mb-5">
        {items.map((item) => (
          <li key={item.id} className="border border-wiki-border p-3 flex justify-between items-start text-sm">
            <div>
              <div className="font-semibold">{item.title} {item.subtitle && <span className="text-wiki-subtle font-normal">— {item.subtitle}</span>}</div>
              {item.description && <div className="text-wiki-subtle">{item.description}</div>}
              {(item.date_start || item.date_end) && (
                <div className="text-xs text-wiki-subtle">{[item.date_start, item.date_end].filter(Boolean).join(' – ')}</div>
              )}
            </div>
            <div className="flex gap-3 shrink-0 ml-3">
              <button onClick={() => startEdit(item)} className="wiki-link">Edit</button>
              <button onClick={() => remove(item.id)} className="text-red-700 hover:underline">Delete</button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-wiki-subtle italic">No entries yet — add one below.</p>}
      </ul>

      <div className="border border-wiki-border p-4 bg-wiki-panel">
        <h3 className="wiki-h3 !mt-0">{editingId ? 'Edit entry' : 'Add new entry'}</h3>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Title">
            <input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <input className={inputCls} value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <textarea rows={2} className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-x-4">
          <Field label="Link (optional)">
            <input className={inputCls} value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} />
          </Field>
          <Field label="Start date">
            <input className={inputCls} value={draft.date_start} onChange={(e) => setDraft({ ...draft, date_start: e.target.value })} />
          </Field>
          <Field label="End date">
            <input className={inputCls} value={draft.date_end} onChange={(e) => setDraft({ ...draft, date_end: e.target.value })} />
          </Field>
        </div>
        <Field label="Order (lower shows first)">
          <input type="number" className={inputCls} value={draft.order_index} onChange={(e) => setDraft({ ...draft, order_index: Number(e.target.value) })} />
        </Field>
        <div className="flex items-center gap-3">
          <button onClick={save} className="bg-wiki-link text-white px-4 py-1.5 text-sm font-medium">
            {editingId ? 'Update entry' : 'Add entry'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="text-sm text-wiki-subtle">Cancel</button>
          )}
          {status && <span className="text-sm text-wiki-subtle">{status}</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
const EMPTY_EVENT = { event_date: '', title: '', description: '', order_index: 0 };

function TimelineEditor() {
  const [events, setEvents] = useState(null);
  const [draft, setDraft] = useState(EMPTY_EVENT);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');

  function reload() {
    api.getPageData().then((d) => setEvents(d.timeline));
  }
  useEffect(reload, []);

  if (!events) return <p className="text-sm text-wiki-subtle">Loading…</p>;

  function startEdit(ev) { setEditingId(ev.id); setDraft({ ...ev }); }
  function cancelEdit() { setEditingId(null); setDraft(EMPTY_EVENT); }

  async function save() {
    setStatus('Saving…');
    try {
      if (editingId) await api.updateTimeline(editingId, draft);
      else await api.createTimeline(draft);
      cancelEdit();
      setStatus('Saved ✓');
      reload();
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this event?')) return;
    await api.deleteTimeline(id);
    reload();
  }

  return (
    <div>
      <h2 className="wiki-h2 !mt-0">Timeline</h2>
      <ul className="space-y-2 mb-5">
        {events.map((ev) => (
          <li key={ev.id} className="border border-wiki-border p-3 flex justify-between items-start text-sm">
            <div>
              <div className="font-semibold">{ev.event_date} — {ev.title}</div>
              {ev.description && <div className="text-wiki-subtle">{ev.description}</div>}
            </div>
            <div className="flex gap-3 shrink-0 ml-3">
              <button onClick={() => startEdit(ev)} className="wiki-link">Edit</button>
              <button onClick={() => remove(ev.id)} className="text-red-700 hover:underline">Delete</button>
            </div>
          </li>
        ))}
        {events.length === 0 && <p className="text-sm text-wiki-subtle italic">No events yet — add one below.</p>}
      </ul>

      <div className="border border-wiki-border p-4 bg-wiki-panel">
        <h3 className="wiki-h3 !mt-0">{editingId ? 'Edit event' : 'Add new event'}</h3>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Date (e.g. 2026 or March 2026)">
            <input className={inputCls} value={draft.event_date} onChange={(e) => setDraft({ ...draft, event_date: e.target.value })} />
          </Field>
          <Field label="Title">
            <input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <textarea rows={2} className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
        <Field label="Order (lower shows first)">
          <input type="number" className={inputCls} value={draft.order_index} onChange={(e) => setDraft({ ...draft, order_index: Number(e.target.value) })} />
        </Field>
        <div className="flex items-center gap-3">
          <button onClick={save} className="bg-wiki-link text-white px-4 py-1.5 text-sm font-medium">
            {editingId ? 'Update event' : 'Add event'}
          </button>
          {editingId && <button onClick={cancelEdit} className="text-sm text-wiki-subtle">Cancel</button>}
          {status && <span className="text-sm text-wiki-subtle">{status}</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
const EMPTY_REF = { label: '', type: 'link', url: '', order_index: 0 };

function ReferencesEditor() {
  const [refs, setRefs] = useState(null);
  const [draft, setDraft] = useState(EMPTY_REF);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  function reload() {
    api.getPageData().then((d) => setRefs(d.references));
  }
  useEffect(reload, []);

  if (!refs) return <p className="text-sm text-wiki-subtle">Loading…</p>;

  function startEdit(ref) { setEditingId(ref.id); setDraft({ ...ref }); }
  function cancelEdit() { setEditingId(null); setDraft(EMPTY_REF); }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload(file);
      setDraft((d) => ({ ...d, url }));
    } catch (err) {
      setStatus(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setStatus('Saving…');
    try {
      if (editingId) await api.updateReference(editingId, draft);
      else await api.createReference(draft);
      cancelEdit();
      setStatus('Saved ✓');
      reload();
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this reference?')) return;
    await api.deleteReference(id);
    reload();
  }

  return (
    <div>
      <h2 className="wiki-h2 !mt-0">References</h2>
      <ul className="space-y-2 mb-5">
        {refs.map((ref) => (
          <li key={ref.id} className="border border-wiki-border p-3 flex justify-between items-start text-sm">
            <div>
              <div className="font-semibold">{ref.label} <span className="text-wiki-subtle font-normal">({ref.type})</span></div>
              {ref.url && <div className="text-wiki-subtle break-all">{ref.url}</div>}
            </div>
            <div className="flex gap-3 shrink-0 ml-3">
              <button onClick={() => startEdit(ref)} className="wiki-link">Edit</button>
              <button onClick={() => remove(ref.id)} className="text-red-700 hover:underline">Delete</button>
            </div>
          </li>
        ))}
        {refs.length === 0 && <p className="text-sm text-wiki-subtle italic">No references yet — add one below.</p>}
      </ul>

      <div className="border border-wiki-border p-4 bg-wiki-panel">
        <h3 className="wiki-h3 !mt-0">{editingId ? 'Edit reference' : 'Add new reference'}</h3>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Label">
            <input className={inputCls} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </Field>
          <Field label="Type">
            <select className={inputCls} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
              <option value="resume">Resume</option>
              <option value="link">Link</option>
              <option value="article">Article</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
        <Field label="URL">
          <input className={inputCls} value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
        </Field>
        <Field label="Or upload a file (e.g. resume PDF) to fill the URL above">
          <input type="file" onChange={handleFile} className="text-sm" />
          {uploading && <span className="text-xs text-wiki-subtle ml-2">Uploading…</span>}
        </Field>
        <div className="flex items-center gap-3">
          <button onClick={save} className="bg-wiki-link text-white px-4 py-1.5 text-sm font-medium">
            {editingId ? 'Update reference' : 'Add reference'}
          </button>
          {editingId && <button onClick={cancelEdit} className="text-sm text-wiki-subtle">Cancel</button>}
          {status && <span className="text-sm text-wiki-subtle">{status}</span>}
        </div>
      </div>
    </div>
  );
}
