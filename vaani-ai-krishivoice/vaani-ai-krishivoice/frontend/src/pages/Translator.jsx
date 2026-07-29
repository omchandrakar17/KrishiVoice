import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeftRight, Download, Trash2, Send, AlertTriangle } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb.jsx';
import VoiceWave from '../components/VoiceWave.jsx';
import ConversationCard from '../components/ConversationCard.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import { useApp } from '../context/AppContext.jsx';
import api from '../services/api.js';

const LANGS = [
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'en', label: 'English' },
  { code: 'cg', label: 'छत्तीसगढ़ी (Chhattisgarhi)' },
];

export default function Translator() {
  const { sessionId, sourceLang, setSourceLang, targetLang, setTargetLang, swapLanguages, conversation, addTurn, clearConversation } = useApp();
  const [orbState, setOrbState] = useState('idle'); // idle | listening | thinking | speaking
  const [manualText, setManualText] = useState('');
  const scrollRef = useRef(null);

  const { isListening, transcript, interimTranscript, error: recError, isSupported: sttSupported, start, stop, reset } = useSpeechRecognition({ lang: sourceLang });
  const { speak, isSpeaking, isSupported: ttsSupported } = useSpeechSynthesis();

  useEffect(() => {
    setOrbState(isListening ? 'listening' : isSpeaking ? 'speaking' : orbState === 'thinking' ? 'thinking' : 'idle');
  }, [isListening, isSpeaking]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation]);

  // when recognition finishes and produced a final transcript, submit it
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleSubmit(transcript.trim());
      reset();
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(text) {
    if (!text.trim()) return;

    addTurn({ role: 'user', text, sourceLang, targetLang });
    setOrbState('thinking');
    setManualText('');

    try {
      const result = await api.voice({ text, sourceLang, targetLang, sessionId });
      addTurn({
        role: 'assistant',
        text: result.reply_text || result.translated_text,
        sourceLang,
        targetLang,
        functionCalled: result.function_called,
        mocked: result.mocked,
      });

      if (result.mocked) {
        toast('Running in mock mode — add GEMINI_API_KEY on the backend for live AI responses.', { icon: '⚠️' });
      }

      if (ttsSupported) {
        speak(result.reply_text || result.translated_text, targetLang);
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong talking to the backend.');
    } finally {
      setOrbState('idle');
    }
  }

  function handleOrbClick() {
    if (!sttSupported) {
      toast.error('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      stop();
    } else {
      start();
    }
  }

  function exportConversation() {
    const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaani-conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-6">
        {/* Language selector bar */}
        <div className="glass-card p-4 flex items-center gap-3 flex-wrap">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-vaani-surface border border-vaani-border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            title="Swap languages"
            className="p-2 rounded-lg border border-vaani-border hover:bg-vaani-primary/10 hover:text-vaani-primary transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-vaani-surface border border-vaani-border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Conversation feed */}
        <div ref={scrollRef} className="glass-card p-5 h-[420px] overflow-y-auto space-y-4">
          {conversation.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-vaani-muted">
              <p>No conversation yet.</p>
              <p className="text-sm">Press the mic below and start speaking, or type a message.</p>
            </div>
          ) : (
            conversation.map((turn) => (
              <ConversationCard key={turn.id} turn={turn} onSpeak={(t, l) => speak(t, l)} />
            ))
          )}
        </div>

        {/* Text input fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(manualText);
          }}
          className="glass-card p-3 flex items-center gap-2"
        >
          <input
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Or type your message here..."
            className="flex-1 bg-transparent outline-none px-2 text-vaani-text placeholder:text-vaani-muted"
          />
          <button type="submit" className="p-2 rounded-lg bg-vaani-primary/20 text-vaani-primary hover:bg-vaani-primary/30 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>

        {!sttSupported && (
          <div className="flex items-center gap-2 text-sm text-vaani-accent bg-vaani-accent/10 border border-vaani-accent/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Voice input isn't supported in this browser. Use the text box above, or switch to Chrome/Edge for full voice support.
          </div>
        )}
        {recError && (
          <div className="text-sm text-red-400">Microphone error: {recError}. Check browser permissions.</div>
        )}
      </div>

      {/* Voice orb sidebar */}
      <div className="glass-card p-6 flex flex-col items-center gap-6 h-fit lg:sticky lg:top-24">
        <VoiceOrb state={orbState} onClick={handleOrbClick} />
        <VoiceWave active={isListening || isSpeaking} />
        <p className="text-sm text-vaani-muted text-center">
          {orbState === 'listening' && 'Listening… speak now'}
          {orbState === 'thinking' && 'VAANI is thinking…'}
          {orbState === 'speaking' && 'Speaking response…'}
          {orbState === 'idle' && 'Tap the mic to speak'}
        </p>
        {interimTranscript && (
          <p className="text-xs text-vaani-accent2 italic text-center">"{interimTranscript}"</p>
        )}

        <div className="w-full border-t border-vaani-border pt-4 flex gap-2">
          <button
            onClick={exportConversation}
            disabled={conversation.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-vaani-border hover:border-vaani-primary/50 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={clearConversation}
            disabled={conversation.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-vaani-border hover:border-red-400/50 hover:text-red-400 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
