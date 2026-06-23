'use client';

import { useEffect, useMemo, useState } from 'react';
import Infobox from './Infobox';
import TableOfContents from './TableOfContents';
import AppearancePanel from './AppearancePanel';
import SearchBar from './SearchBar';
import SectionsList from './Sections';
import { buildSearchIndex } from '../lib/search';

const TOC = [
  { id: 'early_life', label: 'Early life' },
  { id: 'education', label: 'Education' },
  { id: 'technical_skills', label: 'Technical skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'research_interests', label: 'Research interests' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'contact', label: 'Contact' },
  { id: 'references', label: 'References' },
];

const FONT_SIZES = { small: '14px', standard: '16px', large: '19px' };
const WIDTHS = { standard: '1180px', wide: '1500px' };

function getLastEdited(profile, sections) {
  const timestamps = [profile?.updated_at, ...sections.map((s) => s.updated_at)]
    .filter(Boolean)
    .map((t) => new Date(t).getTime())
    .filter((t) => !Number.isNaN(t));
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps));
}

export default function ArticlePage({ data }) {
  const { profile, sections, listItems, timeline, references } = data;

  const [textSize, setTextSize] = useState('standard');
  const [width, setWidth] = useState('standard');
  const [theme, setTheme] = useState('auto');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [pendingScroll, setPendingScroll] = useState(null);

  const searchData = useMemo(
    () => buildSearchIndex({ sections, listItems, timeline, references }),
    [sections, listItems, timeline, references]
  );

  // "Automatic" color theme follows the OS/browser preference live.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mq.matches);
    const listener = (e) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  // Text-size is a real root font-size change so every rem-based Tailwind
  // class scales with it. Reset on unmount so it never leaks elsewhere.
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[textSize];
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [textSize]);

  // Smooth-scrolls to a target once it's actually in the DOM — needed
  // because on mobile the target section may have just been expanded
  // by navigateTo() and isn't rendered yet on this exact tick.
  useEffect(() => {
    if (!pendingScroll) return undefined;
    const tryScroll = () => {
      const el = document.getElementById(pendingScroll);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('search-highlight');
      setTimeout(() => el.classList.remove('search-highlight'), 1600);
      return true;
    };
    if (tryScroll()) {
      setPendingScroll(null);
      return undefined;
    }
    const t = setTimeout(() => {
      tryScroll();
      setPendingScroll(null);
    }, 60);
    return () => clearTimeout(t);
  }, [pendingScroll, openSections]);

  const isDark = theme === 'dark' || (theme === 'auto' && systemPrefersDark);

  function handleAppearanceChange(patch) {
    if (patch.textSize) setTextSize(patch.textSize);
    if (patch.width) setWidth(patch.width);
    if (patch.theme) setTheme(patch.theme);
  }

  function navigateTo(targetId, sectionSlug) {
    if (sectionSlug) {
      setOpenSections((prev) => ({ ...prev, [sectionSlug]: true }));
    }
    setPendingScroll(targetId);
  }

  function toggleSection(slug) {
    setOpenSections((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  const lastEdited = getLastEdited(profile, sections);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-[var(--wiki-bg)] text-[var(--wiki-text)]">
        <header className="border-b border-[var(--wiki-border)]">
          <div
            className="mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ maxWidth: WIDTHS[width] }}
          >
            <span className="text-xl sm:text-2xl font-serifHead font-semibold tracking-wide [font-variant:small-caps]">
              My Wikipedia
            </span>
            <SearchBar index={searchData} onSelect={(r) => navigateTo(r.id, r.sectionSlug)} />
          </div>
        </header>

        <main className="mx-auto px-4 py-6" style={{ maxWidth: WIDTHS[width] }}>
          <h1 className="font-serifHead text-3xl border-b border-[var(--wiki-border)] pb-2 mb-1">
            {profile.name}
          </h1>
          <p className="text-xs text-[var(--wiki-subtle)] mb-4">From My Wikipedia</p>

          {/* Mobile-only: Contents + Appearance as closed-by-default accordions */}
          <div className="lg:hidden space-y-3 mb-6">
            <TableOfContents items={TOC} defaultOpen={false} onNavigate={navigateTo} />
            <AppearancePanel
              textSize={textSize}
              width={width}
              theme={theme}
              onChange={handleAppearanceChange}
              defaultOpen={false}
            />
          </div>

          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Left: Contents — sticky on desktop, hidden here on mobile (rendered above instead) */}
            <div className="hidden lg:block lg:w-[220px] lg:shrink-0 lg:sticky lg:top-4">
              <TableOfContents items={TOC} defaultOpen onNavigate={navigateTo} />
            </div>

            {/* Middle: infobox floats within the lead, text wraps around it,
                sections scroll normally with the page — no sticky here. */}
            <div className="flex-1 min-w-0">
              <div className="lg:float-right lg:w-[280px] lg:ml-6 lg:mb-4 mb-6">
                <Infobox profile={profile} />
              </div>

              <div className="wiki-body">
                {(profile.intro || '').split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="clear-both" />

              <div className="space-y-2">
                <SectionsList
                  sections={sections}
                  listItems={listItems}
                  timeline={timeline}
                  references={references}
                  openSections={openSections}
                  onToggle={toggleSection}
                />
              </div>
            </div>

            {/* Right: Appearance — sticky on desktop, hidden here on mobile (rendered above instead) */}
            <div className="hidden lg:block lg:w-[260px] lg:shrink-0 lg:sticky lg:top-4">
              <AppearancePanel
                textSize={textSize}
                width={width}
                theme={theme}
                onChange={handleAppearanceChange}
                defaultOpen
              />
            </div>
          </div>

          <footer className="mt-10 pt-4 border-t border-[var(--wiki-border)] text-xs text-[var(--wiki-subtle)]">
            {lastEdited ? (
              <>
                This page was last edited on{' '}
                {lastEdited.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} at{' '}
                {lastEdited.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.
              </>
            ) : (
              'This page has not been edited yet.'
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
