import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sparkles } from 'lucide-react';

// Layout Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import TutorialOverlay from './components/TutorialOverlay';
import LiveAssistant from './components/LiveAssistant';

// Pages
import Dashboard from './pages/Dashboard';
import Translator from './pages/Translator';
import HealthTracker from './pages/HealthTracker';
import MapView from './pages/MapView';
import RitualGuide from './pages/RitualGuide';
import EmergencySOS from './pages/EmergencySOS';
import ExpenseTracker from './pages/ExpenseTracker';
import Checklist from './pages/Checklist';
import Profile from './pages/Profile';

// Animation wrapper for routes
const PageTransition = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in w-full pb-24 pt-16">
      {children}
    </div>
  );
};

// Main Layout Wrapper
const AppLayout = () => {
  const [showLive, setShowLive] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-900 font-bengali overflow-hidden relative transition-colors duration-300">
      <Header />
      
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden native-scroll relative">
        <Routes>
          <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/translate" element={<PageTransition><Translator /></PageTransition>} />
          <Route path="/health" element={<PageTransition><HealthTracker /></PageTransition>} />
          <Route path="/map" element={<PageTransition><MapView /></PageTransition>} />
          <Route path="/guide" element={<PageTransition><RitualGuide /></PageTransition>} />
          <Route path="/expenses" element={<PageTransition><ExpenseTracker /></PageTransition>} />
          <Route path="/checklist" element={<PageTransition><Checklist /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/sos" element={<div className="h-full w-full fixed inset-0 z-[60]"><EmergencySOS /></div>} />
        </Routes>
      </main>
      
      {/* Floating Action Button for Live Assistant - The Jewel */}
      {!showLive && location.pathname !== '/sos' && (
        <button 
          onClick={() => setShowLive(true)}
          className="fixed bottom-24 left-4 p-0 rounded-full z-50 active:scale-90 hover:scale-105 transition-transform group"
          aria-label="Talk to HajjCare Assistant"
        >
           <div className="relative flex items-center justify-center w-16 h-16">
              {/* Glow effects */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 rounded-full blur-md opacity-70 animate-pulse-slow group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-1 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm"></div>
              
              {/* The Jewel Body */}
              <div className="relative w-14 h-14 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 rounded-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.5),0_4px_15px_rgba(0,0,0,0.3)] border-2 border-white/30 flex items-center justify-center overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-1 right-2 w-6 h-3 bg-white/40 rounded-full blur-[2px] transform -rotate-12"></div>
                  <Sparkles size={28} className="text-white drop-shadow-md animate-pulse" />
              </div>
           </div>
        </button>
      )}

      <Navigation />
      
      <TutorialOverlay />
      {showLive && <LiveAssistant onClose={() => setShowLive(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppLayout />
      </HashRouter>
    </AppProvider>
  );
}