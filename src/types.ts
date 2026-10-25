import { UserRole } from './utils/healthcareLogic.js';

export type ActiveTab =
  | 'home'
  | 'auth'
  | 'assistant'
  | 'blood-band'
  | 'anatomy'
  | 'doctors'
  | 'pharmacy'
  | 'insurance'
  | 'records'
  | 'audit';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  district: string;
  bloodGroup: string;
  ayushmanCardNo?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
    result: any;
  }>;
  navigationActions?: string[];
  reportAnalysis?: any;
}
