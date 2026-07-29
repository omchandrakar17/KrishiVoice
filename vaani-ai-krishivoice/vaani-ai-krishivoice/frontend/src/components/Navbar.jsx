import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, Menu, X, Accessibility } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/translator', label: 'Translator' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { accessibilityMode, setAccessibilityMode } = useApp();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-vaani-primary bg-vaani-primary/10' : 'text-vaani-muted hover:text-vaani-text'
    }`;

  return (
    <header className="sticky top-0 z-50 glass border-b border-vaani-border/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-extrabold text-lg">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-vaani-primary to-vaani-accent2 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </span>
          <span>
            VAANI <span className="text-gradient">AI</span>
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            aria-pressed={accessibilityMode}
            title="Toggle accessibility mode (larger text, high contrast)"
            className={`hidden md:flex p-2 rounded-lg border border-vaani-border ${
              accessibilityMode ? 'bg-vaani-primary/20 text-vaani-primary' : 'text-vaani-muted hover:text-vaani-text'
            }`}
          >
            <Accessibility className="w-5 h-5" />
          </button>

          <button className="md:hidden p-2 text-vaani-text" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden px-4 pb-4 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
