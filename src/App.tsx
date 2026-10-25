import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { AuthScreen } from './components/AuthScreen.js';
import { HomeScreen } from './components/HomeScreen.js';
import { GeminiAssistantView } from './components/GeminiAssistantView.js';
import { BloodBandBiharView } from './components/BloodBandBiharView.js';
import { Anatomy3DExplorer } from './components/Anatomy3DExplorer.js';
import { HospitalsDoctorsView } from './components/HospitalsDoctorsView.js';
import { PharmacyView } from './components/PharmacyView.js';
import { InsuranceView } from './components/InsuranceView.js';
import { RecordsVaultView } from './components/RecordsVaultView.js';
import { AuditAdminView } from './components/AuditAdminView.js';
import { EmergencyTriageModal } from './components/EmergencyTriageModal.js';
import { ActiveTab, UserSession } from './types.js';
import { UserRole, TriageResult } from './utils/healthcareLogic.js';
import { PhoneCall } from 'lucide-react';

export default function App() {
  // Check for ?autostart=1 in URL
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      return 'home';
    }
    return 'auth'; // Login screen first as specified in design
  });

  const [userSession, setUserSession] = useState<UserSession>({
    id: 'usr-pat-01',
    name: 'Rameshwar Kumar Singh',
    email: 'rameshwar.singh@vitalora.health',
    role: 'PATIENT',
    phone: '+91-9876543210',
    district: 'Patna',
    bloodGroup: 'O+',
    ayushmanCardNo: 'AB-PMJAY-BR-8921-4402',
  });

  const [triageModalOpen, setTriageModalOpen] = useState<boolean>(false);
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');

  const handleRoleChange = (role: UserRole) => {
    setUserSession(prev => ({ ...prev, role }));
  };

  const handleSuccessAuth = (role: UserRole, userName: string) => {
    setUserSession(prev => ({
      ...prev,
      role,
      name: userName || prev.name,
    }));
    setActiveTab('home');
  };

  const handleAskGeminiAboutOrgan = (organName: string) => {
    setAssistantPrompt(
      `Please provide a comprehensive clinical overview of ${organName}, including physiological function, common symptoms of dysfunction, preventive lifestyle measures, and diagnostic workup.`
    );
    setActiveTab('assistant');
  };

  const handleAskDoctorAI = (doctorName: string, specialty: string) => {
    setAssistantPrompt(
      `Tell me more about ${doctorName} specializing in ${specialty}. What are common conditions treated and what questions should I prepare for my OPD visit?`
    );
    setActiveTab('assistant');
  };

  const handleAskMedicineAI = (medicineName: string) => {
    setAssistantPrompt(
      `Please explain the indications, contraindications, typical dosage schedule, and dietary precautions for ${medicineName}.`
    );
    setActiveTab('assistant');
  };

  const handleAskAIAboutReport = (summary: string) => {
    setAssistantPrompt(
      `Can you explain this diagnostic report in plain language with both English and Hindi insights?\n\n"${summary}"`
    );
    setActiveTab('assistant');
  };

  const handleConsultAssistantWithVitals = (symptoms: string[], triage: TriageResult) => {
    const symStr = symptoms.join(', ');
    setAssistantPrompt(
      `I just performed a clinical triage assessment. The triage level was evaluated as ${triage.level}. Reported symptoms: [${symStr}]. Clinical flags: [${triage.reasons.join(
        '; '
      )}]. What are the immediate clinical guidance and next steps I should take?`
    );
    setActiveTab('assistant');
  };

  // If on AuthScreen, render full-screen cinematic login/signup
  if (activeTab === 'auth') {
    return (
      <AuthScreen
        onSuccessAuth={handleSuccessAuth}
        onExplorePreview={() => setActiveTab('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans bg-ambient selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          setAssistantPrompt('');
        }}
        userSession={userSession}
        onRoleChange={handleRoleChange}
        onOpenTriageModal={() => setTriageModalOpen(true)}
        onLogoutToAuth={() => setActiveTab('auth')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToTab={tab => setActiveTab(tab)}
            onSearchQuerySelect={q => {
              setAssistantPrompt(q);
              setActiveTab('assistant');
            }}
            onAskGeminiAboutOrgan={handleAskGeminiAboutOrgan}
          />
        )}

        {activeTab === 'assistant' && (
          <GeminiAssistantView
            onNavigateToTab={tab => setActiveTab(tab)}
            initialPrompt={assistantPrompt}
          />
        )}

        {activeTab === 'blood-band' && (
          <BloodBandBiharView
            userRole={userSession.role}
            onRequestBloodFromAssistant={bg => {
              setActiveTab('blood-band');
            }}
          />
        )}

        {activeTab === 'anatomy' && (
          <Anatomy3DExplorer
            onAskGeminiAboutOrgan={handleAskGeminiAboutOrgan}
            onBookSpecialist={() => setActiveTab('doctors')}
          />
        )}

        {activeTab === 'doctors' && (
          <HospitalsDoctorsView onAskDoctorAI={handleAskDoctorAI} />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyView onAskMedicineAI={handleAskMedicineAI} />
        )}

        {activeTab === 'insurance' && <InsuranceView />}

        {activeTab === 'records' && (
          <RecordsVaultView onAskAIAboutReport={handleAskAIAboutReport} />
        )}

        {activeTab === 'audit' && (
          <AuditAdminView
            currentRole={userSession.role}
            onRoleChange={handleRoleChange}
          />
        )}
      </main>

      {/* Emergency Triage Modal */}
      <EmergencyTriageModal
        isOpen={triageModalOpen}
        onClose={() => setTriageModalOpen(false)}
        onNavigateToBloodBand={() => setActiveTab('blood-band')}
        onConsultAssistantWithVitals={handleConsultAssistantWithVitals}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card/60 py-10 px-4 text-xs text-muted-foreground backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gold shadow-gold">
              <span className="h-3 w-3 rounded-full bg-background" />
            </span>
            <div>
              <div className="font-bold text-foreground">vitalora healthcare node</div>
              <div className="text-[11px] text-muted-foreground">
                AI Health Infrastructure • Bihar Swasthya Nodal Integration
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-primary" />
              <span>National Ambulance: <strong className="text-foreground">108</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-accent" />
              <span>Bihar Health Helpline: <strong className="text-foreground">104</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-destructive" />
              <span>Police / Emergency: <strong className="text-foreground">112</strong></span>
            </span>
          </div>

          <div className="text-[11px] text-muted-foreground text-center md:text-right max-w-sm">
            Clinical guidance provided by Vitalora is for health education and triage support. In life-threatening emergencies, immediately contact emergency services (108/112).
          </div>
        </div>
      </footer>
    </div>
  );
}
