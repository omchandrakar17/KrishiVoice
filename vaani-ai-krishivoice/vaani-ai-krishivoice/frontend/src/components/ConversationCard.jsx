import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Volume2, Wrench } from 'lucide-react';

const LANG_LABEL = { hi: 'हिंदी', en: 'English', cg: 'छत्तीसगढ़ी' };

export default function ConversationCard({ turn, onSpeak }) {
  const isUser = turn.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-vaani-accent2/20 text-vaani-accent2' : 'bg-vaani-primary/20 text-vaani-primary'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      <div className={`glass-card p-4 max-w-xl ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
        <div className="flex items-center gap-2 text-xs text-vaani-muted mb-1">
          <span>{isUser ? LANG_LABEL[turn.sourceLang] : LANG_LABEL[turn.targetLang]}</span>
          {turn.functionCalled && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-vaani-accent/10 text-vaani-accent">
              <Wrench className="w-3 h-3" /> {turn.functionCalled}
            </span>
          )}
          {turn.mocked && (
            <span className="px-2 py-0.5 rounded-full bg-vaani-border text-vaani-muted">mock</span>
          )}
        </div>

        <p className="text-vaani-text leading-relaxed whitespace-pre-wrap">{turn.text}</p>

        {!isUser && (
          <button
            onClick={() => onSpeak?.(turn.text, turn.targetLang)}
            className="mt-2 flex items-center gap-1 text-xs text-vaani-accent2 hover:text-vaani-primary transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" /> Play
          </button>
        )}
      </div>
    </motion.div>
  );
}
