import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Mic, Pill, Map as MapIcon, BookOpen, ListChecks } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navigation() {
  const location = useLocation();
  const { t } = useApp();
  
  if (location.pathname === '/sos') return null;

  const navItems = [
    { path: '/', label: t('nav_home'), icon: Home },
    { path: '/translate', label: t('nav_translate'), icon: Mic },
    { path: '/checklist', label: t('nav_list'), icon: ListChecks },
    { path: '/map', label: t('nav_map'), icon: MapIcon },
    { path: '/guide', label: t('nav_guide'), icon: BookOpen },
  ];

  return (
    <div className="glass-nav fixed bottom-0 left-0 right-0 pb-safe pt-2 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-end px-2 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex flex-col items-center justify-center w-full h-full pb-2 transition-all duration-300 active:scale-90`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 dark:bg-primary/20 -translate-y-1' : ''}`}>
                <item.icon 
                  size={26} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-colors duration-300 ${isActive ? 'text-primary dark:text-green-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
                />
              </div>
              <span className={`text-[10px] font-bengali font-medium transition-all duration-300 ${isActive ? 'text-primary dark:text-green-400 font-bold scale-105' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}