/**
 * VITALORA Healthcare Core Business Logic
 * Decoupled pure logic functions for medical safety, triage, inventory staleness,
 * authoritative calculations, and role-based permissions.
 */

export interface VitalSigns {
  heartRate?: number; // bpm
  systolicBp?: number; // mmHg
  diastolicBp?: number; // mmHg
  spO2?: number; // percentage
  temperatureF?: number; // Fahrenheit
  bloodGlucoseMgDl?: number; // mg/dL
}

export interface TriageResult {
  level: 'EMERGENCY' | 'URGENT' | 'MODERATE' | 'ROUTINE';
  color: string;
  reasons: string[];
  recommendedAction: string;
  isRedFlag: boolean;
}

/**
 * Evaluates symptoms and vitals against clinical safety rules.
 * Flags red flags (e.g. chest pain with shortness of breath, SpO2 < 92%)
 * Never claims to replace an in-person emergency physician.
 */
export function computeTriageLevel(
  symptoms: string[] = [],
  vitals?: VitalSigns
): TriageResult {
  const reasons: string[] = [];
  let isRedFlag = false;

  const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

  // Check critical emergency symptoms
  const emergencyKeywords = [
    'chest pain',
    'difficulty breathing',
    'severe shortness of breath',
    'loss of consciousness',
    'sudden weakness',
    'facial droop',
    'slurred speech',
    'heavy bleeding',
    'severe anaphylaxis',
    'poisoning',
  ];

  for (const kw of emergencyKeywords) {
    if (normalizedSymptoms.some(s => s.includes(kw))) {
      reasons.push(`Critical symptom detected: ${kw}`);
      isRedFlag = true;
    }
  }

  // Check vitals thresholds
  if (vitals) {
    if (vitals.spO2 !== undefined && vitals.spO2 < 90) {
      reasons.push(`Severely low SpO2 saturation: ${vitals.spO2}% (<90%)`);
      isRedFlag = true;
    } else if (vitals.spO2 !== undefined && vitals.spO2 < 94) {
      reasons.push(`Borderline low SpO2 saturation: ${vitals.spO2}%`);
    }

    if (vitals.systolicBp !== undefined && vitals.systolicBp >= 180) {
      reasons.push(`Hypertensive crisis threshold: Systolic BP ${vitals.systolicBp} mmHg`);
      isRedFlag = true;
    }

    if (vitals.heartRate !== undefined && (vitals.heartRate > 140 || vitals.heartRate < 45)) {
      reasons.push(`Abnormal cardiac rate: ${vitals.heartRate} bpm`);
      isRedFlag = true;
    }

    if (vitals.temperatureF !== undefined && vitals.temperatureF >= 104) {
      reasons.push(`Hyperpyrexia: High fever of ${vitals.temperatureF}°F`);
    }
  }

  if (isRedFlag) {
    return {
      level: 'EMERGENCY',
      color: 'red',
      reasons,
      recommendedAction: 'Immediate emergency medical attention required. Call 108/112 or visit the nearest emergency trauma department immediately.',
      isRedFlag: true,
    };
  }

  const urgentKeywords = ['high fever', 'persistent vomiting', 'dehydration', 'severe abdominal pain', 'fracture suspected', 'deep cut'];
  const hasUrgent = normalizedSymptoms.some(s => urgentKeywords.some(kw => s.includes(kw)));
  const vitalsAbnormal = (vitals?.spO2 !== undefined && vitals.spO2 < 94) || (vitals?.temperatureF !== undefined && vitals.temperatureF >= 102);

  if (hasUrgent || vitalsAbnormal) {
    if (hasUrgent) reasons.push('Urgent symptoms requiring clinical assessment within 1-2 hours');
    return {
      level: 'URGENT',
      color: 'amber',
      reasons,
      recommendedAction: 'Consult an urgent care physician or hospital outpatient department promptly today.',
      isRedFlag: false,
    };
  }

  const moderateKeywords = ['cough', 'mild fever', 'headache', 'joint pain', 'rash', 'sore throat', 'allergy'];
  const hasModerate = normalizedSymptoms.some(s => moderateKeywords.some(kw => s.includes(kw)));

  if (hasModerate || normalizedSymptoms.length > 0) {
    return {
      level: 'MODERATE',
      color: 'blue',
      reasons: ['Mild to moderate symptoms suitable for scheduled consultation or primary doctor guidance'],
      recommendedAction: 'Schedule a consultation with a verified specialist or tele-consultation doctor.',
      isRedFlag: false,
    };
  }

  return {
    level: 'ROUTINE',
    color: 'emerald',
    reasons: ['Preventive wellness check or general health inquiry'],
    recommendedAction: 'Routine health maintenance and preventive screening.',
    isRedFlag: false,
  };
}

/**
 * Checks if a blood bank inventory record is older than allowed freshness threshold.
 * Per Bihar Blood Band protocol: Records older than 24h are deemed stale and unconfirmed.
 */
export function isInventoryStale(
  lastUpdatedIso: string,
  thresholdHours: number = 24,
  currentTimeMs: number = Date.now()
): { isStale: boolean; hoursElapsed: number; freshnessLabel: string } {
  const updatedTimeMs = new Date(lastUpdatedIso).getTime();
  if (isNaN(updatedTimeMs)) {
    return { isStale: true, hoursElapsed: Infinity, freshnessLabel: 'Unknown timestamp' };
  }

  const diffMs = currentTimeMs - updatedTimeMs;
  const hoursElapsed = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
  const isStale = hoursElapsed >= thresholdHours;

  let freshnessLabel = '';
  if (hoursElapsed < 1) {
    freshnessLabel = 'Updated just now';
  } else if (hoursElapsed < 24) {
    freshnessLabel = `Updated ${Math.floor(hoursElapsed)}h ago`;
  } else {
    freshnessLabel = `Unconfirmed: Last updated ${Math.floor(hoursElapsed / 24)}d ago`;
  }

  return {
    isStale,
    hoursElapsed,
    freshnessLabel,
  };
}

/**
 * Compatible blood donor groups for a given recipient.
 */
export function getCompatibleDonorBloodGroups(recipientGroup: string): string[] {
  const map: Record<string, string[]> = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  };

  const clean = recipientGroup.trim().toUpperCase();
  return map[clean] || [clean];
}

/**
 * Compatible blood recipient groups that can safely receive this donor's blood.
 */
export function getCompatibleRecipientBloodGroups(donorGroup: string): string[] {
  const map: Record<string, string[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
  };

  const clean = donorGroup.trim().toUpperCase();
  return map[clean] || [clean];
}

export interface DonorEligibilityInput {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weightKg: number;
  monthsSinceLastDonation: number; // or null if first time
  hasRecentFeverOrAntibiotics: boolean;
  hasRecentTattooOrPiercing: boolean; // within 6 months
  hasMajorSurgeryLast6Months: boolean;
  isPregnantOrLactating?: boolean;
}

export interface DonorEligibilityOutput {
  isEligible: boolean;
  statusTitle: string;
  reasons: string[];
  safeDonationDateRecommendation?: string;
  category: 'ELIGIBLE' | 'TEMPORARILY_DEFERRED' | 'INELIGIBLE';
}

/**
 * Authoritative NBTC/MoHFW Donor Screening Logic
 */
export function evaluateDonorEligibility(input: DonorEligibilityInput): DonorEligibilityOutput {
  const reasons: string[] = [];
  let isDeferred = false;

  if (input.age < 18) {
    reasons.push('Minimum legal age for blood donation in India is 18 years.');
    isDeferred = true;
  } else if (input.age > 65) {
    reasons.push('Upper age limit for voluntary donation is 65 years (as per NBTC guidelines).');
    isDeferred = true;
  }

  const minWeight = input.gender === 'Female' ? 45 : 50;
  if (input.weightKg < minWeight) {
    reasons.push(`Minimum weight requirement is ${minWeight} kg for your safety.`);
    isDeferred = true;
  }

  const minIntervalMonths = input.gender === 'Female' ? 4 : 3;
  if (input.monthsSinceLastDonation < minIntervalMonths && input.monthsSinceLastDonation > 0) {
    reasons.push(`Minimum gap required between donations is ${minIntervalMonths} months (${minIntervalMonths * 30} days) to replenish iron stores.`);
    isDeferred = true;
  }

  if (input.hasRecentFeverOrAntibiotics) {
    reasons.push('You must be fully recovered and off antibiotic/antiviral medication for at least 48 hours before donation.');
    isDeferred = true;
  }

  if (input.hasRecentTattooOrPiercing) {
    reasons.push('Tattoos, acupuncture, or body piercing require a 6-month deferral window to prevent window-period infection transmission.');
    isDeferred = true;
  }

  if (input.hasMajorSurgeryLast6Months) {
    reasons.push('Major surgeries require a 6-month recovery period before donating blood.');
    isDeferred = true;
  }

  if (input.gender === 'Female' && input.isPregnantOrLactating) {
    reasons.push('Pregnancy and lactation require deferral until 12 months after delivery/cessation of breastfeeding.');
    isDeferred = true;
  }

  if (isDeferred) {
    return {
      isEligible: false,
      category: 'TEMPORARILY_DEFERRED',
      statusTitle: 'Temporarily Deferred (अस्थायी रूप से अपात्र)',
      reasons,
    };
  }

  return {
    isEligible: true,
    category: 'ELIGIBLE',
    statusTitle: 'Medically Eligible to Donate! (रक्तदान के लिए पात्र)',
    reasons: [
      'Age and weight fulfill NBTC physiological requirements.',
      'Sufficient recovery period since previous donation.',
      'No active medication or systemic infection deferrals.',
    ],
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number; // in INR
  quantity: number;
  prescriptionRequired: boolean;
}

export interface CartCalculationResult {
  itemCount: number;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  gst: number;
  deliveryFee: number;
  grandTotal: number;
  requiresPrescription: boolean;
}

/**
 * Authoritative Server-side Pharmacy Billing Calculation.
 * Never trust client prices or client totals.
 */
export function calculateAuthoritativeCart(
  items: CartItem[],
  discountPercent: number = 0,
  freeDeliveryThreshold: number = 499
): CartCalculationResult {
  let subtotal = 0;
  let itemCount = 0;
  let requiresPrescription = false;

  for (const item of items) {
    const qty = Math.max(1, Math.floor(item.quantity || 1));
    const price = Math.max(0, item.price);
    subtotal += price * qty;
    itemCount += qty;
    if (item.prescriptionRequired) {
      requiresPrescription = true;
    }
  }

  // Cap discount between 0 and 30%
  const validDiscountPercent = Math.min(30, Math.max(0, discountPercent));
  const discount = Math.round(((subtotal * validDiscountPercent) / 100) * 100) / 100;
  const taxableAmount = Math.max(0, subtotal - discount);

  // 12% GST on pharmaceuticals
  const gst = Math.round(taxableAmount * 0.12 * 100) / 100;

  // Delivery fee: ₹50 if order below ₹499, otherwise ₹0
  const deliveryFee = taxableAmount > 0 && taxableAmount < freeDeliveryThreshold ? 50 : 0;

  const grandTotal = Math.round((taxableAmount + gst + deliveryFee) * 100) / 100;

  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    taxableAmount,
    gst,
    deliveryFee,
    grandTotal,
    requiresPrescription,
  };
}

export type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'HOSPITAL_STAFF' | 'ADMIN';

export type ActionType = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'APPROVE' | 'AUDIT';

export interface ResourcePermission {
  resource: 'RECORDS' | 'BLOOD_INVENTORY' | 'PHARMACY_ORDERS' | 'INSURANCE_CLAIMS' | 'STAFF_MANAGEMENT' | 'AUDIT_LOGS';
  action: ActionType;
}

/**
 * Role-Based Access Control matrix (Least-privilege security)
 */
export function checkRolePermission(role: UserRole, resource: ResourcePermission['resource'], action: ActionType): boolean {
  if (role === 'ADMIN') return true; // Admins have oversight

  switch (resource) {
    case 'RECORDS':
      if (role === 'PATIENT') return action === 'VIEW' || action === 'CREATE';
      if (role === 'DOCTOR') return action === 'VIEW' || action === 'CREATE' || action === 'EDIT';
      return false;

    case 'BLOOD_INVENTORY':
      if (role === 'HOSPITAL_STAFF') return true;
      if (role === 'DOCTOR' || role === 'PATIENT' || role === 'PHARMACIST') return action === 'VIEW';
      return false;

    case 'PHARMACY_ORDERS':
      if (role === 'PHARMACIST') return true;
      if (role === 'PATIENT') return action === 'VIEW' || action === 'CREATE';
      return false;

    case 'INSURANCE_CLAIMS':
      if (role === 'PATIENT') return action === 'VIEW' || action === 'CREATE';
      if (role === 'HOSPITAL_STAFF') return action === 'VIEW' || action === 'APPROVE';
      return false;

    case 'STAFF_MANAGEMENT':
      return false;

    case 'AUDIT_LOGS':
      return false;

    default:
      return false;
  }
}
