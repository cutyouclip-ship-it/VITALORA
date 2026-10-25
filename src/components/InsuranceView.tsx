import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  IndianRupee,
} from 'lucide-react';
import { InsurancePolicy } from '../data/mockHealthcareData.js';

interface ClaimItem {
  id: string;
  claimNumber: string;
  policyName: string;
  patientName: string;
  hospitalName: string;
  claimedAmountInr: number;
  approvedAmountInr?: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENT_VERIFIED' | 'APPROVED' | 'SETTLED' | 'REJECTED';
  diagnosis: string;
  createdAt: string;
}

export const InsuranceView: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [activeTab, setActiveTab] = useState<'policies' | 'claims'>('policies');
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);

  // New Claim Form
  const [policyId, setPolicyId] = useState('vital-shield-plus');
  const [patientName, setPatientName] = useState('Rameshwar Kumar Singh');
  const [hospitalName, setHospitalName] = useState('AIIMS Patna');
  const [claimedAmount, setClaimedAmount] = useState('32000');
  const [diagnosis, setDiagnosis] = useState('Cardiovascular Workup & Stress Thallium Test');
  const [claimSubmittedMsg, setClaimSubmittedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/insurance/policies')
      .then(r => r.json())
      .then(d => setPolicies(d || []));

    fetch('/api/insurance/claims')
      .then(r => r.json())
      .then(d => setClaims(d || []));
  }, []);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/insurance/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId,
          patientName,
          hospitalName,
          claimedAmountInr: claimedAmount,
          diagnosis,
        }),
      });
      const data = await res.json();
      if (res.ok && data.claim) {
        setClaims(prev => [data.claim, ...prev]);
        setClaimSubmittedMsg(`Claim #${data.claim.claimNumber} registered with cashless Third-Party Administrator (TPA).`);
        setTimeout(() => {
          setShowClaimModal(false);
          setClaimSubmittedMsg(null);
          setActiveTab('claims');
        }, 1500);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusBadge = (status: ClaimItem['status']) => {
    switch (status) {
      case 'SETTLED':
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-bold">Approved / Settled</span>;
      case 'DOCUMENT_VERIFIED':
        return <span className="px-2.5 py-0.5 rounded-full bg-card text-primary border border-border text-[11px] font-bold">Docs Verified</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">Under Review</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-card text-muted-foreground text-[11px] font-medium border border-border">Submitted</span>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass rounded-2xl p-6 shadow-glass border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Healthcare Finance & Ayushman Network
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Health Insurance & Cashless Claims
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Ayushman Bharat PM-JAY scheme, private corporate health shields, and transparent TPA cashless claim tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-background/50 p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'policies'
                  ? 'bg-gold text-primary-foreground shadow-gold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Policies ({policies.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'claims'
                  ? 'bg-gold text-primary-foreground shadow-gold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Claims Tracking ({claims.length})
            </button>
          </div>

          <button
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-gold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            File Cashless Claim
          </button>
        </div>
      </div>

      {/* Policies View */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policies.map(pol => (
            <div
              key={pol.id}
              className={`glass rounded-2xl p-6 border flex flex-col justify-between shadow-glass space-y-4 ${
                pol.isGovtAffiliated
                  ? 'border-primary/40 bg-card/60'
                  : 'border-border/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      pol.isGovtAffiliated
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-card text-muted-foreground border border-border'
                    }`}
                  >
                    {pol.isGovtAffiliated ? 'Government Universal Scheme' : 'Private Health Partner'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {pol.cashlessHospitalsCount}+ Hospitals
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mt-3">{pol.name}</h3>
                <div className="text-xs text-primary font-medium mt-0.5">{pol.provider}</div>

                <div className="mt-4 p-3 rounded-xl bg-background/50 border border-border flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Total Sum Insured</div>
                    <div className="text-base font-extrabold text-foreground mt-0.5 flex items-center">
                      <IndianRupee className="w-4 h-4 inline mr-0.5 text-primary" />
                      {(pol.coverageAmountInr / 100000).toFixed(1)} Lakhs
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">Estimated Premium</div>
                    <div className="text-sm font-bold text-primary mt-0.5">
                      {pol.annualPremiumEstimateInr === 0 ? 'FREE (100% Govt Subsidy)' : `₹${pol.annualPremiumEstimateInr}/yr`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Key Entitlements:
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {pol.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60">
                <button
                  onClick={() => {
                    setPolicyId(pol.id);
                    setShowClaimModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  File Claim Against Policy <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claims Tracking View */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.map(claim => (
            <div
              key={claim.id}
              className="glass rounded-2xl p-6 border-border/80 shadow-glass space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{claim.claimNumber}</h3>
                    {getStatusBadge(claim.status)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {claim.policyName} • {claim.hospitalName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Claim Amount:</div>
                  <div className="text-lg font-black text-primary flex items-center justify-end">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-primary" />
                    {claim.claimedAmountInr}
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                {['Submitted', 'Under Review', 'Verified', 'Settled'].map((step, idx) => {
                  const isCompleted =
                    (claim.status === 'SETTLED' && idx <= 3) ||
                    (claim.status === 'APPROVED' && idx <= 3) ||
                    (claim.status === 'DOCUMENT_VERIFIED' && idx <= 2) ||
                    (claim.status === 'UNDER_REVIEW' && idx <= 1) ||
                    (claim.status === 'SUBMITTED' && idx === 0);

                  return (
                    <div key={step} className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isCompleted ? 'bg-gold shadow-gold' : 'bg-background/60 border border-border'
                        }`}
                      />
                      <span className={`text-[11px] font-medium ${isCompleted ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-background/50 border border-border text-xs text-foreground">
                <span className="font-semibold text-muted-foreground">Clinical Diagnosis: </span>
                {claim.diagnosis}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Submission Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                TPA Cashless Pre-Authorization
              </span>
              <h3 className="text-xl font-bold text-foreground mt-1">Submit Hospital Claim</h3>
              <p className="text-xs text-muted-foreground">Initiate cashless claim reimbursement with verified documentation.</p>
            </div>

            {claimSubmittedMsg ? (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs text-center font-medium">
                {claimSubmittedMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitClaim} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Select Policy</label>
                  <select
                    value={policyId}
                    onChange={e => setPolicyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-medium focus:outline-none focus:border-primary"
                  >
                    {policies.map(p => (
                      <option key={p.id} value={p.id} className="bg-card text-foreground">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Admitted Hospital</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={e => setHospitalName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Claim Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={claimedAmount}
                      onChange={e => setClaimedAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Clinical Diagnosis & Procedures</label>
                  <textarea
                    rows={2}
                    required
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="p-3 rounded-xl bg-background/50 border border-border text-[11px] text-muted-foreground">
                  Attached Documents: Hospital Admission Slip, Preliminary Bill, Doctor Referral.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold hover:opacity-90"
                  >
                    Transmit Claim to TPA
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
