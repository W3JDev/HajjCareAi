import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, ChecklistPhase, Language } from '../types';
import { translations, getTranslation } from '../utils/translations';

export interface Expense {
  id: string;
  amount: number;
  currency: 'BDT' | 'SAR';
  category: 'food' | 'transport' | 'shopping' | 'donation' | 'other';
  note: string;
  date: string;
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  addWater: () => void;
  toggleMedication: (id: number) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
  checklist: ChecklistPhase[];
  toggleChecklistItem: (phaseId: string, itemId: string) => void;
  t: (key: keyof typeof translations['en']) => string;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  name: 'Jahanara Begum',
  language: 'bn', // Default to Bengali
  bloodType: 'A+',
  conditions: ['Diabetes', 'Hypertension'],
  medications: [
    { id: 1, name: 'Paracetamol', time: '08:00', taken: false },
    { id: 2, name: 'Insulin', time: '13:00', taken: false }
  ],
  waterIntake: 0,
  energyLevel: 'good',
  hotelName: 'Hotel Al Kiswah Tower',
  hotelNameArabic: 'فندق أبراج الكسوة',
  emergencyContact: '+880 1711-234567',
  groupNumber: 'BD-1205',
  documents: [],
  contacts: [
    { relation: 'son', name: 'My Son', number: '601160600963' },
    { relation: 'sister', name: 'Sister', number: '8801712345678' },
    { relation: 'dad', name: 'Dad', number: '8801712345679' }
  ]
};

const DEFAULT_CHECKLIST: ChecklistPhase[] = [
  {
    id: 'prep',
    title: 'Preparation',
    icon: '📝',
    items: [
      { id: 'p1', text: 'Check Passport & Visa', completed: false },
      { id: 'p2', text: 'Complete Medical Checkup', completed: false },
      { id: 'p3', text: 'Buy Ihram Clothing', completed: false },
      { id: 'p4', text: 'Exchange Currency', completed: false },
      { id: 'p5', text: 'Pack Medications', completed: false }
    ]
  },
  {
    id: 'departure',
    title: 'Departure',
    icon: '✈️',
    items: [
      { id: 'd1', text: 'Wear Ihram & Niyat', completed: false },
      { id: 'd2', text: 'Recite Talbiyah', completed: false },
      { id: 'd3', text: 'Stay with Group Leader', completed: false },
      { id: 'd4', text: 'Wear ID Card', completed: false }
    ]
  },
  {
    id: 'makkah',
    title: 'Makkah & Umrah',
    icon: 'kaaba',
    items: [
      { id: 'm1', text: 'Check-in & Rest', completed: false },
      { id: 'm2', text: 'Perform Umrah (Tawaf & Sai)', completed: false },
      { id: 'm3', text: 'Hair Trimming', completed: false },
      { id: 'm4', text: 'Regular Prayers in Haram', completed: false }
    ]
  },
  {
    id: 'hajj',
    title: 'Hajj Days',
    icon: 'tent',
    items: [
      { id: 'h1', text: '8 Dhul Hijjah: Mina', completed: false },
      { id: 'h2', text: '9 Dhul Hijjah: Arafat (Fard)', completed: false },
      { id: 'h3', text: 'Muzdalifah Night', completed: false },
      { id: 'h4', text: '10 Dhul Hijjah: Jamarat', completed: false },
      { id: 'h5', text: 'Qurbani & Shaving', completed: false },
      { id: 'h6', text: 'Tawaf Al-Ifadah', completed: false }
    ]
  }
];

export function AppProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checklist, setChecklist] = useState<ChecklistPhase[]>(DEFAULT_CHECKLIST);

  // Load from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hajjcare_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Merge with default to ensure new fields like contacts exist
        setUser({ ...DEFAULT_USER, ...parsed, contacts: parsed.contacts || DEFAULT_USER.contacts });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    const savedTheme = localStorage.getItem('hajjcare_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    }

    const savedExpenses = localStorage.getItem('hajjcare_expenses');
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error("Failed to parse expenses", e);
      }
    }

    const savedChecklist = localStorage.getItem('hajjcare_checklist');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {
        console.error("Failed to parse checklist", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('hajjcare_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hajjcare_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#111827");
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#F9FAFB");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hajjcare_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('hajjcare_checklist', JSON.stringify(checklist));
  }, [checklist]);

  const addWater = () => {
    setUser(prev => ({ ...prev, waterIntake: Math.min(prev.waterIntake + 1, 8) }));
  };

  const toggleMedication = (id: number) => {
    setUser(prev => ({
      ...prev,
      medications: prev.medications.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addExpense = (newExpense: Omit<Expense, 'id' | 'date'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const toggleChecklistItem = (phaseId: string, itemId: string) => {
    setChecklist(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          items: phase.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return phase;
    }));
  };

  const t = (key: keyof typeof translations['en']) => {
    return getTranslation(user.language, key);
  };

  const setLanguage = (lang: Language) => {
    setUser(prev => ({ ...prev, language: lang }));
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      addWater, toggleMedication, 
      theme, toggleTheme, 
      expenses, addExpense, deleteExpense,
      checklist, toggleChecklistItem,
      t, setLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};