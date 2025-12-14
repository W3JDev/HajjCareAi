import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Circle, MapPin, Plane, User, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checklist() {
  const { checklist, toggleChecklistItem } = useApp();

  // Calculate overall progress
  const totalTasks = checklist.reduce((acc, phase) => acc + phase.items.length, 0);
  const completedTasks = checklist.reduce((acc, phase) => acc + phase.items.filter(i => i.completed).length, 0);
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  // Helper to get icon for phase
  const getPhaseIcon = (iconName: string) => {
    switch (iconName) {
      case '✈️': return <Plane size={20} />;
      case 'kaaba': return <span className="text-xl">🕋</span>;
      case 'tent': return <span className="text-xl">⛺</span>;
      case 'bus': return <span className="text-xl">🚌</span>;
      default: return <ClipboardCheck size={20} />;
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-dark dark:text-white font-bengali">হজ্জের প্রস্তুতি তালিকা</h2>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in">
        <div className="flex justify-between items-end mb-2">
            <div>
               <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 font-bengali">আপনার অগ্রগতি</h3>
               <p className="text-sm text-gray-500 font-bengali">{completedTasks}/{totalTasks} টি ধাপ সম্পন্ন</p>
            </div>
            <span className="text-3xl font-bold text-primary font-mono">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
                className="bg-gradient-to-r from-primary to-green-400 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-6">
        {checklist.map((phase, index) => {
            const phaseCompleted = phase.items.every(i => i.completed);
            
            return (
              <div key={phase.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-3 pl-2">
                      <div className={`p-2 rounded-lg ${phaseCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {getPhaseIcon(phase.icon)}
                      </div>
                      <h3 className="font-bold text-lg text-dark dark:text-white font-bengali">{phase.title}</h3>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                      {phase.items.map((item) => (
                          <div 
                              key={item.id}
                              onClick={() => toggleChecklistItem(phase.id, item.id)}
                              className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-start gap-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${item.completed ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                          >
                              <div className={`mt-0.5 transition-transform duration-300 ${item.completed ? 'text-green-500 scale-110' : 'text-gray-300 dark:text-gray-600'}`}>
                                  {item.completed ? <CheckCircle size={22} strokeWidth={3} /> : <Circle size={22} />}
                              </div>
                              <div className="flex-1">
                                  <p className={`font-bengali text-base transition-all ${item.completed ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-300' : 'text-dark dark:text-gray-200'}`}>
                                      {item.text}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            );
        })}
      </div>
      
      <div className="mt-12 text-center text-gray-400 text-sm font-bengali">
          <p>আল্লাহ আপনার হজ্জ কবুল করুন। আমিন।</p>
          <p className="text-xs mt-1 opacity-50">HajjCare দ্বারা প্রস্তুতকৃত</p>
      </div>
    </div>
  );
}