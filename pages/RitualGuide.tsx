import React, { useState } from 'react';
import { BookOpen, CheckCircle, Search, Loader2, ExternalLink, BrainCircuit, Volume2, RotateCcw, Award, Repeat } from 'lucide-react';
import { searchGuide, askWithThinking, generateSpeech } from '../services/geminiService';
import { base64ToUint8Array, decodeAudioData } from '../utils/audio';

interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
}

const HAJJ_DUAS: Dua[] = [
  {
    id: 'talbiyah',
    category: 'ihram',
    title: 'তালবিয়া (ইহরাম)',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ',
    transliteration: 'লাব্বাইক আল্লাহুম্মা লাব্বাইক, লাব্বাইকা লা শারিকা লাকা লাব্বাইক, ইন্নাল হামদা ওয়ান-নি’মাতা লাকা ওয়াল মুলক, লা শারিকা লাক।',
    translation: 'আমি হাজির হে আল্লাহ! আমি হাজির! আপনার কোন শরীক নেই, আমি হাজির। নিশ্চয়ই সকল প্রশংসা ও নেয়ামত আপনারই এবং রাজত্বও আপনার, আপনার কোন শরীক নেই।'
  },
  {
    id: 'masjid_enter',
    category: 'masjid',
    title: 'মসজিদে প্রবেশের দোয়া',
    arabic: 'بِسْمِ اللَّهِ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ ، اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'বিসমিল্লাহি ওয়াস-সালামু ‘আলা রাসূলিল্লাহ, আল্লাহুম্মাগফির লি যুনূবি ওয়াফতাহ লি আবওয়াবা রাহমাতিক।',
    translation: 'আল্লাহর নামে, এবং আল্লাহর রাসূলের ওপর শান্তি বর্ষিত হোক। হে আল্লাহ, আমার গুনাহসমূহ ক্ষমা করে দিন এবং আমার জন্য আপনার রহমতের দরজাগুলো খুলে দিন।'
  },
  {
    id: 'tawaf_start',
    category: 'tawaf',
    title: 'তাওয়াফ শুরু',
    arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
    transliteration: 'বিসমিল্লাহি আল্লাহু আকবার।',
    translation: 'আল্লাহর নামে শুরু করছি এবং আল্লাহ মহান।'
  },
  {
    id: 'rabbana',
    category: 'tawaf',
    title: 'রুকনে ইয়ামানি ও হাজরে আসওয়াদের মাঝে',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'রাব্বানা আতিনা ফিদ-দুনিয়া হাসানাতাওঁ ওয়া ফিল আখিরাতি হাসানাতাওঁ ওয়া ক্বিনা আযাবান নার।',
    translation: 'হে আমাদের প্রতিপালক! আমাদের দুনিয়াতে কল্যাণ দিন এবং আখেরাতেও কল্যাণ দিন এবং আগুনের শাস্তি থেকে রক্ষা করুন।'
  },
  {
    id: 'safa_marwa_start',
    category: 'sai',
    title: 'সাফা-মারওয়া সাঈ শুরু',
    arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
    transliteration: 'ইন্নাস সাফা ওয়াল মারওয়াতা মিন শাআ’ইরিল্লাহ।',
    translation: 'নিশ্চয় সাফা ও মারওয়া আল্লাহর নিদর্শনসমূহের অন্তর্ভুক্ত।'
  },
  {
    id: 'safa_top',
    category: 'sai',
    title: 'সাফা পাহাড়ে উঠে দোয়া',
    arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদির।',
    translation: 'আল্লাহ ছাড়া কোন মাবুদ নেই, তিনি এক, তার কোন শরীক নেই। রাজত্ব তারই এবং প্রশংসাও তারই। তিনি সকল কিছুর উপর ক্ষমতাবান।'
  },
  {
    id: 'arafat',
    category: 'arafat',
    title: 'আরাফাতের দিনের শ্রেষ্ঠ দোয়া',
    arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদির।',
    translation: 'আল্লাহ ছাড়া কোন মাবুদ নেই, তিনি এক, তার কোন শরীক নেই। রাজত্ব তারই এবং প্রশংসাও তারই। তিনি সকল কিছুর উপর ক্ষমতাবান।'
  },
  {
    id: 'mina',
    category: 'mina',
    title: 'মিনায় অবস্থানের দোয়া',
    arabic: 'اللَّهُمَّ آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'আল্লাহুম্মা আতিনা ফিদ-দুনিয়া হাসানাতাওঁ ওয়া ফিল আখিরাতি হাসানাতাওঁ ওয়া ক্বিনা আযাবান নার।',
    translation: 'হে আল্লাহ! আমাদের দুনিয়া ও আখিরাতে কল্যাণ দান করুন এবং জাহান্নামের আজাব থেকে রক্ষা করুন।'
  },
  {
    id: 'stone_throwing',
    category: 'jamarat',
    title: 'কঙ্কর নিক্ষেপের সময়',
    arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
    transliteration: 'বিসমিল্লাহি আল্লাহু আকবার।',
    translation: 'আল্লাহর নামে এবং আল্লাহ মহান।'
  },
  {
    id: 'zamzam',
    category: 'general',
    title: 'জমজম পানি পান করার দোয়া',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ',
    transliteration: 'আল্লাহুম্মা ইন্নি আসআলুকা ইলমান নাফিয়া, ওয়া রিযকান ওয়াসিয়া, ওয়া শিফাআম মিন কুল্লি দা।',
    translation: 'হে আল্লাহ! আমি আপনার কাছে উপকারী জ্ঞান, প্রশস্ত রিযিক এবং সকল রোগ থেকে মুক্তি প্রার্থনা করছি।'
  }
];

const QUIZ_DATA = [
  {
    question: "হজ্জের ফরজ কয়টি?",
    options: ["২টি", "৩টি", "৪টি", "৫টি"],
    answer: 1 // ৩টি
  },
  {
    question: "কোন পাহাড় থেকে সাঈ শুরু করতে হয়?",
    options: ["মারওয়া", "আরাফাত", "সাফা", "হেরা"],
    answer: 2 // সাফা
  },
  {
    question: "তাওয়াফের সময় কাবা কোন দিকে রাখতে হয়?",
    options: ["ডান দিকে", "বাম দিকে", "সামনে", "পেছনে"],
    answer: 1 // বাম দিকে
  },
  {
    question: "আরাফাতের ময়দানে অবস্থান করা কখন জরুরি?",
    options: ["৮ জিলহজ", "৯ জিলহজ", "১০ জিলহজ", "১১ জিলহজ"],
    answer: 1 // ৯ জিলহজ
  }
];

export default function RitualGuide() {
  const [activeTab, setActiveTab] = useState<'guide' | 'counter' | 'duas' | 'quiz'>('guide');
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<{text: string, sources?: any[]} | null>(null);
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [playingDua, setPlayingDua] = useState<string | null>(null);
  
  // Counter State
  const [counterType, setCounterType] = useState<'tawaf' | 'sai'>('tawaf');
  const [count, setCount] = useState(0);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const [steps, setSteps] = useState([
    { title: 'ইহরাম বাঁধা', desc: 'পরিষ্কার পরিচ্ছন্ন হয়ে ইহরামের কাপড় পরিধান করুন।', done: true },
    { title: 'তাওয়াফ', desc: 'কাবা শরীফের চারদিকে ৭ বার প্রদক্ষিণ করুন।', done: false },
    { title: 'সাঈ', desc: 'সাফা ও মারওয়া পাহাড়ের মাঝে ৭ বার দৌড়ান।', done: false },
    { title: 'মাথা মুণ্ডন', desc: 'মাথার চুল ছোট বা মুণ্ডন করুন।', done: false },
    { title: 'মিনা ও আরাফাত', desc: 'নির্দিষ্ট দিনে মিনা ও আরাফাতে অবস্থান করুন।', done: false },
    { title: 'কঙ্কর নিক্ষেপ', desc: 'জামারাতে শয়তানকে উদ্দেশ্য করে কঙ্কর নিক্ষেপ করুন।', done: false },
    { title: 'কোরবানি', desc: 'আল্লাহর সন্তুষ্টির জন্য পশু কোরবানি দিন।', done: false },
  ]);

  const toggleStep = (index: number) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, done: !s.done } : s));
  };

  const progress = Math.round((steps.filter(s => s.done).length / steps.length) * 100);

  const handleSearch = async () => {
      if (!query.trim()) return;
      setLoading(true);
      setAnswer(null);

      if (useThinking) {
        // Use Thinking Model
        const text = await askWithThinking(query);
        setAnswer({ text, sources: [] });
      } else {
        // Use Search Grounding
        const result = await searchGuide(query);
        setAnswer(result);
      }
      setLoading(false);
  };

  const playDuaAudio = async (duaId: string, text: string) => {
    if (playingDua) return; // Prevent multiple plays
    setPlayingDua(duaId);
    
    try {
      const prompt = `Recite the following Arabic prayer clearly and slowly: ${text}`;
      const base64Data = await generateSpeech(prompt);
      
      if (base64Data) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Data), audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        
        source.onended = () => {
          setPlayingDua(null);
          audioContext.close();
        };
      } else {
        setPlayingDua(null);
      }
    } catch (error) {
      console.error("Audio play error", error);
      setPlayingDua(null);
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (optionIndex === QUIZ_DATA[quizIndex].answer) {
        setScore(score + 1);
    }
    
    const next = quizIndex + 1;
    if (next < QUIZ_DATA.length) {
        setQuizIndex(next);
    } else {
        setShowScore(true);
    }
  };

  const resetQuiz = () => {
      setQuizIndex(0);
      setScore(0);
      setShowScore(false);
  };

  const incrementCount = () => {
      if (count < 7) {
          if (navigator.vibrate) navigator.vibrate(50);
          setCount(c => c + 1);
      } else {
          // Finished vibration pattern
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-dark dark:text-white font-bengali mb-4">হজ্জ গাইড</h2>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6 transition-colors overflow-x-auto no-scrollbar">
        {[
            {id: 'guide', label: 'গাইড'}, 
            {id: 'counter', label: 'তাওয়াফ গণনা'},
            {id: 'duas', label: 'দোয়া'}, 
            {id: 'quiz', label: 'কুইজ'}
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 whitespace-nowrap rounded-lg text-sm font-bold font-bengali transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-gray-800 text-dark dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* GUIDE TAB */}
      {activeTab === 'guide' && (
        <div className="animate-fade-in">
          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 font-bengali">কিছু জানতে চান?</h3>
              
              <div className="flex items-center gap-2 mb-3">
                <button 
                  onClick={() => setUseThinking(!useThinking)}
                  className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all font-bengali ${
                    useThinking 
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold' 
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <BrainCircuit size={14} />
                  {useThinking ? 'গভীর চিন্তন চালু' : 'সাধারণ অনুসন্ধান'}
                </button>
              </div>

              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={useThinking ? "জটিল প্রশ্ন লিখুন..." : "যেমন: তাওয়াফের দোয়া কি?"}
                    className={`flex-1 border rounded-xl px-4 py-2 outline-none font-bengali transition-colors text-dark dark:text-white placeholder-gray-400 ${
                      useThinking 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 focus:border-purple-300' 
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-primary'
                    }`}
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className={`text-white p-3 rounded-xl transition disabled:opacity-50 ${
                      useThinking ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-green-600'
                    }`}
                  >
                      {loading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                  </button>
              </div>
              
              {answer && (
                  <div className={`mt-4 p-4 rounded-xl border animate-fade-in ${
                    useThinking 
                      ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800' 
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                  }`}>
                      <p className="text-dark dark:text-gray-200 font-bengali leading-relaxed text-sm whitespace-pre-wrap">{answer.text}</p>
                      {answer.sources && answer.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">সূত্র:</p>
                              {answer.sources.map((src, idx) => (
                                  <a key={idx} href={src.web?.uri} target="_blank" rel="noreferrer" className="block text-xs text-blue-600 dark:text-blue-400 truncate flex items-center gap-1 mb-1">
                                      <ExternalLink size={10}/> {src.web?.title}
                                  </a>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6 px-1">
            <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 font-bengali">হজ্জের অগ্রগতি</h3>
                <span className="text-xs font-bold text-primary font-bengali">{progress}% সম্পন্ন</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                    className="bg-gradient-to-r from-primary to-green-400 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
          </div>
          
          {/* Checkable Steps */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                onClick={() => toggleStep(idx)}
                className={`p-5 rounded-xl border transition-all cursor-pointer select-none ${
                    step.done 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.99]'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                     <h3 className={`text-lg font-bold font-bengali transition-all ${
                         step.done ? 'text-green-700 dark:text-green-400 line-through decoration-green-500/50' : 'text-dark dark:text-white'
                     }`}>
                         {idx + 1}. {step.title}
                     </h3>
                     <p className={`mt-1 text-sm font-bengali transition-colors ${
                         step.done ? 'text-green-600/70 dark:text-green-400/60' : 'text-gray-600 dark:text-gray-400'
                     }`}>
                         {step.desc}
                     </p>
                  </div>
                  <div className={`mt-1 p-1 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                      step.done 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 dark:border-gray-600 text-transparent'
                  }`}>
                      <CheckCircle size={20} strokeWidth={3} className={step.done ? "scale-100" : "scale-0"} />
                      {!step.done && <div className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* COUNTER TAB */}
      {activeTab === 'counter' && (
          <div className="flex flex-col items-center animate-fade-in pt-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
                  <button 
                    onClick={() => { setCounterType('tawaf'); setCount(0); }}
                    className={`px-6 py-2 rounded-md text-sm font-bold font-bengali transition-all ${counterType === 'tawaf' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`}
                  >
                      তাওয়াফ
                  </button>
                  <button 
                    onClick={() => { setCounterType('sai'); setCount(0); }}
                    className={`px-6 py-2 rounded-md text-sm font-bold font-bengali transition-all ${counterType === 'sai' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`}
                  >
                      সাঈ
                  </button>
              </div>

              {/* The Big Button */}
              <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-primary rounded-full blur-2xl opacity-20 transition-all ${count === 7 ? 'scale-125 bg-green-500 opacity-40' : ''}`}></div>
                  <button 
                    onClick={incrementCount}
                    disabled={count >= 7}
                    className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center border-8 shadow-2xl transition-all active:scale-95 ${
                        count >= 7 
                        ? 'bg-green-600 border-green-400 text-white' 
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  >
                      {count >= 7 ? (
                          <>
                            <Award size={64} className="mb-2 animate-bounce" />
                            <span className="text-2xl font-bold font-bengali">আলহামদুলিল্লাহ!</span>
                            <span className="text-sm">সম্পন্ন হয়েছে</span>
                          </>
                      ) : (
                          <>
                            <span className="text-8xl font-bold font-mono text-primary mb-2">{count}</span>
                            <span className="text-gray-400 font-bengali">/ ৭ চক্কর</span>
                            <span className="text-xs text-gray-300 mt-4">(ট্যাপ করুন)</span>
                          </>
                      )}
                  </button>
              </div>

              {/* Controls */}
              <button 
                onClick={() => setCount(0)}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors p-3"
              >
                  <RotateCcw size={18} />
                  <span className="font-bengali font-bold">পুনরায় শুরু করুন</span>
              </button>

              {/* Dua Hint */}
              {count > 0 && count < 7 && (
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800 w-full animate-slide-up">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 font-bengali">এই চক্করের জন্য দোয়া</p>
                      <p className="text-dark dark:text-white font-bengali text-sm">
                          "রাব্বানা আতিনা ফিদ-দুনিয়া হাসানাতাওঁ..." (সাধারণ দোয়া পড়তে থাকুন)
                      </p>
                  </div>
              )}
          </div>
      )}

      {/* DUAS TAB */}
      {activeTab === 'duas' && (
        <div className="space-y-4 animate-fade-in">
          {HAJJ_DUAS.map((dua) => (
            <div key={dua.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bengali">{dua.category}</span>
                <button 
                  onClick={() => playDuaAudio(dua.id, dua.arabic)}
                  disabled={playingDua !== null}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    playingDua === dua.id 
                      ? 'bg-primary text-white' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                >
                  {playingDua === dua.id ? <Loader2 size={12} className="animate-spin"/> : <Volume2 size={12}/>}
                  {playingDua === dua.id ? 'বাজছে...' : 'শুনুন'}
                </button>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-dark dark:text-white font-bengali mb-3">{dua.title}</h3>
                
                <p className="text-2xl font-arabic text-right leading-loose text-dark dark:text-gray-200 mb-4" dir="rtl">
                  {dua.arabic}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bengali mb-1">উচ্চারণ (বাংলায়)</p>
                    <p className="text-base text-primary dark:text-green-400 font-medium font-bengali leading-relaxed">
                      {dua.transliteration}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bengali mb-1">অর্থ</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-bengali italic">
                      {dua.translation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && (
          <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh]">
              {showScore ? (
                  <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full">
                      <Award size={64} className="text-yellow-500 mx-auto mb-4 animate-bounce" />
                      <h3 className="text-2xl font-bold font-bengali text-dark dark:text-white mb-2">অভিনন্দন!</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-bengali mb-6">আপনি কুইজ সম্পন্ন করেছেন</p>
                      
                      <div className="text-4xl font-bold text-primary mb-6 font-mono">
                          {score} / {QUIZ_DATA.length}
                      </div>
                      
                      <button 
                        onClick={resetQuiz}
                        className="bg-primary text-white px-8 py-3 rounded-full font-bold font-bengali flex items-center gap-2 mx-auto hover:bg-green-600 transition"
                      >
                        <Repeat size={18} /> আবার খেলুন
                      </button>
                  </div>
              ) : (
                  <div className="w-full">
                      <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-bold text-gray-400 font-bengali">প্রশ্ন {quizIndex + 1}/{QUIZ_DATA.length}</span>
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">স্কোর: {score}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-dark dark:text-white font-bengali mb-8 leading-relaxed">
                          {QUIZ_DATA[quizIndex].question}
                      </h3>
                      
                      <div className="space-y-3">
                          {QUIZ_DATA[quizIndex].options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuizAnswer(idx)}
                                className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-left font-bengali hover:border-primary dark:hover:border-primary hover:bg-green-50 dark:hover:bg-green-900/20 transition active:scale-98"
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
}