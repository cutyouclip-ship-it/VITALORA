import React, { useState } from 'react';
import {
  Activity,
  Droplet,
  Bot,
  Building2,
  Pill,
  ShieldCheck,
  FileText,
  User,
  PhoneCall,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  LogOut,
  Home,
} from 'lucide-react';
import { ActiveTab, UserSession } from '../types.js';
import { UserRole } from '../utils/healthcareLogic.js';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userSession: UserSession;
  onRoleChange: (role: UserRole) => void;
  onOpenTriageModal: () => void;
  onLogoutToAuth?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  userSession,
  onRoleChange,
  onOpenTriageModal,
  onLogoutToAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Clinical Assistant', icon: <Bot className="w-4 h-4" /> },
    {
      id: 'blood-band',
      label: 'Bihar Blood Band',
      icon: <Droplet className="w-4 h-4 text-red-400 fill-red-400" />,
      badge: 'Live',
    },
    { id: 'anatomy', label: '3D Anatomy Explorer', icon: <Activity className="w-4 h-4" /> },
    { id: 'doctors', label: 'Doctors & Hospitals', icon: <Building2 className="w-4 h-4" /> },
    { id: 'pharmacy', label: 'Pharmacy Dispensary', icon: <Pill className="w-4 h-4" /> },
    { id: 'insurance', label: 'Finance & Claims', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'records', label: 'Health Vault', icon: <FileText className="w-4 h-4" /> },
    { id: 'audit', label: 'Security & RBAC', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const roles: UserRole[] = ['PATIENT', 'DOCTOR', 'HOSPITAL_STAFF', 'PHARMACIST', 'ADMIN'];

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4">
      <div className="glass max-w-7xl mx-auto flex items-center justify-between gap-4 rounded-2xl px-5 py-3 shadow-glass">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold shadow-gold">
            <span className="h-3.5 w-3.5 rounded-full bg-background" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">vitalora</span>
        </div>

        {/* Desktop Center Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1">
          {navTabs.slice(0, 7).map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gold text-primary-foreground font-semibold shadow-gold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask AI button with gold theme */}
          <button
            onClick={() => onTabChange('assistant')}
            className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-gold transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* Clinical Triage shortcut */}
          <button
            onClick={onOpenTriageModal}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Triage</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border text-xs font-semibold text-white cursor-pointer hover:bg-muted transition-colors">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{userSession.role}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>

            <div className="absolute right-0 mt-1.5 w-44 rounded-2xl glass border border-border shadow-2xl py-1.5 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] font-mono text-muted-foreground uppercase border-b border-border">
                Switch Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    userSession.role === r
                      ? 'bg-muted text-gold font-bold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-white'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}

              {onLogoutToAuth && (
                <button
                  onClick={onLogoutToAuth}
                  className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 border-t border-border mt-1 flex items-center gap-1.5"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out / Switch User
                </button>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Subnav for secondary items on desktop */}
        <div className="hidden lg:flex items-center justify-between px-5 py-2 text-xs text-muted-foreground border-t border-border/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTabChange('records')}
              className={`hover:text-foreground transition-colors ${activeTab === 'records' ? 'text-primary font-semibold' : ''}`}
            >
              Health Vault
            </button>
            <button
              onClick={() => onTabChange('insurance')}
              className={`hover:text-foreground transition-colors ${activeTab === 'insurance' ? 'text-primary font-semibold' : ''}`}
            >
              Ayushman PM-JAY & Finance
            </button>
            <button
              onClick={() => onTabChange('audit')}
              className={`hover:text-foreground transition-colors ${activeTab === 'audit' ? 'text-primary font-semibold' : ''}`}
            >
              Security & Audit Trail
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-primary" />
              <span>Emergency: <strong className="text-white">108</strong> / <strong className="text-white">104</strong></span>
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-[11px] font-mono text-primary">Bihar Swasthya Network</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="glass max-w-7xl mx-auto mt-2 rounded-2xl p-4 lg:hidden space-y-1">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                activeTab === tab.id
                  ? 'bg-gold text-primary-foreground font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenTriageModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-primary hover:bg-muted flex items-center gap-2 border-t border-border mt-2 pt-2"
          >
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span>Emergency Clinical Triage</span>
          </button>
        </div>
      )}
    </header>
  );
};
