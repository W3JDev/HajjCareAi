# Product Requirements Document (PRD)

**Project:** HajjCare  
**Version:** 1.2  
**Status:** In Development

## 1. Objectives
To reduce pilgrim anxiety and health incidents by 40% through accessible AI assistance.

## 2. User Personas
**User A: Jahanara Begum (65)**
- **Language:** Bengali only.
- **Tech Literacy:** Low. Can use WhatsApp video calls.
- **Health:** Diabetic, Hypertension.
- **Goal:** Perform Hajj correctly without getting lost or sick.

## 3. Functional Requirements

### 3.1 Core AI Features
- **Translator:** 
  - Voice-to-Voice translation (Input Language -> Arabic).
  - Visual Translation (OCR + Context) for menus/signs.
- **Live Assistant:**
  - Must support "Interruptibility" (User can speak over AI).
  - Must maintain "Family Persona" (Address user as Aunt/Uncle).
  - Capabilities: Call family (WhatsApp deep link), Check Documents.

### 3.2 Health & Safety
- **SOS Mode:** 
  - 5-second countdown to prevent accidental triggers.
  - Display Medical ID (Blood type, Conditions) in English & Arabic.
- **Tracker:**
  - Water log (Goal: 8 glasses).
  - Medication Checklist with time slots.

### 3.3 Navigation
- **Map Interface:** 
  - Large markers.
  - High-contrast mode.
- **Routing:** 
  - Walking directions only.
  - POI specific to Hajj (Jamarat, Tents).

## 4. Non-Functional Requirements
- **Accessibility:** WCAG 2.1 AA Compliant. High contrast text, large touch targets (48px+).
- **Performance:** App load time < 2 seconds on 4G.
- **Offline:** Core navigational data and checklists must work offline.
- **Privacy:** Health data stored in `localStorage` only. No PII sent to cloud logs.

## 5. Success Metrics
- **Activation:** % of users who complete the "Tutorial".
- **Retention:** Daily Active Users (DAU) during Hajj days.
- **Health:** Average water intake logged per user > 2L.
- **Reliability:** SOS false positive rate < 1%.
