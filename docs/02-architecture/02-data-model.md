# Data Model

## 1. User Profile (`UserProfile`)
Stored in `localStorage` key: `hajjcare_user`

```typescript
interface UserProfile {
  name: string;
  language: 'en' | 'bn' | 'ms' | 'id' | 'ur' | 'tr';
  bloodType: string;
  conditions: string[]; // e.g. ["Diabetes"]
  medications: Medication[];
  waterIntake: number; // 0-8
  energyLevel: string;
  hotelName: string;
  hotelNameArabic: string; // Pre-translated for SOS
  emergencyContact: string;
  groupNumber: string;
  documents: Document[]; // OCR extracted data
  contacts: Contact[]; // Family members
}
```

## 2. Expenses (`Expense`)
Stored in `localStorage` key: `hajjcare_expenses`

```typescript
interface Expense {
  id: string;
  amount: number;
  currency: 'BDT' | 'SAR';
  category: 'food' | 'transport' | 'shopping' | 'donation' | 'other';
  note: string;
  date: string; // ISO 8601
}
```

## 3. Checklist (`ChecklistPhase`)
Stored in `localStorage` key: `hajjcare_checklist`

```typescript
interface ChecklistPhase {
  id: string; // e.g., "makkah"
  title: string;
  icon: string;
  items: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}
```
