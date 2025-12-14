import React, { useState } from 'react';
import { Check, Droplets, Clock, BarChart3, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateHealthSummary } from '../services/geminiService';

export default function HealthTracker() {
  const { user, addWater, toggleMedication } = useApp();
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Helper to get Bengali day name
  const getDayName = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    return days[d.getDay()];
  };

  // Generate chart data: 6 days mock + 1 day real
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const isToday = i === 6;
    // Mock history: 3-8 glasses for past days, real data for today
    const value = isToday ? user.waterIntake : Math.floor(Math.random() * 6) + 3;
    return {
      day: getDayName(6 - i),
      value,
      isToday
    };
  });

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    const text = await generateHealthSummary(user);
    setSummary(text);
    setLoadingSummary(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-dark dark:text-white font-bengali">আজকের স্বাস্থ্য</h2>

      {/* AI Health Summary Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 font-bengali flex items-center gap-2">
                <Sparkles size={18} /> এআই স্বাস্থ্য সহকারী
            </h3>
        </div>
        
        {!summary ? (
            <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-bengali mb-4">
                    আপনার বর্তমান অবস্থা অনুযায়ী আজকের জন্য বিশেষ পরামর্শ পেতে নিচের বাটনে চাপ দিন।
                </p>
                <button 
                    onClick={handleGenerateSummary}
                    disabled={loadingSummary}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold font-bengali text-sm flex items-center gap-2 mx-auto transition-transform active:scale-95 disabled:opacity-70"
                >
                    {loadingSummary ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    আজকের পরামর্শ তৈরি করুন
                </button>
            </div>
        ) : (
            <div className="animate-fade-in">
                <div className="prose prose-sm dark:prose-invert font-bengali text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                    {summary}
                </div>
                <button 
                    onClick={() => setSummary("")}
                    className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                    নতুন করে দেখুন
                </button>
            </div>
        )}
      </div>

      {/* Water Intake */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 font-bengali">
            <Droplets size={20} /> পানি পান
          </h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-bengali">{user.waterIntake}/৮</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-8 w-8 rounded-full transition-all duration-500 ${
                i < user.waterIntake ? 'bg-blue-500 shadow-sm' : 'bg-blue-200 dark:bg-blue-800 opacity-30'
              }`}
            />
          ))}
        </div>
        <button
          onClick={addWater}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-md active:scale-95 transition hover:bg-blue-600 font-bengali"
        >
          + ১ গ্লাস পানি যোগ করুন
        </button>
      </div>

      {/* Weekly Analysis Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2 font-bengali">
            <BarChart3 size={20} /> সাপ্তাহিক পানি পান
        </h3>
        <div className="flex justify-between items-end h-40 gap-2">
            {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                    <span className={`text-xs mb-1 font-bold ${d.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                        {d.value}
                    </span>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md relative h-full flex items-end overflow-hidden">
                        <div 
                           style={{ height: `${Math.min((d.value / 8) * 100, 100)}%` }} 
                           className={`w-full rounded-t-md transition-all duration-1000 ${
                               d.isToday ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-600 opacity-60'
                           }`}
                        />
                    </div>
                    <span className={`text-[10px] mt-2 font-bengali whitespace-nowrap ${d.isToday ? 'font-bold text-dark dark:text-white' : 'text-gray-400'}`}>
                        {d.day}
                    </span>
                </div>
            ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 font-bengali">ওষুধের তালিকা</h3>
        <div className="space-y-3">
          {user.medications.map(med => (
            <div
              key={med.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg text-dark dark:text-white font-bengali">{med.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 font-bengali text-sm">{med.time} - খাবারের পরে</p>
                </div>
              </div>
              <button
                onClick={() => toggleMedication(med.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  med.taken 
                    ? 'bg-green-500 border-green-500 text-white scale-110' 
                    : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-600'
                }`}
              >
                <Check size={24} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Slider */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 font-bengali">আমার শক্তি আজ</h3>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between mt-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 font-bengali">
          <span>দুর্বল</span>
          <span>মোটামুটি</span>
          <span>ভালো</span>
          <span>খুব ভালো</span>
        </div>
      </div>
    </div>
  );
}