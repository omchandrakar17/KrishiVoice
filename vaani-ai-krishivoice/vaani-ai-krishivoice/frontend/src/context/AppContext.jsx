import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

function getOrCreateSessionId() {
  const key = 'vaani_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function AppProvider({ children }) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [sourceLang, setSourceLang] = useState('hi');
  const [targetLang, setTargetLang] = useState('en');
  const [darkMode, setDarkMode] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addTurn = useCallback((turn) => {
    setConversation((prev) => [...prev, { ...turn, id: `${Date.now()}_${Math.random()}`, timestamp: new Date().toISOString() }]);
  }, []);

  const swapLanguages = useCallback(() => {
    setSourceLang((prevSource) => {
      setTargetLang(prevSource);
      return targetLang;
    });
  }, [targetLang]);

  const clearConversation = useCallback(() => setConversation([]), []);

  const value = {
    sessionId,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    swapLanguages,
    darkMode,
    setDarkMode,
    accessibilityMode,
    setAccessibilityMode,
    conversation,
    addTurn,
    clearConversation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
