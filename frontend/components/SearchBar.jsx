'use client';

import { useEffect, useRef, useState } from 'react';
import { searchIndex } from '../lib/search';

export default function SearchBar({ index, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const results = searchIndex(index, query);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function pick(result) {
    onSelect(result);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && results.length > 0) {
      pick(results[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search my resume, GitHub, LinkedIn, anything…"
        className="w-full border border-[var(--wiki-border)] bg-[var(--wiki-bg)] text-[var(--wiki-text)] rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wiki-link)]"
      />
      {open && query && (
        <div className="absolute z-30 mt-1 w-full border border-[var(--wiki-border)] bg-[var(--wiki-panel)] shadow-lg max-h-80 overflow-y-auto text-sm">
          {results.length === 0 ? (
            <div className="px-3 py-2 text-[var(--wiki-subtle)] italic">No matches</div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onMouseDown={() => pick(r)}
                className="w-full text-left px-3 py-2 hover:bg-[var(--wiki-infobox)] flex items-center justify-between gap-3"
              >
                <span className="truncate">{r.label}</span>
                <span className="text-[var(--wiki-subtle)] text-xs shrink-0">{r.group}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
