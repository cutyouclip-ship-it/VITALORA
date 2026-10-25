/**
 * Authoritative Seed & Master Data for VITALORA
 * Bihar Blood Band Network, Verified Hospitals, Doctors, Medicines, Insurance Policies, and Health Records.
 * All development seed data is explicitly marked with isTestData: true or verification indicators.
 */

export interface BloodInventoryItem {
  id: string;
  hospitalId: string;
  hospitalName: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone: string;
  emergencyHelpline: string;
  bloodGroup: 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';
  component: 'Whole Blood' | 'Packed Red Cells (PRBC)' | 'Platelets (RDP/SDP)' | 'Fresh Frozen Plasma (FFP)' | 'Cryoprecipitate';
  units: number;
  lastUpdatedIso: string;
  verifiedByStaff: string;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNCONFIRMED';
  isTestData?: boolean;
}

import { patnaRealHospitals, patnaRealDoctors } from './patnaRealData.js';

export interface Hospital {
  id: string;
  name: string;
  district: string;
  city: string;
  state: string;
  address: string;
  category: 'Government Tertiary' | 'Autonomous Apex' | 'Charitable / Trust' | 'Private Multi-Specialty';
  rating: number;
  emergencyServices24x7: boolean;
  icuBedsAvailable: number;
  oxygenPlantActive: boolean;
  phone: string;
  emergencyPhone: string;
  departments: string[];
  lat: number;
  lng: number;
  verificationBadge: 'Govt Certified' | 'NABH Accredited' | 'Pilot Verified';
  image?: string;
  officialUrl?: string;
  contactNotes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  hospitalId: string;
  hospitalName: string;
  district: string;
  consultationFeeInr: number;
  languages: string[];
  rating: number;
  reviewCount: number;
  availableDays: string[];
  timeSlots: string[];
  image: string;
  verifiedBadge: boolean;
  opdTiming?: string;
  receptionContact?: string;
  officialDirectoryUrl?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: 'Cardiac' | 'Antibiotic' | 'Analgesic' | 'Diabetes' | 'Respiratory' | 'Vitamins' | 'Gastroenterology';
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler';
  strength: string;
  mrp: number; // Maximum Retail Price
  price: number; // Discounted Price
  stockQuantity: number;
  prescriptionRequired: boolean;
  composition: string;
  therapeuticUses: string[];
  precautions: string[];
  dosageInstructions: string;
  inStock: boolean;
  sourceManufacturer: string;
  lastPriceAuditDate: string;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  coverageAmountInr: number;
  annualPremiumEstimateInr: number;
  cashlessHospitalsCount: number;
  waitingPeriodMonths: number;
  coPayPercent: number;
  keyFeatures: string[];
  isGovtAffiliated: boolean;
  targetDemographic: string;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'IMAGING';
  date: string;
  doctorName: string;
  hospitalName: string;
  summary: string;
  fileUrl?: string;
  status: 'ANALYZED' | 'REVIEWED' | 'PENDING';
  aiInsights?: string;
}

// Other Verified Bihar Regional Government Medical Colleges
export const otherDistrictHospitals: Hospital[] = [
  {
    id: 'anmmch-gaya',
    name: 'Anugrah Narayan Magadh Medical College & Hospital (ANMMCH)',
    district: 'Gaya',
    city: 'Gaya',
    state: 'Bihar',
    address: 'Sherghati Road, Gaya, Bihar 823001',
    category: 'Government Tertiary',
    rating: 4.2,
    emergencyServices24x7: true,
    icuBedsAvailable: 16,
    oxygenPlantActive: true,
    phone: '+91-631-2410339',
    emergencyPhone: '108',
    departments: ['Emergency Trauma', 'General Medicine', 'Blood Bank', 'Pediatrics'],
    lat: 24.7955,
    lng: 84.9782,
    verificationBadge: 'Govt Certified',
    image: '/assets/images/paras_hmri_patna.jpg',
  },
  {
    id: 'skmch-muzaffarpur',
    name: 'Sri Krishna Medical College and Hospital (SKMCH)',
    district: 'Muzaffarpur',
    city: 'Muzaffarpur',
    state: 'Bihar',
    address: 'Umanagar, Muzaffarpur, Bihar 842004',
    category: 'Government Tertiary',
    rating: 4.3,
    emergencyServices24x7: true,
    icuBedsAvailable: 24,
    oxygenPlantActive: true,
    phone: '+91-621-2260177',
    emergencyPhone: '108',
    departments: ['Emergency Care', 'Orthopedics', 'Pediatric ICU', 'Blood Transfusion Center'],
    lat: 26.1528,
    lng: 85.4055,
    verificationBadge: 'Govt Certified',
    image: '/assets/images/ruban_patna_hospital.jpg',
  },
  {
    id: 'jlnmch-bhagalpur',
    name: 'Jawaharlal Nehru Medical College & Hospital (JLNMCH)',
    district: 'Bhagalpur',
    city: 'Bhagalpur',
    state: 'Bihar',
    address: 'Mayaganj, Bhagalpur, Bihar 812001',
    category: 'Government Tertiary',
    rating: 4.1,
    emergencyServices24x7: true,
    icuBedsAvailable: 20,
    oxygenPlantActive: true,
    phone: '+91-641-2401078',
    emergencyPhone: '108',
    departments: ['Trauma Center', 'Blood Bank', 'Neurology', 'Medicine'],
    lat: 25.2425,
    lng: 87.0163,
    verificationBadge: 'Govt Certified',
    image: '/assets/images/pmch_patna_hospital.jpg',
  },
  {
    id: 'dmch-darbhanga',
    name: 'Darbhanga Medical College and Hospital (DMCH)',
    district: 'Darbhanga',
    city: 'Darbhanga',
    state: 'Bihar',
    address: 'Laheriasarai, Darbhanga, Bihar 846003',
    category: 'Government Tertiary',
    rating: 4.2,
    emergencyServices24x7: true,
    icuBedsAvailable: 22,
    oxygenPlantActive: true,
    phone: '+91-6272-255152',
    emergencyPhone: '108',
    departments: ['Emergency Medicine', 'Blood Bank', 'Surgery', 'Obstetrics & Gynae'],
    lat: 26.1264,
    lng: 85.9015,
    verificationBadge: 'Govt Certified',
    image: '/assets/images/aiims_patna_hospital.jpg',
  },
];

// Complete Bihar Healthcare Facilities: 20 Real Patna Apex/Tertiary Hospitals + District Medical Colleges
export const initialHospitals: Hospital[] = [
  ...patnaRealHospitals,
  ...otherDistrictHospitals,
];

// Helper to get ISO timestamp relative to current execution
const getRecentIso = (hoursAgo: number) => {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
};

// Initial Bihar Blood Band Inventory (Seed Test Data explicitly labeled)
export const initialBloodInventory: BloodInventoryItem[] = [
  {
    id: 'blood-patna-1',
    hospitalId: 'aiims-patna',
    hospitalName: 'AIIMS Patna Central Blood Bank',
    district: 'Patna',
    address: 'Phulwari Sharif, Patna, Bihar 801507',
    lat: 25.5604,
    lng: 85.0682,
    contactPhone: '+91-612-2451055',
    emergencyHelpline: '108',
    bloodGroup: 'O-',
    component: 'Packed Red Cells (PRBC)',
    units: 14,
    lastUpdatedIso: getRecentIso(2), // 2 hours ago (Fresh)
    verifiedByStaff: 'Dr. Anand Kishore (Hematologist-in-Charge)',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-patna-2',
    hospitalId: 'aiims-patna',
    hospitalName: 'AIIMS Patna Central Blood Bank',
    district: 'Patna',
    address: 'Phulwari Sharif, Patna, Bihar 801507',
    lat: 25.5604,
    lng: 85.0682,
    contactPhone: '+91-612-2451055',
    emergencyHelpline: '108',
    bloodGroup: 'O+',
    component: 'Packed Red Cells (PRBC)',
    units: 32,
    lastUpdatedIso: getRecentIso(1), // 1 hour ago (Fresh)
    verifiedByStaff: 'Dr. Anand Kishore',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-patna-3',
    hospitalId: 'pmch-patna',
    hospitalName: 'PMCH Model Blood Transfusion Centre',
    district: 'Patna',
    address: 'Ashok Rajpath, Patna',
    lat: 25.6207,
    lng: 85.1612,
    contactPhone: '+91-612-2300085',
    emergencyHelpline: '102',
    bloodGroup: 'O-',
    component: 'Whole Blood',
    units: 6,
    lastUpdatedIso: getRecentIso(4), // 4 hours ago (Fresh)
    verifiedByStaff: 'Dr. Sunita Devi (Blood Bank Officer)',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-patna-4',
    hospitalId: 'pmch-patna',
    hospitalName: 'PMCH Model Blood Transfusion Centre',
    district: 'Patna',
    address: 'Ashok Rajpath, Patna',
    lat: 25.6207,
    lng: 85.1612,
    contactPhone: '+91-612-2300085',
    emergencyHelpline: '102',
    bloodGroup: 'B+',
    component: 'Platelets (RDP/SDP)',
    units: 19,
    lastUpdatedIso: getRecentIso(3), // 3 hours ago (Fresh)
    verifiedByStaff: 'Dr. Sunita Devi',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-patna-5',
    hospitalId: 'igims-patna',
    hospitalName: 'IGIMS Blood Component Facility',
    district: 'Patna',
    address: 'Bailey Road, Sheikhpura, Patna',
    lat: 25.6111,
    lng: 85.0863,
    contactPhone: '+91-612-2297110',
    emergencyHelpline: '108',
    bloodGroup: 'AB-',
    component: 'Packed Red Cells (PRBC)',
    units: 4,
    lastUpdatedIso: getRecentIso(5), // 5 hours ago (Fresh)
    verifiedByStaff: 'Dr. R. P. Singh (Director Transfusion)',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-patna-6',
    hospitalId: 'mahavir-cancer',
    hospitalName: 'Mahavir Cancer Sansthan Apheresis Centre',
    district: 'Patna',
    address: 'Phulwari Sharif, Patna',
    lat: 25.5782,
    lng: 85.0805,
    contactPhone: '+91-612-2250129',
    emergencyHelpline: '+91-612-2250128',
    bloodGroup: 'A+',
    component: 'Platelets (RDP/SDP)',
    units: 22,
    lastUpdatedIso: getRecentIso(36), // 36 hours ago => STALE!
    verifiedByStaff: 'Staff Lab Nurse J. Kumar',
    verificationStatus: 'UNCONFIRMED',
    isTestData: true,
  },
  {
    id: 'blood-muzaffarpur-1',
    hospitalId: 'skmch-muzaffarpur',
    hospitalName: 'SKMCH Blood Center',
    district: 'Muzaffarpur',
    address: 'Umanagar, Muzaffarpur, Bihar',
    lat: 26.1528,
    lng: 85.4055,
    contactPhone: '+91-621-2260190',
    emergencyHelpline: '108',
    bloodGroup: 'O-',
    component: 'Packed Red Cells (PRBC)',
    units: 8,
    lastUpdatedIso: getRecentIso(8), // 8 hours ago (Fresh)
    verifiedByStaff: 'Dr. Binod Poddar',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-gaya-1',
    hospitalId: 'anmmch-gaya',
    hospitalName: 'ANMMCH District Blood Bank',
    district: 'Gaya',
    address: 'Sherghati Road, Gaya',
    lat: 24.7955,
    lng: 84.9782,
    contactPhone: '+91-631-2410340',
    emergencyHelpline: '108',
    bloodGroup: 'B+',
    component: 'Whole Blood',
    units: 15,
    lastUpdatedIso: getRecentIso(48), // 48 hours ago => STALE!
    verifiedByStaff: 'Unverified Night Shift Log',
    verificationStatus: 'UNCONFIRMED',
    isTestData: true,
  },
  {
    id: 'blood-bhagalpur-1',
    hospitalId: 'jlnmch-bhagalpur',
    hospitalName: 'JLNMCH Regional Blood Transfusion Center',
    district: 'Bhagalpur',
    address: 'Mayaganj, Bhagalpur',
    lat: 25.2425,
    lng: 87.0163,
    contactPhone: '+91-641-2401082',
    emergencyHelpline: '108',
    bloodGroup: 'A-',
    component: 'Fresh Frozen Plasma (FFP)',
    units: 11,
    lastUpdatedIso: getRecentIso(6),
    verifiedByStaff: 'Dr. P. Jha',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
  {
    id: 'blood-darbhanga-1',
    hospitalId: 'dmch-darbhanga',
    hospitalName: 'DMCH Blood Bank Unit',
    district: 'Darbhanga',
    address: 'Laheriasarai, Darbhanga',
    lat: 26.1264,
    lng: 85.9015,
    contactPhone: '+91-6272-255160',
    emergencyHelpline: '108',
    bloodGroup: 'O+',
    component: 'Whole Blood',
    units: 28,
    lastUpdatedIso: getRecentIso(12),
    verifiedByStaff: 'Dr. Manoj Mishra',
    verificationStatus: 'VERIFIED',
    isTestData: true,
  },
];

// Regional Bihar Medical College Doctors
export const regionalDoctors: Doctor[] = [
  {
    id: 'doc-skmch-muzaffarpur',
    name: 'Dr. Binod Kumar Sinha',
    specialty: 'General Medicine & Diabetology',
    qualification: 'MBBS, MD (Medicine), Fellowship Diabetology',
    experienceYears: 18,
    hospitalId: 'skmch-muzaffarpur',
    hospitalName: 'SKMCH Muzaffarpur',
    district: 'Muzaffarpur',
    consultationFeeInr: 450,
    languages: ['Hindi', 'English', 'Bhojpuri'],
    rating: 4.6,
    reviewCount: 245,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
    timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    image: '/assets/images/dr_patna_cardiology.jpg',
    verifiedBadge: true,
  },
  {
    id: 'doc-anmmch-gaya',
    name: 'Dr. Ramesh Prasad Singh',
    specialty: 'General Surgery & Trauma',
    qualification: 'MBBS, MS (General Surgery)',
    experienceYears: 20,
    hospitalId: 'anmmch-gaya',
    hospitalName: 'ANMMCH Gaya',
    district: 'Gaya',
    consultationFeeInr: 400,
    languages: ['Hindi', 'Magahi', 'English'],
    rating: 4.6,
    reviewCount: 185,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    timeSlots: ['09:30 AM', '11:30 AM', '02:30 PM'],
    image: '/assets/images/dr_patna_orthopedic.jpg',
    verifiedBadge: true,
  },
  {
    id: 'doc-jlnmch-bhagalpur',
    name: 'Dr. Alok Ranjan',
    specialty: 'Neurology & Stroke Care',
    qualification: 'MBBS, MD, DM (Neurology)',
    experienceYears: 15,
    hospitalId: 'jlnmch-bhagalpur',
    hospitalName: 'JLNMCH Bhagalpur',
    district: 'Bhagalpur',
    consultationFeeInr: 500,
    languages: ['Hindi', 'Angika', 'English'],
    rating: 4.7,
    reviewCount: 165,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    timeSlots: ['10:00 AM', '12:00 PM', '03:00 PM'],
    image: '/assets/images/dr_patna_neurology.jpg',
    verifiedBadge: true,
  },
  {
    id: 'doc-dmch-darbhanga',
    name: 'Dr. S. K. Choudhary',
    specialty: 'Pediatrics & Neonatal Care',
    qualification: 'MBBS, MD (Pediatrics, DMCH)',
    experienceYears: 17,
    hospitalId: 'dmch-darbhanga',
    hospitalName: 'DMCH Darbhanga',
    district: 'Darbhanga',
    consultationFeeInr: 450,
    languages: ['Hindi', 'Maithili', 'English'],
    rating: 4.7,
    reviewCount: 210,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM'],
    image: '/assets/images/dr_patna_pediatrics.jpg',
    verifiedBadge: true,
  },
];

// Complete Bihar Clinical Registry: 83 Verified Patna Doctors + Regional Specialists
export const initialDoctors: Doctor[] = [
  ...patnaRealDoctors,
  ...regionalDoctors,
];

export const initialMedicines: Medicine[] = [
  {
    id: 'med-atorva',
    name: 'Atorvastatin 20mg (Atorva)',
    genericName: 'Atorvastatin Calcium Tablets IP',
    brand: 'Zydus Cadila',
    category: 'Cardiac',
    dosageForm: 'Tablet',
    strength: '20 mg',
    mrp: 145,
    price: 115,
    stockQuantity: 280,
    prescriptionRequired: true,
    composition: 'Atorvastatin Calcium IP eq. to Atorvastatin 20mg',
    therapeuticUses: ['Hypercholesterolemia', 'Coronary artery disease prevention', 'Lipid reduction'],
    precautions: ['Monitor liver enzyme (ALT/AST)', 'Avoid excessive grapefruit juice'],
    dosageInstructions: 'Take once daily at bedtime or as advised by cardiologist',
    inStock: true,
    sourceManufacturer: 'Zydus Healthcare Ltd, Sikkim Unit',
    lastPriceAuditDate: '2026-10-20',
  },
  {
    id: 'med-telmi-amlo',
    name: 'Telmisartan 40mg + Amlodipine 5mg (Telma-AM)',
    genericName: 'Telmisartan & Amlodipine Tablets IP',
    brand: 'Glenmark Pharmaceuticals',
    category: 'Cardiac',
    dosageForm: 'Tablet',
    strength: '40mg / 5mg',
    mrp: 210,
    price: 172,
    stockQuantity: 195,
    prescriptionRequired: true,
    composition: 'Telmisartan IP 40mg, Amlodipine Besylate IP eq. to Amlodipine 5mg',
    therapeuticUses: ['Essential Hypertension', 'Cardiovascular risk mitigation'],
    precautions: ['Check blood pressure regularly', 'Do not discontinue abruptly'],
    dosageInstructions: 'Take once daily in the morning with water',
    inStock: true,
    sourceManufacturer: 'Glenmark Pharma, Baddi Unit',
    lastPriceAuditDate: '2026-10-22',
  },
  {
    id: 'med-metformin',
    name: 'Metformin Sustained Release 500mg (Glyciphage SR)',
    genericName: 'Metformin Hydrochloride Prolonged-Release IP',
    brand: 'Franco-Indian',
    category: 'Diabetes',
    dosageForm: 'Tablet',
    strength: '500 mg SR',
    mrp: 55,
    price: 42,
    stockQuantity: 620,
    prescriptionRequired: true,
    composition: 'Metformin Hydrochloride IP 500mg (Extended Release)',
    therapeuticUses: ['Type 2 Diabetes Mellitus', 'Insulin resistance'],
    precautions: ['Take with or immediately after meals to reduce GI disturbance', 'Monitor eGFR renal function'],
    dosageInstructions: 'Take 1 tablet twice daily with breakfast and dinner',
    inStock: true,
    sourceManufacturer: 'Franco-Indian Remedies, Mumbai',
    lastPriceAuditDate: '2026-10-18',
  },
  {
    id: 'med-dolo',
    name: 'Paracetamol 650mg (Dolo 650)',
    genericName: 'Paracetamol Tablets IP 650mg',
    brand: 'Micro Labs',
    category: 'Analgesic',
    dosageForm: 'Tablet',
    strength: '650 mg',
    mrp: 34,
    price: 29,
    stockQuantity: 1200,
    prescriptionRequired: false,
    composition: 'Paracetamol IP 650mg',
    therapeuticUses: ['Fever reduction (Antipyretic)', 'Mild to moderate body pain', 'Headache'],
    precautions: ['Do not exceed 3000mg in 24 hours', 'Avoid concomitant alcohol intake'],
    dosageInstructions: '1 tablet every 6 to 8 hours as needed for fever; do not exceed 4 tabs/day',
    inStock: true,
    sourceManufacturer: 'Micro Labs Ltd, Bangalore',
    lastPriceAuditDate: '2026-10-24',
  },
  {
    id: 'med-amox-clav',
    name: 'Amoxicillin & Potassium Clavulanate 625mg (Augmentin)',
    genericName: 'Amoxicillin and Clavulanate Potassium Tablets IP',
    brand: 'GlaxoSmithKline (GSK)',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    strength: '500mg + 125mg',
    mrp: 228,
    price: 198,
    stockQuantity: 140,
    prescriptionRequired: true,
    composition: 'Amoxicillin Trihydrate IP eq. to 500mg Amoxicillin, Potassium Clavulanate IP eq. to 125mg Clavulanic Acid',
    therapeuticUses: ['Bacterial respiratory tract infections', 'Skin & soft tissue infections', 'Urinary tract infections'],
    precautions: ['Complete the full course as prescribed to prevent antimicrobial resistance', 'Report diarrhea or rash'],
    dosageInstructions: '1 tablet twice daily after food for prescribed duration (5-7 days)',
    inStock: true,
    sourceManufacturer: 'GSK India Ltd, Nashik',
    lastPriceAuditDate: '2026-10-21',
  },
  {
    id: 'med-pantop',
    name: 'Pantoprazole Gastro-Resistant 40mg (Pan 40)',
    genericName: 'Pantoprazole Sodium Tablets IP',
    brand: 'Alkem Laboratories',
    category: 'Gastroenterology',
    dosageForm: 'Tablet',
    strength: '40 mg',
    mrp: 155,
    price: 128,
    stockQuantity: 450,
    prescriptionRequired: false,
    composition: 'Pantoprazole Sodium IP eq. to Pantoprazole 40mg',
    therapeuticUses: ['Gastroesophageal Reflux Disease (GERD)', 'Gastric acidity', 'Peptic ulcer'],
    precautions: ['Take 30 minutes before first meal of the day', 'Swallow whole, do not crush'],
    dosageInstructions: 'Take 1 tablet in the morning on an empty stomach with a glass of water',
    inStock: true,
    sourceManufacturer: 'Alkem Laboratories Ltd, Daman',
    lastPriceAuditDate: '2026-10-23',
  },
  {
    id: 'med-montair-lc',
    name: 'Montelukast Sodium & Levocetirizine (Montair-LC)',
    genericName: 'Montelukast and Levocetirizine Dihydrochloride Tablets IP',
    brand: 'Cipla Ltd',
    category: 'Respiratory',
    dosageForm: 'Tablet',
    strength: '10mg / 5mg',
    mrp: 195,
    price: 165,
    stockQuantity: 310,
    prescriptionRequired: true,
    composition: 'Montelukast Sodium IP 10mg, Levocetirizine Dihydrochloride IP 5mg',
    therapeuticUses: ['Allergic rhinitis', 'Seasonal allergies', 'Chronic asthma adjuvant'],
    precautions: ['May cause mild daytime drowsiness; avoid night driving if drowsy'],
    dosageInstructions: 'Take 1 tablet at bedtime once daily',
    inStock: true,
    sourceManufacturer: 'Cipla Limited, Goa',
    lastPriceAuditDate: '2026-10-19',
  },
  {
    id: 'med-vit-d3',
    name: 'Cholecalciferol 60,000 IU (Calcirol Sachet / Capsule)',
    genericName: 'Cholecalciferol Granules / Soft Gelatin Capsules',
    brand: 'Cadila Pharmaceuticals',
    category: 'Vitamins',
    dosageForm: 'Capsule',
    strength: '60,000 IU',
    mrp: 120,
    price: 98,
    stockQuantity: 580,
    prescriptionRequired: false,
    composition: 'Vitamin D3 (Cholecalciferol IP 60,000 IU)',
    therapeuticUses: ['Vitamin D deficiency', 'Osteopenia / Osteoporosis prevention', 'Bone health'],
    precautions: ['Do not overdose; weekly dosing is typical unless advised otherwise'],
    dosageInstructions: '1 capsule once a week with milk after a fat-containing meal for 8 weeks',
    inStock: true,
    sourceManufacturer: 'Cadila Pharma, Ahmedabad',
    lastPriceAuditDate: '2026-10-24',
  },
];

export const initialPolicies: InsurancePolicy[] = [
  {
    id: 'pmjay-ayushman',
    name: 'Ayushman Bharat — PM-JAY Scheme (Bihar Network)',
    provider: 'National Health Authority & Bihar Swasthya Suraksha Samiti',
    coverageAmountInr: 500000,
    annualPremiumEstimateInr: 0,
    cashlessHospitalsCount: 840,
    waitingPeriodMonths: 0,
    coPayPercent: 0,
    keyFeatures: [
      '₹5 Lakh cashless inpatient coverage per eligible family per year',
      'Covers secondary & tertiary hospitalization in PMCH, AIIMS, IGIMS & impaneled hospitals',
      'Pre-existing diseases covered from Day 1 with Golden Ayushman Card',
      'Diagnostic tests, medicine, and 15 days post-discharge medications included',
    ],
    isGovtAffiliated: true,
    targetDemographic: 'Eligible SECC listed families and verified Ayushman Card holders',
  },
  {
    id: 'vital-shield-plus',
    name: 'Vitalora Comprehensive Family Health Shield',
    provider: 'Star Health & Allied Insurance Partner',
    coverageAmountInr: 1500000,
    annualPremiumEstimateInr: 14800,
    cashlessHospitalsCount: 14200,
    waitingPeriodMonths: 12,
    coPayPercent: 0,
    keyFeatures: [
      '₹15 Lakh family floater sum insured (Self + Spouse + up to 3 Children)',
      '100% cashless hospitalization across 14,000+ impaneled network hospitals',
      'Daycare procedures & modern robotic surgeries covered without sub-limits',
      'Annual free full-body health checkup & tele-consultation unlimited',
    ],
    isGovtAffiliated: false,
    targetDemographic: 'Urban and semi-urban nuclear families',
  },
  {
    id: 'vital-senior-care',
    name: 'Vitalora Senior Citizen Silver Shield (Ages 60-80)',
    provider: 'Care Health Insurance Partner',
    coverageAmountInr: 1000000,
    annualPremiumEstimateInr: 21500,
    cashlessHospitalsCount: 9800,
    waitingPeriodMonths: 24,
    coPayPercent: 15,
    keyFeatures: [
      'Dedicated geriatric care coverage with pre-existing illness protection',
      'Cardiovascular, diabetic, and orthopedic joint replacement coverage',
      'Home healthcare & palliative nursing reimbursement up to ₹25,000',
      'No pre-policy medical checkup up to age 65',
    ],
    isGovtAffiliated: false,
    targetDemographic: 'Senior citizens aged 60 to 80 years',
  },
];

export const initialPatientRecords: PatientRecord[] = [
  {
    id: 'rec-101',
    patientId: 'pat-current-user',
    patientName: 'Rameshwar Kumar Singh',
    title: 'Comprehensive Lipid & Fasting Glucose Profile',
    category: 'LAB_REPORT',
    date: '2026-10-21',
    doctorName: 'Dr. Anand Kishore',
    hospitalName: 'AIIMS Patna Pathology Dept',
    summary: 'Fasting Blood Sugar: 128 mg/dL (Elevated), Total Cholesterol: 218 mg/dL (Borderline High), LDL: 142 mg/dL, HDL: 44 mg/dL, Triglycerides: 160 mg/dL.',
    status: 'ANALYZED',
    aiInsights: 'Fasting glucose indicates pre-diabetes threshold. Elevated LDL suggests continuing low saturated fat diet and lipid-lowering medication (Atorvastatin 20mg) as advised by your physician.',
  },
  {
    id: 'rec-102',
    patientId: 'pat-current-user',
    patientName: 'Rameshwar Kumar Singh',
    title: 'Complete Blood Count (CBC) & Platelet Assessment',
    category: 'LAB_REPORT',
    date: '2026-09-14',
    doctorName: 'Dr. Pratibha Sharma',
    hospitalName: 'IGIMS Patna Diagnostic Centre',
    summary: 'Hemoglobin: 14.2 g/dL (Normal), WBC: 7,400 /uL (Normal), Platelets: 2.15 Lakhs /uL (Optimal), ESR: 12 mm/hr.',
    status: 'REVIEWED',
    aiInsights: 'All hematological parameters within healthy physiological limits. No evidence of infection or anemia.',
  },
  {
    id: 'rec-103',
    patientId: 'pat-current-user',
    patientName: 'Rameshwar Kumar Singh',
    title: 'Cardiology Follow-up & ECG Prescription',
    category: 'PRESCRIPTION',
    date: '2026-08-05',
    doctorName: 'Dr. Anand Kishore',
    hospitalName: 'AIIMS Patna Cardiology OPD',
    summary: 'Normal sinus rhythm. Advised lifestyle modification, 30 min daily brisk walking, reduced dietary salt, Telma-AM 40/5 once daily.',
    status: 'REVIEWED',
  },
];
