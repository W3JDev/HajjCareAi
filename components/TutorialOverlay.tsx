import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

export default function TutorialOverlay() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hajjcare_tutorial_completed');
    if (!hasSeenTutorial) {
      // Delay slightly for nice entrance
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const completeTutorial = () => {
    setIsVisible(false);
    localStorage.setItem('hajjcare_tutorial_completed', 'true');
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "স্বাগতম HajjCare এ!",
      desc: "আপনার হজ্জ যাত্রার বিশ্বস্ত সঙ্গী। চলুন দেখে নেই কিভাবে অ্যাপটি ব্যবহার করবেন।",
      icon: "👋"
    },
    {
      title: "ভাষা অনুবাদ",
      desc: "আরবি বুঝতে সমস্যা? 'অনুবাদ' ব্যবহার করে সহজেই কথা বলুন।",
      icon: "🗣️"
    },
    {
      title: "জরুরি সাহায্য (SOS)",
      desc: "বিপদে পড়লে উপরে ডানদিকের লাল SOS বাটনে চাপ দিন।",
      icon: "🆘"
    },
    {
      title: "লাইভ অ্যাসিস্ট্যান্ট",
      desc: "যেকোনো প্রশ্নের জন্য নিচে ডানদিকের মাইক আইকনে ট্যাপ করে কথা বলুন।",
      icon: "🎙️"
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <button 
          onClick={completeTutorial}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mt-4">
            <div className="text-6xl mb-6">{current.icon}</div>
            <h3 className="text-2xl font-bold font-bengali mb-3 text-dark">{current.title}</h3>
            <p className="text-gray-500 font-bengali leading-relaxed mb-8">{current.desc}</p>
        </div>

        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                {steps.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-gray-200'}`} />
                ))}
            </div>
            
            <button
                onClick={() => {
                    if (step < steps.length - 1) setStep(s => s + 1);
                    else completeTutorial();
                }}
                className="bg-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-600 transition font-bengali"
            >
                {step === steps.length - 1 ? (
                    <>শুরু করুন <Check size={18}/></>
                ) : (
                    <>পরবর্তী <ChevronRight size={18}/></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}