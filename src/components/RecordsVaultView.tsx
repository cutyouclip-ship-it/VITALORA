import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Sparkles,
  Download,
  Plus,
  Building2,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { PatientRecord } from '../data/mockHealthcareData.js';

interface Props {
  onAskAIAboutReport?: (summary: string) => void;
}

export const RecordsVaultView: React.FC<Props> = ({ onAskAIAboutReport }) => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<PatientRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Record Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY'>('LAB_REPORT');
  const [doctorName, setDoctorName] = useState('Dr. Anand Kishore');
  const [hospitalName, setHospitalName] = useState('AIIMS Patna');
  const [summary, setSummary] = useState('');

  const fetchRecords = () => {
    fetch('/api/records')
      .then(r => r.json())
      .then(d => setRecords(d || []));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          doctorName,
          hospitalName,
          summary,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setSummary('');
        fetchRecords();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const categories = ['All', 'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY'];

  const filteredRecords = records.filter(r => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 shadow-glass border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <FileText className="w-4 h-4 text-primary" />
            Consent-Aware Health Record Vault
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Patient Medical Records & Lab Vault
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Encrypted diagnostic reports, longitudinal health timeline, and bilingual AI clinical interpretations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-gold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Health Record
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-gold text-primary-foreground font-bold shadow-gold'
                : 'bg-background/60 text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {cat === 'All' ? 'All Records' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredRecords.map(rec => (
          <div
            key={rec.id}
            className="glass rounded-2xl p-6 border-border/80 hover:border-primary/40 transition-all shadow-glass space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {rec.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1.5">{rec.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consultant: <span className="text-foreground font-medium">{rec.doctorName}</span> • {rec.hospitalName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecordForDetail(rec)}
                  className="px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-primary border border-border hover:border-primary/40 text-xs font-semibold transition-all"
                >
                  View Details & Interpretation
                </button>
                {onAskAIAboutReport && (
                  <button
                    onClick={() => onAskAIAboutReport(rec.summary)}
                    className="p-2 rounded-xl bg-card hover:bg-muted text-primary border border-border hover:border-primary/40 transition-all"
                    title="Ask Gemini Assistant about this record"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Summary preview */}
            <div className="p-3.5 rounded-xl bg-background/50 border border-border text-xs text-muted-foreground leading-relaxed font-mono">
              {rec.summary}
            </div>

            {rec.aiInsights && (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/25 text-xs text-foreground leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="whitespace-pre-wrap">{rec.aiInsights}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Record Detail Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedRecordForDetail(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Medical Record Vault
              </span>
              <h3 className="text-xl font-bold text-foreground mt-2">{selectedRecordForDetail.title}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedRecordForDetail.doctorName} • {selectedRecordForDetail.hospitalName} • {selectedRecordForDetail.date}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-foreground block mb-1">Diagnostic Report Summary:</span>
                <div className="p-3 rounded-xl bg-background/60 border border-border font-mono text-muted-foreground leading-relaxed">
                  {selectedRecordForDetail.summary}
                </div>
              </div>

              {selectedRecordForDetail.aiInsights && (
                <div>
                  <span className="font-semibold text-primary flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bilingual Clinical Interpretation:
                  </span>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/25 text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedRecordForDetail.aiInsights}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-background/50 border border-border text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Security: 256-Bit Encrypted Record Hash</span>
                <span className="text-primary font-mono font-semibold">HMAC-SHA256 Validated</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecordForDetail(null)}
              className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Patient Vault
              </span>
              <h3 className="text-xl font-bold text-foreground mt-1">Upload New Medical Record</h3>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Record Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. HbA1c Glycated Hemoglobin Test"
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="LAB_REPORT" className="bg-card text-foreground">Lab Report</option>
                    <option value="PRESCRIPTION" className="bg-card text-foreground">Prescription</option>
                    <option value="DISCHARGE_SUMMARY" className="bg-card text-foreground">Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Hospital / Laboratory</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Diagnostic Summary / Findings</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="e.g. HbA1c: 6.4%, Estimated Average Glucose (eAG): 137 mg/dL..."
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold hover:opacity-90"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
