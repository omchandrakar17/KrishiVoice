import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Translator from './pages/Translator.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';
import { useApp } from './context/AppContext.jsx';

export default function App() {
  const { accessibilityMode } = useApp();

  return (
    <div className={accessibilityMode ? 'text-lg' : ''}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#151d2b', color: '#e6edf3', border: '1px solid #232f42' } }} />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/translator" element={<Translator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
