import { useCallback, useEffect, useRef, useState } from 'react';

// Web Speech API only ships with BCP-47 locale codes. Chhattisgarhi (cg) has no
// native browser locale, so recognition falls back to Hindi (hi-IN) - the model
// on the backend is what actually understands Chhattisgarhi phrasing.
const LANG_TO_BCP47 = {
  hi: 'hi-IN',
  en: 'en-IN',
  cg: 'hi-IN',
};

export function useSpeechRecognition({ lang = 'hi' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = LANG_TO_BCP47[lang] || 'hi-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) setTranscript((prev) => (prev + ' ' + finalText).trim());
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [lang]);

  const start = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    try {
      recognitionRef.current?.start();
    } catch {
      // already started - ignore
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { isListening, transcript, interimTranscript, error, isSupported, start, stop, reset };
}
