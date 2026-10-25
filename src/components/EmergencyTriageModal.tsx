import React, { useState } from 'react';
import {
  AlertTriangle,
  Activity,
  PhoneCall,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { computeTriageLevel, TriageResult } from '../utils/healthcareLogic.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBloodBand: () => void;
  onConsultAssistantWithVitals: (symptoms: string[], triage: TriageResult) => void;
}

export const EmergencyTriageModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateToBloodBand,
  onConsultAssistantWithVitals,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [heartRate, setHeartRate] = useState<string>('76');
  const [systolicBp, setSystolicBp] = useState<string>('120');
  const [spO2, setSpO2] = useState<string>('98');
  const [temperatureF, setTemperatureF] = useState<string>('98.6');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  if (!isOpen) return null;

  const symptomOptions = [
    'Chest Pain / Heaviness',
    'Shortness of breath / Dyspnea',
    'Sudden facial weakness or slurred speech',
    'High fever (>102°F)',
    'Persistent vomiting',
    'Severe abdominal pain',
    'Mild headache',
    'Cough / Cold',
    'Joint pain',
    'Skin rash',
  ];

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = computeTriageLevel(selectedSymptoms, {
      heartRate: parseInt(heartRate, 10) || undefined,
      systolicBp: parseInt(systolicBp, 10) || undefined,
      spO2: parseInt(spO2, 10) || undefined,
      temperatureF: parseFloat(temperatureF) || undefined,
    });
    setTriageResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
        >
          ×
        </button>

        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            Clinical Triage & Rapid Assessment
          </div>
          <h3 className="text-xl font-bold text-foreground mt-1">Symptom & Vital Signs Triage</h3>
          <p className="text-xs text-muted-foreground">
            Automated clinical rules engine flagging acute red-flags and directing appropriate level of medical care.
          </p>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
          {/* Symptoms Checklist */}
          <div>
            <label className="text-foreground font-semibold block mb-2">
              Select Current Symptoms:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {symptomOptions.map(sym => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`p-2 rounded-xl text-left text-xs transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/20 text-foreground border-primary/60 font-semibold shadow-sm'
                        : 'bg-background/60 text-muted-foreground border-border hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <span>{sym}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vitals Grid */}
          <div>
            <label className="text-foreground font-semibold block mb-2">
              Objective Vital Signs (if measured):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[11px] text-muted-foreground">Heart Rate (bpm)</span>
                <input
                  type="number"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-background/60 border border-input text-foreground font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground">Systolic BP (mmHg)</span>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={e => setSystolicBp(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-background/60 border border-input text-foreground font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground">SpO2 Saturation (%)</span>
                <input
                  type="number"
                  value={spO2}
                  onChange={e => setSpO2(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-background/60 border border-input text-foreground font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground">Temperature (°F)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temperatureF}
                  onChange={e => setTemperatureF(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-background/60 border border-input text-foreground font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold hover:opacity-90 transition-opacity"
          >
            Run Clinical Triage Evaluation
          </button>
        </form>

        {/* Triage Output Card */}
        {triageResult && (
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              triageResult.level === 'EMERGENCY'
                ? 'bg-destructive/15 border-destructive/40 text-foreground'
                : triageResult.level === 'URGENT'
                ? 'bg-amber-500/15 border-amber-500/40 text-foreground'
                : 'bg-primary/10 border-primary/30 text-foreground'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Triage Result: {triageResult.level}
              </span>
              {triageResult.isRedFlag && (
                <span className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground font-black text-[10px] animate-pulse">
                  RED FLAG
                </span>
              )}
            </div>

            <div className="text-xs font-semibold leading-relaxed">
              {triageResult.recommendedAction}
            </div>

            {triageResult.reasons.length > 0 && (
              <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                {triageResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}

            {triageResult.level === 'EMERGENCY' && (
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href="tel:108"
                  className="py-2 px-3 rounded-lg bg-destructive text-destructive-foreground font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call 108 Emergency Ambulance
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToBloodBand();
                  }}
                  className="py-2 px-3 rounded-lg bg-card text-foreground border border-border font-semibold text-xs hover:bg-muted"
                >
                  Find Emergency Blood
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onConsultAssistantWithVitals(selectedSymptoms, triageResult);
              }}
              className="w-full py-2 px-3 rounded-lg bg-gold text-primary-foreground text-xs font-bold shadow-gold hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              Transfer Triage Data to Gemini AI Assistant <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
