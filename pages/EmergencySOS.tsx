import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EmergencySOS() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [countDown, setCountDown] = useState(5);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (!active && countDown > 0) {
      timer = setInterval(() => {
        setCountDown((prev) => prev - 1);
      }, 1000);
    } else if (countDown === 0 && !active) {
      setActive(true);
      // Trigger mock SOS call logic here
    }
    return () => clearInterval(timer);
  }, [countDown, active]);

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${active ? 'bg-alert' : 'bg-white dark:bg-gray-900'}`}>
      {!active ? (
        <>
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold text-alert font-bengali">জরুরি সাহায্য</h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 font-bengali">কল করা হবে: {countDown} সেকেন্ড</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-red-200 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-64 h-64 bg-alert rounded-full flex items-center justify-center shadow-2xl border-8 border-red-100 dark:border-red-900/50">
              <Phone size={80} color="white" />
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="mt-16 bg-gray-200 dark:bg-gray-700 text-dark dark:text-white text-xl font-bold py-4 px-12 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition active:scale-95 font-bengali"
          >
            বাতিল করুন (Cancel)
          </button>
        </>
      ) : (
        <div className="w-full max-w-md h-full text-white flex flex-col items-center text-center animate-fade-in">
           <div className="mb-8 flex flex-col items-center">
              <AlertTriangle size={64} className="mb-2 animate-bounce" />
              <h1 className="text-4xl font-bold font-bengali">সাহায্য চাওয়া হয়েছে!</h1>
           </div>

          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md w-full mb-6 border border-white/20 text-left">
            <p className="text-xl mb-2 font-bengali flex items-center gap-2">🚑 অ্যাম্বুলেন্স (৯৯৭) কল করা হয়েছে</p>
            <p className="text-xl font-bengali flex items-center gap-2">📩 পরিবারকে লোকেশন পাঠানো হয়েছে</p>
          </div>

          <div className="bg-white dark:bg-gray-800 text-dark dark:text-white p-6 rounded-xl w-full shadow-2xl text-left transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-alert border-b pb-2 dark:border-gray-700">Medical Info</h2>
            <div className="space-y-2 text-lg">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Blood Type:</strong> <span className="text-alert font-bold">{user.bloodType}</span></p>
              <p><strong>Condition:</strong> {user.conditions.join(', ')}</p>
              <p><strong>Location:</strong> Ajyad St, Makkah (Lat: 21.42, Long: 39.82)</p>
            </div>
            
            <div className="mt-6">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <p className="text-2xl font-arabic text-center mb-2 leading-relaxed">
                    أنا مريض سكري، أحتاج مساعدة عاجلة
                  </p>
                  <hr className="border-gray-200 dark:border-gray-600 my-2"/>
                  <p className="text-base text-gray-500 dark:text-gray-400 text-center">(I am a diabetic patient, I need urgent help)</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActive(false)}
            className="mt-8 border-2 border-white text-white py-3 px-8 rounded-full font-bengali hover:bg-white/10 transition"
          >
            আমি নিরাপদ (I am safe)
          </button>
        </div>
      )}
    </div>
  );
}