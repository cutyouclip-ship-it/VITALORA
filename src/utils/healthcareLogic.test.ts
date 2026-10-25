import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTriageLevel,
  isInventoryStale,
  getCompatibleDonorBloodGroups,
  getCompatibleRecipientBloodGroups,
  evaluateDonorEligibility,
  calculateAuthoritativeCart,
  checkRolePermission,
  CartItem,
} from './healthcareLogic.js';

test('Triage red flag flags emergency chest pain and severe hypoxia', () => {
  const result = computeTriageLevel(['severe chest pain', 'sweating'], { spO2: 88, heartRate: 110 });
  assert.equal(result.level, 'EMERGENCY');
  assert.equal(result.isRedFlag, true);
  assert.ok(result.reasons.some(r => r.includes('chest pain')));
  assert.ok(result.reasons.some(r => r.includes('SpO2')));
});

test('Triage categorizes mild symptoms into moderate tier with physician guidance', () => {
  const result = computeTriageLevel(['mild headache', 'cough'], { spO2: 98, heartRate: 75 });
  assert.equal(result.level, 'MODERATE');
  assert.equal(result.isRedFlag, false);
});

test('Triage categorizes high fever into urgent tier', () => {
  const result = computeTriageLevel(['high fever', 'chills'], { temperatureF: 102.5, spO2: 97 });
  assert.equal(result.level, 'URGENT');
  assert.equal(result.isRedFlag, false);
});

test('Blood inventory staleness check marks records older than 24h as stale', () => {
  const fixedNow = new Date('2026-10-25T12:00:00Z').getTime();

  // 2 hours ago => Fresh
  const freshIso = new Date('2026-10-25T10:00:00Z').toISOString();
  const freshRes = isInventoryStale(freshIso, 24, fixedNow);
  assert.equal(freshRes.isStale, false);
  assert.equal(freshRes.hoursElapsed, 2);

  // 30 hours ago => Stale
  const staleIso = new Date('2026-10-24T06:00:00Z').toISOString();
  const staleRes = isInventoryStale(staleIso, 24, fixedNow);
  assert.equal(staleRes.isStale, true);
  assert.equal(staleRes.hoursElapsed, 30);
});

test('Donor compatibility returns correct donor types for blood groups', () => {
  const oNegDonors = getCompatibleDonorBloodGroups('O-');
  assert.deepEqual(oNegDonors, ['O-']);

  const oPosDonors = getCompatibleDonorBloodGroups('O+');
  assert.ok(oPosDonors.includes('O-') && oPosDonors.includes('O+'));

  const abPosDonors = getCompatibleDonorBloodGroups('AB+');
  assert.equal(abPosDonors.length, 8); // Universal recipient
});

test('Authoritative cart computation correctly computes GST, delivery fee and Rx flag', () => {
  const items: CartItem[] = [
    { id: 'med-1', name: 'Paracetamol 650mg', price: 30, quantity: 2, prescriptionRequired: false },
    { id: 'med-2', name: 'Amoxicillin 500mg', price: 120, quantity: 1, prescriptionRequired: true },
  ];

  const calc = calculateAuthoritativeCart(items, 10, 499);
  // Subtotal = 30*2 + 120 = 180
  assert.equal(calc.subtotal, 180);
  // 10% discount = 18
  assert.equal(calc.discount, 18);
  // Taxable = 162
  assert.equal(calc.taxableAmount, 162);
  // 12% GST of 162 = 19.44
  assert.equal(calc.gst, 19.44);
  // <499 => deliveryFee = 50
  assert.equal(calc.deliveryFee, 50);
  // Total = 162 + 19.44 + 50 = 231.44
  assert.equal(calc.grandTotal, 231.44);
  assert.equal(calc.requiresPrescription, true);
});

test('Role-Based Access Control matrix protects administrative and staff resources', () => {
  // Patient cannot update blood inventory
  assert.equal(checkRolePermission('PATIENT', 'BLOOD_INVENTORY', 'EDIT'), false);
  // Hospital staff can update blood inventory
  assert.equal(checkRolePermission('HOSPITAL_STAFF', 'BLOOD_INVENTORY', 'EDIT'), true);
  // Patient cannot view audit logs
  assert.equal(checkRolePermission('PATIENT', 'AUDIT_LOGS', 'VIEW'), false);
  // Admin can view audit logs
  assert.equal(checkRolePermission('ADMIN', 'AUDIT_LOGS', 'VIEW'), true);
  // Pharmacist can manage pharmacy orders
  assert.equal(checkRolePermission('PHARMACIST', 'PHARMACY_ORDERS', 'APPROVE'), true);
});

test('Donor recipient compatibility returns correct target groups for Universal Donor and others', () => {
  // O- can give to all 8 groups
  const oNegRecipients = getCompatibleRecipientBloodGroups('O-');
  assert.equal(oNegRecipients.length, 8);
  assert.ok(oNegRecipients.includes('AB+'));
  assert.ok(oNegRecipients.includes('O-'));

  // AB+ can only give RBC to AB+
  const abPosRecipients = getCompatibleRecipientBloodGroups('AB+');
  assert.deepEqual(abPosRecipients, ['AB+']);

  // B+ can give to B+ and AB+
  const bPosRecipients = getCompatibleRecipientBloodGroups('B+');
  assert.deepEqual(bPosRecipients, ['B+', 'AB+']);
});

test('Donor eligibility evaluation correctly assesses valid and deferred candidates', () => {
  // Eligible healthy male candidate
  const eligibleCandidate = evaluateDonorEligibility({
    age: 28,
    gender: 'Male',
    weightKg: 70,
    monthsSinceLastDonation: 4,
    hasRecentFeverOrAntibiotics: false,
    hasRecentTattooOrPiercing: false,
    hasMajorSurgeryLast6Months: false,
  });
  assert.equal(eligibleCandidate.isEligible, true);
  assert.equal(eligibleCandidate.category, 'ELIGIBLE');

  // Deferred candidate: underage (<18)
  const underageCandidate = evaluateDonorEligibility({
    age: 16,
    gender: 'Male',
    weightKg: 60,
    monthsSinceLastDonation: 999,
    hasRecentFeverOrAntibiotics: false,
    hasRecentTattooOrPiercing: false,
    hasMajorSurgeryLast6Months: false,
  });
  assert.equal(underageCandidate.isEligible, false);
  assert.equal(underageCandidate.category, 'TEMPORARILY_DEFERRED');

  // Deferred candidate: underweight female (<45kg)
  const underweightCandidate = evaluateDonorEligibility({
    age: 24,
    gender: 'Female',
    weightKg: 42,
    monthsSinceLastDonation: 6,
    hasRecentFeverOrAntibiotics: false,
    hasRecentTattooOrPiercing: false,
    hasMajorSurgeryLast6Months: false,
  });
  assert.equal(underweightCandidate.isEligible, false);

  // Deferred candidate: recent tattoo (<6 months)
  const tattooCandidate = evaluateDonorEligibility({
    age: 30,
    gender: 'Male',
    weightKg: 75,
    monthsSinceLastDonation: 6,
    hasRecentFeverOrAntibiotics: false,
    hasRecentTattooOrPiercing: true,
    hasMajorSurgeryLast6Months: false,
  });
  assert.equal(tattooCandidate.isEligible, false);
});
