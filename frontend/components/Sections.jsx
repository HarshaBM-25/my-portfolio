'use client';

// One shared section renderer used by both desktop and mobile. Each
// section's content is hidden on mobile unless toggled open (an
// accordion, like Wikipedia's mobile skin), and is always visible at
// the lg breakpoint regardless of the toggle state — see the
// `open ? 'block' : 'hidden lg:block'` pattern below.

function SectionShell({ id, title, open, onToggle, children }) {
  return (
    <section>
      <h2
        id={id}
        onClick={onToggle}
        className="wiki-h2 scroll-mt-24 flex items-center justify-between cursor-pointer select-none lg:cursor-default"
      >
        <span>{title}</span>
        <span
          className={`lg:hidden inline-block text-lg leading-none transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          ›
        </span>
      </h2>
      <div className={open ? 'block' : 'hidden lg:block'}>{children}</div>
    </section>
  );
}

function TextBody({ content }) {
  return (
    <div className="wiki-body">
      {(content || '').split('\n').filter(Boolean).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      {!content && (
        <p className="italic text-[var(--wiki-subtle)]">Nothing added yet — edit this from /admin.</p>
      )}
    </div>
  );
}

function ListBody({ items, variant }) {
  if (items.length === 0) {
    return <p className="italic text-[var(--wiki-subtle)]">Nothing added yet — edit this from /admin.</p>;
  }
  return (
    <ul className="list-disc pl-6 space-y-3">
      {items.map((item) => (
        <li key={item.id} id={`item-${item.id}`} className="scroll-mt-24">
          <span className="font-semibold">{item.title}</span>
          {item.subtitle && <span className="text-[var(--wiki-subtle)]"> — {item.subtitle}</span>}
          {(item.date_start || item.date_end) && (
            <span className="text-[var(--wiki-subtle)] text-sm">
              {' '}({[item.date_start, item.date_end].filter(Boolean).join(' – ')})
            </span>
          )}
          {item.description && variant !== 'compact' && (
            <p className="text-sm mt-0.5">{item.description}</p>
          )}
          {item.link && (
            <>
              {' '}
              <a href={item.link} target="_blank" rel="noreferrer" className="wiki-link text-sm">
                [link]
              </a>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function TimelineBody({ events }) {
  if (events.length === 0) {
    return <p className="italic text-[var(--wiki-subtle)]">Nothing added yet — edit this from /admin.</p>;
  }
  return (
    <ol className="border-l-2 border-[var(--wiki-border)] pl-5 space-y-4">
      {events.map((ev) => (
        <li key={ev.id} id={`timeline-${ev.id}`} className="relative scroll-mt-24">
          <span className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--wiki-link)]" />
          <div className="font-semibold">{ev.event_date} — {ev.title}</div>
          {ev.description && <div className="text-sm text-[var(--wiki-subtle)]">{ev.description}</div>}
        </li>
      ))}
    </ol>
  );
}

function ReferencesBody({ references }) {
  if (references.length === 0) {
    return <p className="italic text-[var(--wiki-subtle)]">Nothing added yet — edit this from /admin.</p>;
  }
  return (
    <ol className="list-decimal pl-6 space-y-1 text-sm">
      {references.map((ref) => (
        <li key={ref.id} id={`cite_${ref.id}`} className="scroll-mt-24">
          {ref.url ? (
            <a href={ref.url} target="_blank" rel="noreferrer" className="wiki-link">
              {ref.label}
            </a>
          ) : (
            ref.label
          )}
          {ref.type === 'resume' && <span className="text-[var(--wiki-subtle)]"> (PDF)</span>}
        </li>
      ))}
    </ol>
  );
}

function sectionContent(sections, slug) {
  return sections.find((s) => s.slug === slug)?.content || '';
}
function sectionTitle(sections, slug, fallback) {
  return sections.find((s) => s.slug === slug)?.title || fallback;
}
function itemsFor(listItems, slug) {
  return listItems.filter((i) => i.section_slug === slug);
}

export default function SectionsList({ sections, listItems, timeline, references, openSections, onToggle }) {
  const shell = (slug, title, children) => (
    <SectionShell id={slug} title={title} open={!!openSections[slug]} onToggle={() => onToggle(slug)}>
      {children}
    </SectionShell>
  );

  return (
    <>
      {shell('early_life', sectionTitle(sections, 'early_life', 'Early life'),
        <TextBody content={sectionContent(sections, 'early_life')} />)}

      {shell('education', 'Education',
        <ListBody items={itemsFor(listItems, 'education')} />)}

      {shell('technical_skills', 'Technical skills',
        <ListBody items={itemsFor(listItems, 'technical_skills')} />)}

      {shell('experience', 'Experience',
        <ListBody items={itemsFor(listItems, 'experience')} />)}

      {shell('projects', 'Projects',
        <ListBody items={itemsFor(listItems, 'projects')} />)}

      {shell('achievements', 'Achievements',
        <ListBody items={itemsFor(listItems, 'achievements')} variant="compact" />)}

      {shell('research_interests', sectionTitle(sections, 'research_interests', 'Research interests'),
        <TextBody content={sectionContent(sections, 'research_interests')} />)}

      {shell('certifications', 'Certifications',
        <ListBody items={itemsFor(listItems, 'certifications')} variant="compact" />)}

      {shell('timeline', 'Timeline',
        <TimelineBody events={timeline} />)}

      {shell('contact', sectionTitle(sections, 'contact', 'Contact'),
        <TextBody content={sectionContent(sections, 'contact')} />)}

      {shell('references', 'References',
        <ReferencesBody references={references} />)}
    </>
  );
}
