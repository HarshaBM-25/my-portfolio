'use client';

import { useState } from 'react';

export default function TableOfContents({ items, onNavigate, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <nav
      aria-label="Table of Contents"
      className="border border-[var(--wiki-border)] bg-[var(--wiki-panel)] text-sm"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--wiki-border)]">
        <span className="font-bold">Contents</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-[var(--wiki-link)] hover:underline"
        >
          {open ? 'hide' : 'show'}
        </button>
      </div>
      {open && (
        <ol className="list-none p-3 space-y-1">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="wiki-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(item.id, item.id);
                }}
              >
                <span className="text-[var(--wiki-subtle)] mr-1">{i + 1}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
