import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Droplets, Battery, MapPin, Fingerprint, Github, Linkedin, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { user, t } = useApp();
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto animate-fade-in relative pb-8">
      {/* Greeting & Date */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-l-4 border-primary dark:border-green-500 transition-colors">
        <h2 className="text-xl font-bold text-dark dark:text-white font-bengali">{t('greeting')}, {user.name}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-bengali">22 Nov 2025 | 20 Jumada Al-Awwal 1447</p>
        <div className="flex items-center mt-2 text-secondary dark:text-blue-400 font-semibold text-sm font-bengali">
          <MapPin size={16} className="mr-1" />
          {t('location_makkah')} (38°C)
        </div>
      </div>

      {/* Musafir ID Card Button - Links to Profile */}
      <button 
        onClick={() => navigate('/profile')}
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between active:scale-98 transition-transform group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
            <Fingerprint size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg font-bengali">{t('musafir_profile')}</h3>
            <p className="text-teal-100 text-xs font-bengali">{t('view_docs')}</p>
          </div>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">VIEW</span>
      </button>

      {/* Next Prayer */}
      <div className="bg-secondary dark:bg-blue-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10">
          <p className="text-lg opacity-90 font-bengali">{t('next_prayer')}</p>
          <h3 className="text-4xl font-bold mt-1 font-bengali">{t('asr')}</h3>
          <p className="text-xl mt-2 font-bengali">{t('time_remaining')}</p>
        </div>
        <Sun className="absolute -right-4 -bottom-4 text-white opacity-20" size={120} />
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-2 text-blue-600 dark:text-blue-400">
            <Droplets size={24} />
          </div>
          <span className="text-2xl font-bold text-dark dark:text-white font-bengali">{user.waterIntake}/8</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-bengali">{t('glass_unit')}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mb-2 text-green-600 dark:text-green-400">
            <Battery size={24} />
          </div>
          <span className="text-lg font-bold text-dark dark:text-white font-bengali">{t('energy_good')}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-bengali">{t('energy_today')}</span>
        </div>
      </div>

      {/* Big Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mt-2">
        <Link to="/translate" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition active:scale-95">
          <span className="text-3xl mb-2">🗣️</span>
          <span className="font-bold text-sm text-dark dark:text-white font-bengali text-center">{t('translate_btn')}</span>
        </Link>
        <Link to="/map" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition active:scale-95">
          <span className="text-3xl mb-2">🧭</span>
          <span className="font-bold text-sm text-dark dark:text-white font-bengali text-center">{t('directions_btn')}</span>
        </Link>
        <Link to="/expenses" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition active:scale-95">
          <span className="text-3xl mb-2">💰</span>
          <span className="font-bold text-sm text-dark dark:text-white font-bengali text-center">{t('expenses_btn')}</span>
        </Link>
      </div>

      {/* Tip of the Day */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-4 rounded-xl mt-2 transition-colors">
        <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1 font-bengali">{t('tip_title')}</h4>
        <p className="text-dark dark:text-gray-300 leading-relaxed text-sm font-bengali">
          {t('tip_content')}
        </p>
      </div>

      {/* Professional Footer */}
      <footer className="mt-8 mb-4 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col items-center opacity-80">
        <div className="flex items-center gap-1.5 mb-2 text-gray-500 dark:text-gray-400">
           <span className="text-xs font-semibold">© {new Date().getFullYear()} w3jdev</span>
        </div>
        
        <div className="flex items-center gap-4">
            <a href="https://github.com/w3jdev" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors" title="GitHub">
                <Github size={16} />
            </a>
            <a href="https://w3jdev.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors" title="Website">
                <Globe size={16} />
            </a>
            <a href="https://linkedin.com/in/w3jdev" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors" title="LinkedIn">
                <Linkedin size={16} />
            </a>
        </div>
      </footer>
    </div>
  );
}