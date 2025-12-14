import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Upload, FileText, Trash2, Edit2, Check, User, Phone, Building, Loader2, Sparkles, Calendar, CreditCard, PhoneCall, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { extractDocumentInfo } from '../services/geminiService';
import { Language } from '../types';
import { LANGUAGE_NAMES } from '../utils/translations';

export default function Profile() {
  const { user, setUser, t, setLanguage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  // Document Upload State
  const [uploadType, setUploadType] = useState('passport');

  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setIsProcessingDoc(true);
        
        // Extract info using AI
        const extractedInfo = await extractDocumentInfo(file, user.language);
        
        const newDoc: any = {
            id: Date.now().toString(),
            type: extractedInfo.type === 'other' ? uploadType : extractedInfo.type,
            name: extractedInfo.name && extractedInfo.name !== 'Unknown' ? extractedInfo.name : file.name,
            date: new Date().toLocaleDateString(),
            expiry: extractedInfo.expiry,
            summary: extractedInfo.summary
        };
        
        const updatedDocs = [...(user.documents || []), newDoc];
        const updatedUser = { ...user, documents: updatedDocs };
        setUser(updatedUser);
        setFormData(updatedUser); // sync form
        setIsProcessingDoc(false);
    }
  };

  const removeDocument = (id: string) => {
      const updatedDocs = user.documents.filter(d => d.id !== id);
      const updatedUser = { ...user, documents: updatedDocs };
      setUser(updatedUser);
      setFormData(updatedUser);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-dark dark:text-white font-bengali">{t('profile_title')}</h2>
        <button 
           onClick={() => isEditing ? handleSave() : setIsEditing(true)}
           className={`ml-auto px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 ${isEditing ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
            {isEditing ? <><Check size={14}/> {t('save')}</> : <><Edit2 size={14}/> {t('edit')}</>}
        </button>
      </div>

      {/* ID Card Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 relative">
          <div className="h-24 bg-[#2C3E50]"></div>
          <div className="px-6 pb-6 mt-[-40px] text-center">
              <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto mb-3 shadow-md">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jahanara" alt="User" className="w-full h-full rounded-full bg-gray-100" />
              </div>
              
              {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="text-center font-bold text-xl border rounded p-1 w-full dark:bg-gray-700 dark:text-white"
                  />
              ) : (
                  <h2 className="text-2xl font-bold font-bengali text-dark dark:text-white">{user.name}</h2>
              )}
              
              <p className="text-gray-500 dark:text-gray-400 text-sm font-bengali">Group: {user.groupNumber}</p>
          </div>
      </div>

      {/* Language Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
         <div className="flex items-center gap-3 mb-2 text-indigo-600">
             <Globe size={20} />
             <span className="font-bold font-bengali">{t('language_select')}</span>
         </div>
         <select 
            value={user.language} 
            onChange={handleLanguageChange}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none"
         >
             {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                 <option key={code} value={code}>{name}</option>
             ))}
         </select>
      </div>

      {/* Details Section */}
      <div className="space-y-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3 mb-2 text-primary">
                 <Building size={20} />
                 <span className="font-bold font-bengali">{t('hotel_info')}</span>
             </div>
             {isEditing ? (
                 <div className="space-y-2">
                     <input 
                        value={formData.hotelName} 
                        onChange={e => setFormData({...formData, hotelName: e.target.value})}
                        className="w-full p-2 border rounded font-bengali dark:bg-gray-700 dark:text-white"
                        placeholder="Hotel Name"
                     />
                     <input 
                        value={formData.hotelNameArabic} 
                        onChange={e => setFormData({...formData, hotelNameArabic: e.target.value})}
                        className="w-full p-2 border rounded font-arabic dark:bg-gray-700 dark:text-white"
                        placeholder="Arabic Name"
                     />
                 </div>
             ) : (
                 <>
                    <p className="font-bold text-dark dark:text-white font-bengali">{user.hotelName}</p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-arabic">{user.hotelNameArabic}</p>
                 </>
             )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3 mb-2 text-red-500">
                 <Phone size={20} />
                 <span className="font-bold font-bengali">{t('emergency_contact')}</span>
             </div>
             {isEditing ? (
                 <input 
                    value={formData.emergencyContact} 
                    onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                    className="w-full p-2 border rounded font-bengali dark:bg-gray-700 dark:text-white"
                 />
             ) : (
                 <p className="font-bold text-xl text-dark dark:text-white">{user.emergencyContact}</p>
             )}
          </div>

          {/* Contacts List */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3 mb-2 text-green-600">
                 <PhoneCall size={20} />
                 <span className="font-bold font-bengali">{t('family_contacts')}</span>
             </div>
             <div className="space-y-2">
                 {user.contacts?.map((contact, idx) => (
                     <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                         <span className="capitalize text-gray-600 dark:text-gray-300 font-medium">{contact.relation}</span>
                         <a href={`https://wa.me/${contact.number}`} target="_blank" rel="noreferrer" className="font-mono text-green-600 dark:text-green-400 hover:underline">
                             {contact.number}
                         </a>
                     </div>
                 ))}
             </div>
          </div>
      </div>

      {/* Document Upload Section */}
      <div className="mb-20">
          <h3 className="font-bold text-lg text-dark dark:text-white mb-4 font-bengali flex items-center gap-2">
              <FileText size={20}/> {t('documents')}
          </h3>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-bengali text-center">
                  {t('upload_hint')}
              </p>
              
              <div className="flex gap-2 mb-3 justify-center">
                  {isProcessingDoc ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg">
                          <Loader2 className="animate-spin" size={18}/>
                          <span className="font-bengali font-bold text-sm">{t('doc_processing')}</span>
                      </div>
                  ) : (
                    <>
                      <select 
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        className="p-2 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white border-none outline-none"
                      >
                          <option value="passport">Passport</option>
                          <option value="visa">Visa</option>
                          <option value="medical">Medical</option>
                      </select>
                      
                      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition active:scale-95">
                          <Upload size={16} /> {t('upload_doc')}
                          <input type="file" className="hidden" accept="image/*" onChange={handleDocumentUpload} />
                      </label>
                    </>
                  )}
              </div>
          </div>

          <div className="space-y-3">
              {user.documents && user.documents.map((doc) => (
                  <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:shadow-md">
                      <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                              <div className={`p-3 rounded-xl mt-1 ${
                                  doc.type === 'passport' ? 'bg-purple-100 text-purple-600' :
                                  doc.type === 'visa' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                  {doc.type === 'passport' ? <User size={20}/> : doc.type === 'visa' ? <CreditCard size={20}/> : <FileText size={20}/>}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2">
                                     <p className="font-bold text-dark dark:text-white capitalize text-lg">{doc.type}</p>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 dark:text-gray-300 font-bengali font-medium">{doc.name}</p>
                                  
                                  {doc.expiry && (
                                      <div className="flex items-center gap-1 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded mt-1 w-fit">
                                          <Calendar size={12} />
                                          <span>Exp: {doc.expiry}</span>
                                      </div>
                                  )}
                                  
                                  {doc.summary && (
                                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 flex gap-2 items-start">
                                          <Sparkles size={12} className="text-amber-500 mt-0.5 flex-shrink-0"/>
                                          <p className="text-xs text-amber-700 dark:text-amber-300 font-bengali leading-relaxed">{doc.summary}</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                          <button 
                            onClick={() => removeDocument(doc.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
              ))}
              {(!user.documents || user.documents.length === 0) && (
                  <div className="text-center py-8 opacity-50">
                      <FileText size={48} className="mx-auto mb-2 text-gray-300"/>
                      <p className="text-sm font-bengali">No Documents</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}