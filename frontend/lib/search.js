const TEXT_SECTIONS = [
  { slug: 'early_life', label: 'Early life' },
  { slug: 'research_interests', label: 'Research interests' },
  { slug: 'contact', label: 'Contact' },
];

const LIST_SECTIONS = [
  { slug: 'education', label: 'Education' },
  { slug: 'technical_skills', label: 'Technical skills' },
  { slug: 'experience', label: 'Experience' },
  { slug: 'projects', label: 'Projects' },
  { slug: 'achievements', label: 'Achievements' },
  { slug: 'certifications', label: 'Certifications' },
];

// Builds a flat list of { id, label, group, sectionSlug, matchText } entries
// from everything on the page, so the search bar can jump straight to the
// exact item (a project, a skill row, a reference) rather than just the
// section it lives in.
export function buildSearchIndex({ sections, listItems, timeline, references }) {
  const index = [];

  TEXT_SECTIONS.forEach(({ slug, label }) => {
    const content = sections.find((s) => s.slug === slug)?.content || '';
    index.push({
      id: slug,
      label,
      group: label,
      sectionSlug: slug,
      matchText: `${label} ${content}`.toLowerCase(),
    });
  });

  LIST_SECTIONS.forEach(({ slug, label }) => {
    listItems
      .filter((item) => item.section_slug === slug)
      .forEach((item) => {
        index.push({
          id: `item-${item.id}`,
          label: item.subtitle ? `${item.title} — ${item.subtitle}` : item.title,
          group: label,
          sectionSlug: slug,
          matchText: `${item.title} ${item.subtitle} ${item.description}`.toLowerCase(),
        });
      });
  });

  (timeline || []).forEach((ev) => {
    index.push({
      id: `timeline-${ev.id}`,
      label: `${ev.event_date} — ${ev.title}`,
      group: 'Timeline',
      sectionSlug: 'timeline',
      matchText: `${ev.event_date} ${ev.title} ${ev.description}`.toLowerCase(),
    });
  });

  (references || []).forEach((ref) => {
    index.push({
      id: `cite_${ref.id}`,
      label: ref.label,
      group: 'References',
      sectionSlug: 'references',
      matchText: `${ref.label} ${ref.type} ${ref.url}`.toLowerCase(),
    });
  });

  return index;
}

export function searchIndex(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index.filter((entry) => entry.matchText.includes(q)).slice(0, 8);
}
