import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, Moon, Sun, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_NAMES } from '../utils/translations';

export default function Header() {
  const location = useLocation();
  const { theme, toggleTheme, user, setLanguage } = useApp();
  
  if (location.pathname === '/sos') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pt-safe transition-all duration-300 glass">
      <div className="flex justify-between items-center px-5 py-3 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {/* Jewel/Kaaba Icon Logo */}
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-800 p-1.5 rounded-lg shadow-md rotate-45 border border-white/20">
             <div className="-rotate-45 text-white font-bold text-xs flex items-center justify-center w-5 h-5">
               🕋
             </div>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold font-bengali tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200 leading-none">
              HajjCare
            </h1>
            <a href="https://w3jdev.com" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-500 dark:text-gray-400 font-medium tracking-wide hover:text-emerald-600 transition-colors leading-none mt-0.5">
              by w3jdev
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Globe size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">{user.language}</span>
                </button>
                <select 
                    value={user.language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Select Language"
                >
                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Compact SOS Icon */}
            <Link 
            to="/sos" 
            className="bg-alert w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 dark:shadow-red-900/50 hover:bg-red-600 transition-transform active:scale-95 animate-pulse"
            >
            <AlertCircle size={20} />
            </Link>
        </div>
      </div>
    </header>
  );
}