import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { UserRole, checkRolePermission } from '../utils/healthcareLogic.js';

interface AuditItem {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

interface Props {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const AuditAdminView: React.FC<Props> = ({ currentRole, onRoleChange }) => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch('/api/audit-logs')
      .then(r => r.json())
      .then(d => setLogs(d || []))
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const roles: UserRole[] = ['PATIENT', 'DOCTOR', 'PHARMACIST', 'HOSPITAL_STAFF', 'ADMIN'];

  const resources: Array<'RECORDS' | 'BLOOD_INVENTORY' | 'PHARMACY_ORDERS' | 'INSURANCE_CLAIMS' | 'STAFF_MANAGEMENT' | 'AUDIT_LOGS'> = [
    'RECORDS',
    'BLOOD_INVENTORY',
    'PHARMACY_ORDERS',
    'INSURANCE_CLAIMS',
    'STAFF_MANAGEMENT',
    'AUDIT_LOGS',
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 shadow-glass border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Shield className="w-4 h-4 text-primary" />
            Security & Healthcare Compliance Center
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Role-Based Access Control (RBAC) & Audit Trail
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Least-privilege authorization policies complying with healthcare data protection principles and tamper-evident audit logging.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="p-3 rounded-xl bg-card hover:bg-muted text-foreground border border-border flex items-center gap-2 text-xs font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Role Switcher Sandbox */}
      <div className="glass rounded-2xl p-6 border-border/80 shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Active Session Role Emulation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch roles to evaluate authorization boundaries across VITALORA services:
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 font-mono font-bold">
            Active: {currentRole}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-20 ${
                currentRole === r
                  ? 'bg-gold text-primary-foreground border-primary shadow-gold'
                  : 'bg-background/60 text-muted-foreground border-border hover:bg-card hover:text-foreground'
              }`}
            >
              <div className="text-[10px] opacity-75 font-mono">Role Node</div>
              <div>{r.replace('_', ' ')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* RBAC Permission Matrix Table */}
      <div className="glass rounded-2xl p-6 border-border/80 shadow-glass space-y-4">
        <h3 className="text-base font-bold text-foreground">Authorization Matrix for {currentRole}</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Healthcare Resource</th>
                <th className="py-2.5 px-3 text-center">View / Read</th>
                <th className="py-2.5 px-3 text-center">Create</th>
                <th className="py-2.5 px-3 text-center">Edit / Update</th>
                <th className="py-2.5 px-3 text-center">Approve / Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {resources.map(res => {
                const canView = checkRolePermission(currentRole, res, 'VIEW');
                const canCreate = checkRolePermission(currentRole, res, 'CREATE');
                const canEdit = checkRolePermission(currentRole, res, 'EDIT');
                const canApprove = checkRolePermission(currentRole, res, 'APPROVE') || checkRolePermission(currentRole, res, 'AUDIT');

                return (
                  <tr key={res} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{res}</td>
                    <td className="py-3 px-3 text-center">
                      {canView ? (
                        <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {canCreate ? (
                        <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {canEdit ? (
                        <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {canApprove ? (
                        <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Viewer */}
      <div className="glass rounded-2xl p-6 border-border/80 shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">Immutable Security Audit Logs</h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">{logs.length} logged events</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-background/60 border border-border text-xs font-mono space-y-1 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">[{log.action}]</span>
                  <span className="text-muted-foreground">{log.resource}</span>
                  <span className="px-1.5 py-0.2 rounded bg-card text-foreground border border-border">{log.userRole}</span>
                </div>
                <span className="text-muted-foreground/70">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-foreground text-xs">{log.details}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
