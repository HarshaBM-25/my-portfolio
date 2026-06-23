'use client';

import { useState } from 'react';

const TEXT_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
];
const WIDTH_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'wide', label: 'Wide' },
];
const COLOR_OPTIONS = [
  { value: 'auto', label: 'Automatic' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function AppearancePanel({ textSize, width, theme, onChange, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--wiki-border)] bg-[var(--wiki-panel)] text-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--wiki-border)]">
        <span className="font-bold">Appearance</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-[var(--wiki-link)] hover:underline"
        >
          {open ? 'hide' : 'show'}
        </button>
      </div>

      {open && (
        <div className="p-3 space-y-4">
          <RadioGroup
            legend="Text"
            name="text-size"
            options={TEXT_OPTIONS}
            value={textSize}
            onChange={(v) => onChange({ textSize: v })}
          />
          <RadioGroup
            legend="Width"
            name="page-width"
            options={WIDTH_OPTIONS}
            value={width}
            onChange={(v) => onChange({ width: v })}
          />
          <RadioGroup
            legend="Color"
            name="color-theme"
            options={COLOR_OPTIONS}
            value={theme}
            onChange={(v) => onChange({ theme: v })}
          />
        </div>
      )}
    </div>
  );
}

function RadioGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-[var(--wiki-subtle)] mb-1.5">{legend}</legend>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[var(--wiki-link)]"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
