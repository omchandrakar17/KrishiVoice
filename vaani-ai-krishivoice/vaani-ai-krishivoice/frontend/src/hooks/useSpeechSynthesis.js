import { useCallback, useEffect, useState } from 'react';

const LANG_TO_BCP47 = {
  hi: 'hi-IN',
  en: 'en-IN',
  cg: 'hi-IN', // no native Chhattisgarhi voice in browsers - falls back to Hindi voice
};

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [isSupported]);

  const speak = useCallback(
    (text, lang = 'hi') => {
      if (!isSupported || !text) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetBcp47 = LANG_TO_BCP47[lang] || 'hi-IN';
      utterance.lang = targetBcp47;

      const matchedVoice = voices.find((v) => v.lang === targetBcp47) || voices.find((v) => v.lang.startsWith(targetBcp47.split('-')[0]));
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.rate = 0.95;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voices, isSupported]
  );

  const cancel = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported, voices };
}
