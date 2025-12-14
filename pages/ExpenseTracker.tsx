import React, { useState } from 'react';
import { useApp, Expense } from '../context/AppContext';
import { Wallet, Plus, Trash2, TrendingUp, ShoppingBag, Coffee, Car, Heart, MoreHorizontal, ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExpenseTracker() {
  const { expenses, addExpense, deleteExpense } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BDT' | 'SAR'>('SAR');
  const [category, setCategory] = useState<Expense['category']>('food');
  const [note, setNote] = useState('');

  const categories = [
    { id: 'food', label: 'খাবার', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
    { id: 'transport', label: 'যাতায়াত', icon: Car, color: 'bg-blue-100 text-blue-600' },
    { id: 'shopping', label: 'কেনাকাটা', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
    { id: 'donation', label: 'দান', icon: Heart, color: 'bg-green-100 text-green-600' },
    { id: 'other', label: 'অন্যান্য', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    addExpense({
      amount: parseFloat(amount),
      currency,
      category,
      note
    });

    // Reset
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  // Calculate Totals
  const totalSAR = expenses.filter(e => e.currency === 'SAR').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBDT = expenses.filter(e => e.currency === 'BDT').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-dark dark:text-white font-bengali">খরচের হিসাব</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl text-white shadow-lg shadow-green-200 dark:shadow-green-900/20">
          <p className="text-green-100 text-sm font-medium mb-1 font-bengali">মোট খরচ (রিয়াল)</p>
          <h3 className="text-3xl font-bold font-mono">{totalSAR.toFixed(0)} <span className="text-sm font-normal">SAR</span></h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl text-dark dark:text-white shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 font-bengali">মোট খরচ (টাকা)</p>
          <h3 className="text-3xl font-bold font-mono">{totalBDT.toFixed(0)} <span className="text-sm font-normal">৳</span></h3>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 font-bengali">আজকের খরচ</h3>
        <button className="text-primary text-sm font-bold flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
          <FileText size={14} /> রিপোর্ট
        </button>
      </div>

      {/* List */}
      <div className="space-y-3 mb-20">
        {expenses.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <Wallet size={48} className="mx-auto mb-2 text-gray-400"/>
                <p className="font-bengali">কোনো খরচ নেই</p>
            </div>
        ) : (
            expenses.map(expense => {
                const cat = categories.find(c => c.id === expense.category) || categories[4];
                return (
                    <div key={expense.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${cat.color} bg-opacity-20`}>
                                <cat.icon size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-dark dark:text-white font-bengali">{cat.label}</p>
                                {expense.note && <p className="text-xs text-gray-400 font-bengali">{expense.note}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-lg text-dark dark:text-gray-200">
                                {expense.amount} <span className="text-xs text-gray-400">{expense.currency}</span>
                            </span>
                            <button 
                                onClick={() => deleteExpense(expense.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-dark dark:bg-white text-white dark:text-dark px-6 py-3 rounded-full shadow-xl font-bold font-bengali flex items-center gap-2 active:scale-95 transition z-30"
      >
        <Plus size={20} /> নতুন খরচ
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up relative">
             <h3 className="text-xl font-bold mb-6 text-center font-bengali text-dark dark:text-white">খরচ যুক্ত করুন</h3>
             
             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-bengali">পরিমাণ</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            autoFocus
                            className="flex-1 text-3xl font-bold p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none border-2 border-transparent focus:border-primary text-dark dark:text-white"
                        />
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            <button type="button" onClick={() => setCurrency('SAR')} className={`px-4 rounded-lg font-bold transition ${currency === 'SAR' ? 'bg-white dark:bg-gray-600 shadow-sm text-dark dark:text-white' : 'text-gray-400'}`}>SAR</button>
                            <button type="button" onClick={() => setCurrency('BDT')} className={`px-4 rounded-lg font-bold transition ${currency === 'BDT' ? 'bg-white dark:bg-gray-600 shadow-sm text-dark dark:text-white' : 'text-gray-400'}`}>৳</button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-bengali">ধরণ</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setCategory(c.id as any)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] border-2 transition ${category === c.id ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                            >
                                <c.icon size={24} className={`mb-1 ${category === c.id ? 'text-primary' : 'text-gray-400'}`} />
                                <span className={`text-xs font-bengali ${category === c.id ? 'font-bold text-primary' : 'text-gray-500'}`}>{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-bengali">বিবরণ (ঐচ্ছিক)</label>
                    <input 
                        type="text" 
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="কিসের জন্য খরচ?"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none font-bengali text-dark dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)} className="py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold font-bengali">বাতিল</button>
                    <button type="submit" disabled={!amount} className="py-3 rounded-xl bg-primary text-white font-bold font-bengali disabled:opacity-50">সংরক্ষণ</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}