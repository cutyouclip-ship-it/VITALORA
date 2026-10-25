import React, { useState } from 'react';
import {
  ArrowUpRight,
  Droplets,
  Siren,
  Pill,
  Stethoscope,
  Building2,
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  Languages,
  BookOpen,
  HeartPulse,
  Activity,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DnaHelix } from './DnaHelix.js';
import { Anatomy3DExplorer } from './Anatomy3DExplorer.js';
import { anatomyRecords, searchAnatomy } from '../lib/anatomy.js';
import { ActiveTab } from '../types.js';

interface Props {
  onNavigateToTab: (tab: ActiveTab) => void;
  onSearchQuerySelect: (query: string) => void;
  onAskGeminiAboutOrgan: (organName: string) => void;
}

const quick = [
  { tab: 'blood-band' as ActiveTab, title: 'Blood availability', meta: 'Bihar network', icon: Droplets },
  { tab: 'blood-band' as ActiveTab, title: 'Emergency', meta: 'Ambulance 108 & contacts', icon: Siren },
  { tab: 'pharmacy' as ActiveTab, title: 'Pharmacy', meta: 'Medicine catalogue', icon: Pill },
  { tab: 'doctors' as ActiveTab, title: 'Doctors', meta: 'OPD Appointments', icon: Stethoscope },
  { tab: 'doctors' as ActiveTab, title: 'Hospitals', meta: 'Beds & ICU facilities', icon: Building2 },
  { tab: 'records' as ActiveTab, title: 'Medical records', meta: 'Lab reports & vault', icon: FileText },
];

export const HomeScreen: React.FC<Props> = ({
  onNavigateToTab,
  onSearchQuerySelect,
  onAskGeminiAboutOrgan,
}) => {
  const [anatomySearch, setAnatomySearch] = useState('');
  const [anatomySystemFilter, setAnatomySystemFilter] = useState('All');
  const [selectedRecordId, setSelectedRecordId] = useState('heart');

  const systems = ['All', 'Cardiovascular', 'Respiratory', 'Nervous', 'Digestive', 'Skeletal', 'Muscular', 'Urinary'];
  const filteredRecords = searchAnatomy(anatomySearch, anatomySystemFilter);
  const activeRecord = anatomyRecords.find(r => r.id === selectedRecordId) || anatomyRecords[0];

  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1: DNA Hero & Quick Access */}
      <section className="relative -mt-6 grid min-h-[88dvh] items-center lg:grid-cols-2">
        {/* DNA Helix 3D Canvas Background */}
        <div className="pointer-events-none absolute inset-0 lg:left-1/3 opacity-80">
          <DnaHelix />
        </div>

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-xl space-y-6">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            AI Healthcare Universe
          </p>
          <h1 className="animate-rise text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl text-white">
            Care, decoded <span className="text-gold">down to the gene.</span>
          </h1>
          <p className="animate-rise text-muted-foreground text-sm sm:text-base leading-relaxed">
            Find blood, medicines, doctors and hospitals — and understand your body — from one calm place.
          </p>

          {/* Search bar input trigger */}
          <div
            onClick={() => onNavigateToTab('assistant')}
            className="glass animate-rise flex h-14 items-center gap-3 rounded-2xl px-5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-all border border-border shadow-glass hover:border-primary/50"
          >
            <Search className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Try &ldquo;O+ blood near Patna&rdquo; or &ldquo;bukhar ki dawa&rdquo;...</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-muted-foreground">Quick queries:</span>
            {['O- blood Patna', 'Lipid profile interpretation', 'AIIMS Cardiology'].map(q => (
              <button
                key={q}
                onClick={() => onSearchQuerySelect(q)}
                className="px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Quick Access</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live healthcare workflows and regional networks
            </p>
          </div>
          <span className="text-xs text-primary font-mono font-medium">Bihar Apex Nodes Connected</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((q, i) => (
            <div
              key={q.title}
              onClick={() => onNavigateToTab(q.tab)}
              style={{ animationDelay: `${i * 70}ms` }}
              className="glass animate-rise group flex items-center justify-between rounded-2xl p-6 transition-all hover:-translate-y-1 cursor-pointer border border-border hover:border-primary/40 shadow-glass"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
                  <q.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white group-hover:text-gold transition-colors">
                    {q.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{q.meta}</p>
                </div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Exploded / Interactive 3D Anatomy Experience */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Section 02 • 3D Biometrics
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white mt-1">
              Interactive Human Anatomy
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">WebGL 3D Engine • Rotatable</span>
        </div>

        <Anatomy3DExplorer
          onAskGeminiAboutOrgan={onAskGeminiAboutOrgan}
          onBookSpecialist={() => onNavigateToTab('doctors')}
        />
      </section>

      {/* SECTION 3: Explore and Learn (13 Educational Anatomy Records) */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Section 03 • Anatomical Knowledge Base
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white mt-1">
            Explore and Learn the Science of You
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Selectable educational records mapping location, physiological function, body systems, and warning signs across human organs.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <input
              type="text"
              value={anatomySearch}
              onChange={e => setAnatomySearch(e.target.value)}
              placeholder="Search organ or bone (e.g. Brain, Heart, Kidneys, Femur)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-input text-xs sm:text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            {systems.map(sys => (
              <button
                key={sys}
                onClick={() => setAnatomySystemFilter(sys)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  anatomySystemFilter === sys
                    ? 'bg-gold text-primary-foreground font-semibold shadow-gold'
                    : 'bg-muted/50 text-muted-foreground hover:text-white'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        {/* Split Grid: List of 13 Records + Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scrollable List (5 Cols) */}
          <div className="lg:col-span-5 space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredRecords.map(rec => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecordId(rec.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedRecordId === rec.id
                    ? 'glass border-primary/60 bg-muted/40 shadow-gold'
                    : 'bg-card/40 border-border hover:border-border/80 text-muted-foreground hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{rec.name}</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-primary">
                    {rec.system}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{rec.location}</p>
              </div>
            ))}
          </div>

          {/* Right: Comprehensive Selected Record Detail Card (7 Cols) */}
          <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 space-y-5 border border-border shadow-glass">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-primary font-mono">
                  {activeRecord.system} System
                </span>
                <h3 className="text-2xl font-bold text-white mt-3">{activeRecord.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Location: <span className="text-foreground">{activeRecord.location}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Physiological Function
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed bg-background/40 p-4 rounded-2xl border border-border/60">
                {activeRecord.function}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Common Associated Pathologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeRecord.conditions.map(c => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-xl bg-muted/60 text-xs text-foreground border border-border font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-1">
              <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                Emergency Safety & Warning Signs
              </div>
              <p className="text-xs text-destructive-foreground/90 leading-relaxed">
                {activeRecord.warning}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onAskGeminiAboutOrgan(activeRecord.name)}
                className="flex-1 py-3 px-4 rounded-xl bg-gold font-medium text-primary-foreground shadow-gold flex items-center justify-center gap-2 text-xs transition-transform active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                Ask Vitalora AI about {activeRecord.name}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Healthcare Universe (10 Organized Ways to Care) */}
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Section 04 • Services
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white mt-1">
            Healthcare Universe
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fifty ways to care, organized into verified clinical modules.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Emergency & ambulance', desc: 'Call 108/112 and urgent trauma center dispatch.', icon: Siren, tab: 'blood-band' as ActiveTab },
            { title: 'Bihar blood network', desc: 'Live inventory across AIIMS, PMCH, IGIMS.', icon: Droplets, tab: 'blood-band' as ActiveTab },
            { title: 'Hospitals & ICU beds', desc: 'Verified 24x7 trauma facilities directory.', icon: Building2, tab: 'doctors' as ActiveTab },
            { title: 'Doctors & appointments', desc: 'Book verified specialist OPD slots.', icon: Stethoscope, tab: 'doctors' as ActiveTab },
            { title: 'Pharmacy dispensary', desc: 'Prescriptions, cold-chain delivery & GST invoices.', icon: Pill, tab: 'pharmacy' as ActiveTab },
            { title: 'Ayushman PM-JAY & Finance', desc: '₹5 Lakh cashless hospital scheme and claims.', icon: ShieldCheck, tab: 'insurance' as ActiveTab },
            { title: 'Medical records vault', desc: 'Encrypted timeline with AI lab report reviews.', icon: FileText, tab: 'records' as ActiveTab },
            { title: 'Preventive wellness', desc: 'Rapid clinical triage & vital signs assessment.', icon: HeartPulse, tab: 'assistant' as ActiveTab },
            { title: 'Security & RBAC matrix', desc: 'Role-based access control and immutable audit logs.', icon: Activity, tab: 'audit' as ActiveTab },
          ].map(f => (
            <div
              key={f.title}
              onClick={() => onNavigateToTab(f.tab)}
              className="glass p-6 rounded-2xl border border-border hover:border-primary/40 transition-all hover:-translate-y-1 cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
                  <f.icon className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono text-muted-foreground group-hover:text-gold transition-colors">
                  Open module →
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: About and Trust */}
      <section className="glass rounded-3xl p-8 sm:p-12 border border-border shadow-glass space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Section 05 • Mission & Ethics
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white mt-2">
            Healthcare that tells the truth.
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl mt-2 leading-relaxed">
            Vitalora is an AI healthcare platform built to make medical care honest, clear, and accessible. No fabricated stocks, no hidden fine print, and no black-box diagnosis.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-white">Honest data</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every blood unit, bed count, and price shows its verifiable hospital source and last-updated freshness timestamp.
            </p>
          </div>

          <div className="space-y-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-white">AI that explains</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Diagnostic explanations in plain language with emergency safeguards. Always educational, never replacing in-person clinical care.
            </p>
          </div>

          <div className="space-y-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary">
              <Languages className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-white">Built for India</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Native support for Hindi (हिन्दी), English, and Hinglish with deep integration for Bihar healthcare infrastructure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
