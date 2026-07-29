import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2, Volume2 } from 'lucide-react';

/**
 * A CSS/Framer-Motion powered "AI orb" — animated concentric glowing rings that
 * pulse based on state. Gives the visual effect the brief wanted from a Three.js
 * orb without the extra runtime dependency or WebGL context.
 */
export default function VoiceOrb({ state = 'idle', onClick }) {
  // state: 'idle' | 'listening' | 'thinking' | 'speaking'

  const ringColor = {
    idle: 'from-vaani-primary/40 to-vaani-accent2/30',
    listening: 'from-vaani-primary to-vaani-accent2',
    thinking: 'from-vaani-accent to-vaani-primary',
    speaking: 'from-vaani-accent2 to-vaani-primary',
  }[state];

  return (
    <button
      onClick={onClick}
      aria-label={state === 'listening' ? 'Stop listening' : 'Start voice input'}
      className="relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-vaani-primary/50 group"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${ringColor} opacity-20`}
          animate={
            state === 'idle'
              ? { scale: [1, 1.05, 1] }
              : { scale: [1, 1.35 + i * 0.15, 1], opacity: [0.25, 0, 0.25] }
          }
          transition={{
            duration: state === 'idle' ? 4 : 1.6,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div
        className={`relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-gradient-to-br ${ringColor} shadow-[0_0_60px_rgba(34,197,94,0.35)] group-hover:scale-105 transition-transform`}
      >
        {state === 'thinking' ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : state === 'speaking' ? (
          <Volume2 className="w-10 h-10 text-white" />
        ) : (
          <Mic className={`w-10 h-10 text-white ${state === 'listening' ? 'animate-pulse' : ''}`} />
        )}
      </div>
    </button>
  );
}
