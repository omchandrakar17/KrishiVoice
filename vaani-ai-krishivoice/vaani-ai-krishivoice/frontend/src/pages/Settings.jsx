import React from 'react';
import { Moon, Sun, Accessibility, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? 'bg-vaani-primary' : 'bg-vaani-border'}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function Settings() {
  const { darkMode, setDarkMode, accessibilityMode, setAccessibilityMode, sessionId } = useApp();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="glass-card divide-y divide-vaani-border">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-vaani-primary" /> : <Sun className="w-5 h-5 text-vaani-accent" />}
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-xs text-vaani-muted">VAANI is designed dark-first for outdoor screen readability</p>
            </div>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} />
        </div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility className="w-5 h-5 text-vaani-accent2" />
            <div>
              <p className="font-medium">Accessibility Mode</p>
              <p className="text-xs text-vaani-muted">Larger text throughout the app</p>
            </div>
          </div>
          <Toggle checked={accessibilityMode} onChange={setAccessibilityMode} />
        </div>
      </div>

      <div className="glass-card p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-vaani-muted shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">Your session ID</p>
          <p className="text-xs text-vaani-muted font-mono break-all">{sessionId}</p>
          <p className="text-xs text-vaani-muted mt-2">
            Used to group your conversation history. Stored only in this browser's local storage.
          </p>
        </div>
      </div>
    </div>
  );
}
