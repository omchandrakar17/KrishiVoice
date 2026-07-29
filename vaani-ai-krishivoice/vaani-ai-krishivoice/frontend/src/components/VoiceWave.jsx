import React from 'react';

export default function VoiceWave({ active = false, bars = 5, className = '' }) {
  return (
    <div className={`flex items-end gap-1 h-8 ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full bg-gradient-to-t from-vaani-primary to-vaani-accent2 ${
            active ? 'animate-wave-bar' : ''
          }`}
          style={{
            height: active ? '100%' : '30%',
            animationDelay: `${i * 0.12}s`,
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
