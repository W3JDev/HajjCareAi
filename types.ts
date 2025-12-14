import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'bn' | 'ms' | 'id' | 'ur' | 'tr';

export interface Medication {
  id: number;
  name: string;
  time: string;
  taken: boolean;
}

export interface Document {
  id: string;
  type: 'passport' | 'visa' | 'medical' | 'other';
  name: string;
  date: string;
  expiry?: string;
  summary?: string;
  url?: string;
}

export interface Contact {
  relation: string;
  name: string;
  number: string;
}

export interface UserProfile {
  name: string;
  language: Language; // Added language preference
  bloodType: string;
  conditions: string[];
  medications: Medication[];
  waterIntake: number;
  energyLevel: string;
  hotelName: string;
  hotelNameArabic: string;
  emergencyContact: string;
  groupNumber: string;
  documents: Document[];
  contacts: Contact[];
}

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface Phrase {
  bn: string;
  ar: string;
  ar_phonetic: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistPhase {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}