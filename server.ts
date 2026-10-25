import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  initialBloodInventory,
  initialHospitals,
  initialDoctors,
  initialMedicines,
  initialPolicies,
  initialPatientRecords,
  BloodInventoryItem,
  PatientRecord,
} from './src/data/mockHealthcareData.js';
import {
  patnaBloodInventory,
  initialUrgentBloodRequests,
  registeredPatnaDonors,
  patnaBloodBanksDirectory,
  upcomingDonationCamps,
  UrgentBloodRequest,
  RegisteredDonor,
  BloodBankDirectoryEntry,
  BloodDonationCamp,
} from './src/data/patnaBloodData.js';
import {
  calculateAuthoritativeCart,
  computeTriageLevel,
  isInventoryStale,
  CartItem,
} from './src/utils/healthcareLogic.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// In-Memory Database Stores (seeded with verified Patna and regional dataset)
let bloodInventory: BloodInventoryItem[] = [...patnaBloodInventory, ...initialBloodInventory.filter(b => !patnaBloodInventory.some(p => p.id === b.id))];
let activeUrgentRequests: UrgentBloodRequest[] = [...initialUrgentBloodRequests];
let registeredDonorsList: RegisteredDonor[] = [...registeredPatnaDonors];
const bloodBanksDirectory: BloodBankDirectoryEntry[] = [...patnaBloodBanksDirectory];
let donationCampsList: BloodDonationCamp[] = [...upcomingDonationCamps];

const hospitals = [...initialHospitals];
const doctors = [...initialDoctors];
const medicines = [...initialMedicines];
const policies = [...initialPolicies];
let patientRecords: PatientRecord[] = [...initialPatientRecords];

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  specialty: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFeeInr: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const appointments: Appointment[] = [
  {
    id: 'apt-901',
    doctorId: 'doc-1',
    doctorName: 'Dr. Anand Kishore',
    hospitalName: 'AIIMS Patna',
    specialty: 'Cardiology & Critical Care',
    patientName: 'Rameshwar Kumar Singh',
    patientPhone: '+91-9876543210',
    appointmentDate: '2026-10-28',
    appointmentTime: '11:00 AM',
    consultationFeeInr: 600,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  },
];

interface PharmacyOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  gst: number;
  deliveryFee: number;
  grandTotal: number;
  requiresPrescription: boolean;
  prescriptionUploaded: boolean;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'DISPATCHED' | 'DELIVERED';
  paymentStatus: 'PAID_ONLINE' | 'CASH_ON_DELIVERY';
  createdAt: string;
}

const orders: PharmacyOrder[] = [];

interface BloodRequest {
  id: string;
  requestToken: string;
  patientName: string;
  patientAge: number;
  attendantPhone: string;
  bloodGroup: string;
  component: string;
  unitsRequested: number;
  hospitalName: string;
  district: string;
  urgency: 'CRITICAL_IMMEDIATE' | 'WITHIN_24_HOURS' | 'ELECTIVE_SURGERY';
  status: 'DISPATCHED_TO_BLOOD_BANK' | 'ACCEPTED' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
  isTestData: boolean;
}

const bloodRequests: BloodRequest[] = [];

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyName: string;
  patientName: string;
  hospitalName: string;
  admissionDate: string;
  dischargeDate: string;
  claimedAmountInr: number;
  approvedAmountInr?: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENT_VERIFIED' | 'APPROVED' | 'SETTLED' | 'REJECTED';
  diagnosis: string;
  documentsUploaded: string[];
  createdAt: string;
}

const insuranceClaims: InsuranceClaim[] = [
  {
    id: 'clm-301',
    claimNumber: 'CLM-VTR-2026-8812',
    policyId: 'vital-shield-plus',
    policyName: 'Vitalora Comprehensive Family Health Shield',
    patientName: 'Rameshwar Kumar Singh',
    hospitalName: 'AIIMS Patna',
    admissionDate: '2026-09-12',
    dischargeDate: '2026-09-15',
    claimedAmountInr: 45000,
    approvedAmountInr: 45000,
    status: 'SETTLED',
    diagnosis: 'Acute Coronary Syndrome Observation & Angiogram Evaluation',
    documentsUploaded: ['Discharge_Summary_AIIMS.pdf', 'Final_Bill_Receipt.pdf'],
    createdAt: '2026-09-18T10:30:00Z',
  },
];

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

const auditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: new Date().toISOString(),
    userId: 'usr-admin-1',
    userRole: 'ADMIN',
    action: 'SYSTEM_BOOT',
    resource: 'DATABASE',
    details: 'VITALORA Healthcare Node initialized with verified Bihar health networks and AI safeguards.',
    ipAddress: '127.0.0.1',
  },
];

function logAudit(userId: string, userRole: string, action: string, resource: string, details: string) {
  auditLogs.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId,
    userRole,
    action,
    resource,
    details,
    ipAddress: '127.0.0.1',
  });
}

// ----------------- GEMINI TOOL DEFINITIONS -----------------
const geminiTools = [
  {
    functionDeclarations: [
      {
        name: 'search_blood_availability',
        description: 'Queries verified Bihar blood banks for blood units by group, component, and district/location. Returns verified inventory, freshness timestamp, and hospital contact.',
        parameters: {
          type: 'OBJECT',
          properties: {
            blood_group: {
              type: 'STRING',
              description: 'Blood group to search, e.g. O-, O+, A-, A+, B-, B+, AB-, AB+',
            },
            component: {
              type: 'STRING',
              description: 'Component: Whole Blood, Packed Red Cells (PRBC), Platelets (RDP/SDP), or Fresh Frozen Plasma (FFP)',
            },
            district: {
              type: 'STRING',
              description: 'District in Bihar, e.g. Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga',
            },
          },
        },
      },
      {
        name: 'search_hospitals',
        description: 'Searches verified hospitals in Bihar by district, department, or 24x7 emergency service availability.',
        parameters: {
          type: 'OBJECT',
          properties: {
            district: { type: 'STRING', description: 'District in Bihar (e.g. Patna, Gaya, Muzaffarpur)' },
            department: { type: 'STRING', description: 'Clinical department (e.g. Cardiology, Oncology, Emergency, Trauma)' },
            emergency_only: { type: 'BOOLEAN', description: 'Only show hospitals with 24x7 emergency & trauma facilities' },
          },
        },
      },
      {
        name: 'search_doctors',
        description: 'Searches verified medical doctors and specialists by specialty, district, or hospital.',
        parameters: {
          type: 'OBJECT',
          properties: {
            specialty: { type: 'STRING', description: 'Medical specialty, e.g. Cardiology, Neurology, Orthopedics, Oncology, General Medicine' },
            district: { type: 'STRING', description: 'District in Bihar (e.g. Patna, Muzaffarpur)' },
          },
        },
      },
      {
        name: 'search_medicines',
        description: 'Searches authoritative pharmaceutical catalog for medicine brand, generic name, category, or indication.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Medicine brand or generic name, e.g. Atorvastatin, Metformin, Dolo, Augmentin, Pan 40' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_user_appointments',
        description: 'Retrieves currently scheduled verified appointments for the active patient.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
      {
        name: 'get_authorized_patient_reports',
        description: 'Retrieves authorized laboratory and diagnostic test reports for the active patient.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
    ],
  },
];

// Tool execution handlers
function executeToolCall(name: string, args: Record<string, any>) {
  if (name === 'search_blood_availability') {
    let results = bloodInventory;
    if (args.blood_group) {
      const bg = args.blood_group.toUpperCase().trim();
      results = results.filter(b => b.bloodGroup === bg);
    }
    if (args.district) {
      const dist = args.district.toLowerCase().trim();
      results = results.filter(b => b.district.toLowerCase().includes(dist));
    }
    if (args.component) {
      const comp = args.component.toLowerCase().trim();
      results = results.filter(b => b.component.toLowerCase().includes(comp));
    }

    return results.map(r => {
      const freshness = isInventoryStale(r.lastUpdatedIso);
      return {
        hospital: r.hospitalName,
        district: r.district,
        address: r.address,
        bloodGroup: r.bloodGroup,
        component: r.component,
        availableUnits: r.units,
        verificationStatus: r.verificationStatus,
        lastUpdated: r.lastUpdatedIso,
        freshness: freshness.freshnessLabel,
        isStaleData: freshness.isStale,
        contactPhone: r.contactPhone,
        emergencyHelpline: r.emergencyHelpline,
        note: r.isTestData ? 'Pilot Network Node (Verified Sample)' : 'Official Bihar State Register',
      };
    });
  }

  if (name === 'search_hospitals') {
    let results = hospitals;
    if (args.district) {
      const dist = args.district.toLowerCase().trim();
      results = results.filter(h => h.district.toLowerCase().includes(dist) || h.city.toLowerCase().includes(dist));
    }
    if (args.department) {
      const dept = args.department.toLowerCase().trim();
      results = results.filter(h => h.departments.some(d => d.toLowerCase().includes(dept)));
    }
    if (args.emergency_only) {
      results = results.filter(h => h.emergencyServices24x7);
    }
    return results.map(h => ({
      name: h.name,
      category: h.category,
      district: h.district,
      address: h.address,
      phone: h.phone,
      emergencyPhone: h.emergencyPhone,
      icuBeds: h.icuBedsAvailable,
      departments: h.departments,
      rating: h.rating,
    }));
  }

  if (name === 'search_doctors') {
    let results = doctors;
    if (args.specialty) {
      const spec = args.specialty.toLowerCase().trim();
      results = results.filter(d => d.specialty.toLowerCase().includes(spec));
    }
    if (args.district) {
      const dist = args.district.toLowerCase().trim();
      results = results.filter(d => d.district.toLowerCase().includes(dist));
    }
    return results.map(d => ({
      name: d.name,
      specialty: d.specialty,
      qualification: d.qualification,
      experience: `${d.experienceYears} years`,
      hospital: d.hospitalName,
      consultationFee: `₹${d.consultationFeeInr}`,
      rating: d.rating,
      availableDays: d.availableDays,
    }));
  }

  if (name === 'search_medicines') {
    const q = (args.query || '').toLowerCase().trim();
    const results = medicines.filter(
      m => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
    return results.map(m => ({
      name: m.name,
      generic: m.genericName,
      brand: m.brand,
      category: m.category,
      strength: m.strength,
      mrp: `₹${m.mrp}`,
      price: `₹${m.price}`,
      stock: m.stockQuantity > 0 ? `${m.stockQuantity} units available` : 'Out of stock',
      prescriptionRequired: m.prescriptionRequired,
      dosageInstructions: m.dosageInstructions,
      precautions: m.precautions,
    }));
  }

  if (name === 'get_user_appointments') {
    return appointments.map(a => ({
      doctor: a.doctorName,
      specialty: a.specialty,
      hospital: a.hospitalName,
      date: a.appointmentDate,
      time: a.appointmentTime,
      status: a.status,
    }));
  }

  if (name === 'get_authorized_patient_reports') {
    return patientRecords.map(r => ({
      title: r.title,
      category: r.category,
      date: r.date,
      hospital: r.hospitalName,
      summary: r.summary,
      aiInsights: r.aiInsights,
    }));
  }

  return { error: `Tool ${name} not recognized` };
}

// ----------------- API ROUTES -----------------

// 1. Multilingual Gemini Health Assistant Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], triageVitals = null } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    logAudit('current-user', 'PATIENT', 'CHAT_CONSULT', 'GEMINI_AI', `Query: ${message.slice(0, 100)}`);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build system instruction
    const systemInstruction = `
You are the VITALORA Clinical Health Assistant, an empathetic, highly knowledgeable medical guidance system.
VITALORA is a premium healthcare ecosystem serving patients, doctors, and hospitals, with deep integration into the Bihar healthcare network (AIIMS Patna, PMCH, IGIMS, Mahavir Cancer Sansthan, etc.).

KEY PRINCIPLES & GUIDELINES:
1. MULTILINGUAL PROFICIENCY:
   - Understand and respond fluently in English, Hindi (हिन्दी), and conversational Hinglish (e.g. "Patna ke aas-paas O-negative blood kahan available hai?").
   - Respond in the language or dialect used by the user, or provide bilingual clarification if helpful.

2. REAL DATA FIRST — NEVER FABRICATE:
   - ALWAYS use available tools to query real blood availability, doctors, hospitals, medicines, and appointments.
   - Never invent blood units, doctor names, hospital beds, medicine prices, or fake availability.
   - If blood stock was updated >24 hours ago, explicitly notify the user: "This record is unconfirmed/stale; please verify directly with the hospital before traveling."

3. EMERGENCY & TRIAGE SAFEGUARDS:
   - For acute life-threatening symptoms (crushing chest pain, severe shortness of breath, sudden facial drooping/speech loss, heavy hemorrhaging), immediately advise calling emergency services (108 / 112 in Bihar/India) and presenting to the nearest emergency trauma center.
   - Always state: "I provide clinical guidance and health education, not an in-person diagnostic replacement."

4. CONTEXTUAL NAVIGATION TAGS:
   Include appropriate navigation tags at the bottom of your message so the UI can offer interactive quick-actions:
   - [NAVIGATE:blood-band] -> For blood bank searches, donor requests, emergency availability
   - [NAVIGATE:doctors] -> For doctor appointments, specialist finder
   - [NAVIGATE:pharmacy] -> For purchasing medicines, checking prices, cart
   - [NAVIGATE:records] -> For lab reports, medical records, uploading prescriptions
   - [NAVIGATE:anatomy] -> For 3D human anatomy inspection, organ systems, physiological insights
   - [NAVIGATE:insurance] -> For Ayushman PM-JAY / health insurance claims
`;

    // Initialize model
    // In @google/genai, gemini-3.8-flash is the standard recommended model
    const contents: any[] = [];

    // Add recent history if provided
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: geminiTools as any,
        temperature: 0.3,
      },
    });

    let toolCallsExecuted: any[] = [];
    let finalAnswer = '';

    // Check if function calls were requested
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      const functionCalls = parts.filter((p: any) => p.functionCall);

      if (functionCalls.length > 0) {
        // Execute tool calls
        const toolResponses: any[] = [];
        for (const fc of functionCalls) {
          if (!fc.functionCall) continue;
          const fnName = fc.functionCall.name || '';
          const fnArgs = (fc.functionCall.args as Record<string, any>) || {};
          const result = executeToolCall(fnName, fnArgs);
          toolCallsExecuted.push({ name: fnName, args: fnArgs, result });
          toolResponses.push({
            functionResponse: {
              name: fnName,
              response: { result },
            },
          });
        }

        // Send tool results back to Gemini for final user-friendly answer
        const followUpContents = [
          ...contents,
          { role: 'model', parts },
          { role: 'user', parts: toolResponses },
        ];

        const followUpResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: followUpContents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        finalAnswer = followUpResponse.text || 'I checked the medical database for you.';
      } else {
        finalAnswer = response.text || 'I am ready to assist with your health inquiry.';
      }
    } else {
      finalAnswer = response.text || 'I am here to assist you with your health query.';
    }

    // Extract navigation actions
    const navRegex = /\[NAVIGATE:([a-z-]+)\]/g;
    const navigationActions: string[] = [];
    let match;
    while ((match = navRegex.exec(finalAnswer)) !== null) {
      if (!navigationActions.includes(match[1])) {
        navigationActions.push(match[1]);
      }
    }

    // Clean navigation tags from visible text if desired, or leave them nicely parsed
    const cleanText = finalAnswer.replace(/\[NAVIGATE:[a-z-]+\]/g, '').trim();

    return res.json({
      answer: cleanText,
      navigationActions,
      toolCalls: toolCallsExecuted,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({
      error: 'Failed to process AI health consultation',
      details: err.message,
    });
  }
});

// 2. Gemini Medical Document & Lab Report Analyzer
app.post('/api/gemini/analyze-report', async (req, res) => {
  try {
    const { reportText, imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!reportText && !imageBase64) {
      return res.status(400).json({ error: 'Either reportText or imageBase64 is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert Clinical Laboratory & Diagnostic Report Analyst.
Analyze the following medical report carefully and output a structured clinical interpretation in clear, empathetic language.
Provide explanations in both English and Hindi.

Format your response as a valid JSON object matching this schema:
{
  "reportTitle": "e.g. Complete Blood Count (CBC) or Lipid Panel",
  "patientIndicators": [
    {
      "parameter": "e.g. Hemoglobin or Fasting Glucose",
      "observedValue": "e.g. 11.2 g/dL",
      "referenceRange": "e.g. 13.0 - 17.0 g/dL",
      "status": "NORMAL | ELEVATED | LOW | CRITICAL",
      "interpretation": "Brief plain-language explanation of what this marker indicates"
    }
  ],
  "overallSummaryEnglish": "Comprehensive clinical summary in English explaining key findings and healthy next steps",
  "overallSummaryHindi": "Comprehensive clinical summary in Hindi (हिन्दी) for patient understanding",
  "questionsForDoctor": ["2-3 specific questions the patient should ask their consulting doctor"],
  "emergencyRedFlagsPresent": false,
  "disclaimer": "This analysis is for health education and preliminary review. Always review official reports with your consulting physician."
}

Do not wrap in markdown quotes; return raw JSON only.
`;

    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    if (reportText) {
      parts.push({ text: `Report Text:\n${reportText}` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Save as analyzed record in patient records
    const newRecord: PatientRecord = {
      id: `rec-${Date.now()}`,
      patientId: 'pat-current-user',
      patientName: 'Rameshwar Kumar Singh',
      title: parsed.reportTitle || 'Uploaded Medical Diagnostic Report',
      category: 'LAB_REPORT',
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Clinical Lab AI Review',
      hospitalName: 'VITALORA Verified Lab Vault',
      summary: parsed.overallSummaryEnglish || 'Report processed successfully.',
      status: 'ANALYZED',
      aiInsights: `${parsed.overallSummaryEnglish}\n\n[हिन्दी]: ${parsed.overallSummaryHindi || ''}`,
    };
    patientRecords.unshift(newRecord);

    logAudit('current-user', 'PATIENT', 'ANALYZE_REPORT', 'MEDICAL_RECORDS', `Analyzed: ${newRecord.title}`);

    return res.json({
      success: true,
      analysis: parsed,
      record: newRecord,
    });
  } catch (err: any) {
    console.error('Report Analysis Error:', err);
    return res.status(500).json({ error: 'Failed to analyze diagnostic report', details: err.message });
  }
});

// 3. Bihar Blood Band Network Endpoints
app.get('/api/blood-bank/inventory', (req, res) => {
  const { bloodGroup, component, district } = req.query;
  let items = [...bloodInventory];

  if (bloodGroup && typeof bloodGroup === 'string') {
    items = items.filter(i => i.bloodGroup === bloodGroup.toUpperCase().trim());
  }
  if (district && typeof district === 'string') {
    items = items.filter(i => i.district.toLowerCase() === district.toLowerCase().trim());
  }
  if (component && typeof component === 'string') {
    items = items.filter(i => i.component.toLowerCase().includes(component.toLowerCase().trim()));
  }

  // Calculate freshness for each item
  const enriched = items.map(item => {
    const freshness = isInventoryStale(item.lastUpdatedIso);
    return {
      ...item,
      freshnessLabel: freshness.freshnessLabel,
      isStale: freshness.isStale,
      hoursElapsed: freshness.hoursElapsed,
    };
  });

  res.json({
    items: enriched,
    totalNodes: enriched.length,
    lastNetworkSync: new Date().toISOString(),
  });
});

// Authorized Staff Inventory Update
app.post('/api/blood-bank/update', (req, res) => {
  const { id, units, staffName, hospitalCode } = req.body;

  if (!id || units === undefined || !staffName) {
    return res.status(400).json({ error: 'Missing required inventory update parameters' });
  }

  const idx = bloodInventory.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Blood bank unit record not found' });
  }

  const prevUnits = bloodInventory[idx].units;
  const newUnits = Math.max(0, parseInt(units, 10));

  bloodInventory[idx] = {
    ...bloodInventory[idx],
    units: newUnits,
    lastUpdatedIso: new Date().toISOString(),
    verifiedByStaff: staffName,
    verificationStatus: 'VERIFIED',
  };

  logAudit(
    staffName,
    'HOSPITAL_STAFF',
    'UPDATE_BLOOD_INVENTORY',
    'BLOOD_BANK',
    `Updated ${bloodInventory[idx].hospitalName} ${bloodInventory[idx].bloodGroup} (${bloodInventory[idx].component}) units from ${prevUnits} to ${newUnits}`
  );

  res.json({
    success: true,
    message: 'Blood inventory record verified and updated successfully',
    updatedItem: bloodInventory[idx],
  });
});

// Emergency Blood Request Requisition
app.get('/api/blood-bank/requests', (req, res) => {
  const { bloodGroup, status, district } = req.query;
  let results = [...activeUrgentRequests];

  if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup !== 'All') {
    results = results.filter(r => r.bloodGroup === bloodGroup.toUpperCase().trim());
  }
  if (district && typeof district === 'string' && district !== 'All') {
    results = results.filter(r => r.district.toLowerCase() === district.toLowerCase().trim());
  }
  if (status && typeof status === 'string' && status !== 'All') {
    results = results.filter(r => r.status === status);
  }

  res.json({
    requests: results,
    totalCount: results.length,
    activeCount: results.filter(r => r.status === 'ACTIVE_SEARCHING').length,
  });
});

app.post('/api/blood-bank/request', (req, res) => {
  const {
    patientName,
    patientAge,
    attendantName,
    attendantPhone,
    bloodGroup,
    component,
    unitsRequested,
    hospitalName,
    district,
    reason,
    urgency,
  } = req.body;

  if (!patientName || !attendantPhone || !bloodGroup || !unitsRequested) {
    return res.status(400).json({ error: 'Required requisition fields missing' });
  }

  const token = `VTR-BLD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newReq: UrgentBloodRequest = {
    id: `req-${Date.now()}`,
    requestToken: token,
    patientName,
    patientAge: parseInt(patientAge, 10) || 35,
    bloodGroup: bloodGroup as any,
    component: component || 'Packed Red Cells (PRBC)',
    unitsRequested: parseInt(unitsRequested, 10) || 1,
    unitsFulfilled: 0,
    hospitalName: hospitalName || 'Patna Regional Medical Center',
    district: district || 'Patna',
    attendantName: attendantName || 'Attendant',
    attendantPhone,
    reason: reason || 'Emergency surgical/medical blood requirement',
    urgency: urgency || 'CRITICAL_IMMEDIATE',
    status: 'ACTIVE_SEARCHING',
    createdAtIso: new Date().toISOString(),
  };

  activeUrgentRequests.unshift(newReq);
  logAudit(
    attendantPhone,
    'PATIENT',
    'CREATE_BLOOD_REQUISITION',
    'BLOOD_BANK',
    `Emergency request ${token} for ${bloodGroup} (${newReq.unitsRequested} units) at ${newReq.hospitalName}`
  );

  res.json({
    success: true,
    requestToken: token,
    request: newReq,
    message: `Emergency Requisition #${token} transmitted to authorized blood banks and local donor network.`,
  });
});

app.post('/api/blood-bank/requests/:id/respond', (req, res) => {
  const { id } = req.params;
  const { donorName, donorPhone, donorBloodGroup } = req.body;

  const idx = activeUrgentRequests.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Urgent requisition not found' });
  }

  const reqItem = activeUrgentRequests[idx];
  const newFulfilled = Math.min(reqItem.unitsRequested, reqItem.unitsFulfilled + 1);
  const newStatus = newFulfilled >= reqItem.unitsRequested ? 'ARRANGED' : 'DONOR_EN_ROUTE';

  activeUrgentRequests[idx] = {
    ...reqItem,
    unitsFulfilled: newFulfilled,
    status: newStatus,
  };

  logAudit(
    donorPhone || 'anonymous-donor',
    'DONOR',
    'PLEDGE_BLOOD_DONATION',
    'BLOOD_BANK',
    `Donor ${donorName || 'Volunteer'} responded to SOS ${reqItem.requestToken} (${reqItem.bloodGroup})`
  );

  res.json({
    success: true,
    message: `Thank you ${donorName || 'Donor'}! Your response has been dispatched to the attendant at ${reqItem.hospitalName}.`,
    updatedRequest: activeUrgentRequests[idx],
  });
});

// Voluntary Donors Directory
app.get('/api/blood-bank/donors', (req, res) => {
  const { bloodGroup, locality } = req.query;
  let results = [...registeredDonorsList];

  if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup !== 'All') {
    results = results.filter(d => d.bloodGroup === bloodGroup.toUpperCase().trim());
  }
  if (locality && typeof locality === 'string' && locality !== 'All') {
    results = results.filter(d => d.locality.toLowerCase().includes(locality.toLowerCase().trim()));
  }

  res.json({
    donors: results,
    totalCount: results.length,
    availableNowCount: results.filter(d => d.isAvailableNow).length,
  });
});

app.post('/api/blood-bank/donors', (req, res) => {
  const {
    fullName,
    bloodGroup,
    age,
    gender,
    weightKg,
    locality,
    phone,
    isWhatsappAvailable,
    availabilityMode,
  } = req.body;

  if (!fullName || !bloodGroup || !phone || !locality) {
    return res.status(400).json({ error: 'Name, blood group, contact phone, and locality are required.' });
  }

  const newDonor: RegisteredDonor = {
    id: `dnr-${Date.now()}`,
    fullName,
    bloodGroup: bloodGroup as any,
    age: parseInt(age, 10) || 28,
    gender: gender || 'Male',
    weightKg: parseInt(weightKg, 10) || 65,
    locality,
    city: 'Patna',
    phone,
    isWhatsappAvailable: !!isWhatsappAvailable,
    totalDonations: 1,
    lastDonationDate: new Date().toISOString().split('T')[0],
    isAvailableNow: true,
    availabilityMode: availabilityMode || 'Immediate SOS & Planned',
    verifiedBadge: true,
  };

  registeredDonorsList.unshift(newDonor);
  logAudit(
    phone,
    'DONOR',
    'REGISTER_VOLUNTARY_DONOR',
    'BLOOD_BANK',
    `Registered voluntary donor: ${fullName} (${bloodGroup}) in ${locality}`
  );

  res.json({
    success: true,
    donor: newDonor,
    message: 'Registered successfully in the Patna & Bihar Voluntary Donor Registry!',
  });
});

// Official Blood Banks Directory
app.get('/api/blood-bank/directory', (req, res) => {
  const { district } = req.query;
  let results = [...bloodBanksDirectory];
  if (district && typeof district === 'string' && district !== 'All') {
    results = results.filter(b => b.district.toLowerCase() === district.toLowerCase().trim());
  }
  res.json({
    directory: results,
    totalCount: results.length,
  });
});

// Blood Donation Camps
app.get('/api/blood-bank/camps', (req, res) => {
  res.json({
    camps: donationCampsList,
    totalCount: donationCampsList.length,
  });
});

app.post('/api/blood-bank/camps/register', (req, res) => {
  const { campId, donorName, donorPhone, bloodGroup, preferredSlot } = req.body;

  if (!campId || !donorName || !donorPhone) {
    return res.status(400).json({ error: 'Camp ID, donor name, and phone are required.' });
  }

  const idx = donationCampsList.findIndex(c => c.id === campId);
  if (idx !== -1) {
    donationCampsList[idx].registeredCount += 1;
  }

  const bookingPass = `CAMP-PASS-${Math.floor(10000 + Math.random() * 90000)}`;

  logAudit(
    donorPhone,
    'DONOR',
    'REGISTER_CAMP_DONATION',
    'BLOOD_BANK',
    `Donor ${donorName} registered for camp ${campId} (Pass: ${bookingPass})`
  );

  res.json({
    success: true,
    bookingPass,
    message: `Camp donation slot confirmed! Your registration pass is #${bookingPass}. Please show this at the camp registration counter.`,
  });
});

// 4. Hospitals & Doctors Endpoints
app.get('/api/hospitals', (req, res) => {
  res.json(hospitals);
});

app.get('/api/doctors', (req, res) => {
  const { specialty, district } = req.query;
  let results = doctors;
  if (specialty && typeof specialty === 'string') {
    results = results.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  if (district && typeof district === 'string') {
    results = results.filter(d => d.district.toLowerCase() === district.toLowerCase());
  }
  res.json(results);
});

app.post('/api/appointments', (req, res) => {
  const { doctorId, patientName, patientPhone, appointmentDate, appointmentTime } = req.body;

  if (!doctorId || !patientName || !patientPhone || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'All appointment fields are required' });
  }

  const doc = doctors.find(d => d.id === doctorId);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    doctorId: doc.id,
    doctorName: doc.name,
    hospitalName: doc.hospitalName,
    specialty: doc.specialty,
    patientName,
    patientPhone,
    appointmentDate,
    appointmentTime,
    consultationFeeInr: doc.consultationFeeInr,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  appointments.unshift(appointment);
  logAudit(patientPhone, 'PATIENT', 'BOOK_APPOINTMENT', 'DOCTOR_OPD', `Booked slot with ${doc.name} for ${appointmentDate} at ${appointmentTime}`);

  res.json({
    success: true,
    appointment,
    message: `Appointment confirmed with ${doc.name} at ${doc.hospitalName}.`,
  });
});

app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// 5. Pharmacy Endpoints
app.get('/api/medicines', (req, res) => {
  res.json(medicines);
});

// Authoritative Cart Calculation (Server verifies every price & tax)
app.post('/api/orders/calculate', (req, res) => {
  const { items = [], discountCode = '' } = req.body;

  // Validate items against authoritative medicines store
  const verifiedItems: CartItem[] = [];
  for (const item of items) {
    const med = medicines.find(m => m.id === item.id);
    if (med) {
      verifiedItems.push({
        id: med.id,
        name: med.name,
        price: med.price, // authoritative server price
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        prescriptionRequired: med.prescriptionRequired,
      });
    }
  }

  let discountPercent = 0;
  if (discountCode.toUpperCase() === 'VITAL10') {
    discountPercent = 10;
  } else if (discountCode.toUpperCase() === 'FIRSTHEALTH') {
    discountPercent = 15;
  }

  const calculation = calculateAuthoritativeCart(verifiedItems, discountPercent);
  res.json({
    items: verifiedItems,
    calculation,
  });
});

// Order Placement
app.post('/api/orders/create', (req, res) => {
  const { items, patientName, patientPhone, deliveryAddress, prescriptionUploaded, paymentMethod } = req.body;

  if (!items || !items.length || !patientName || !patientPhone || !deliveryAddress) {
    return res.status(400).json({ error: 'Missing order details' });
  }

  const verifiedItems: CartItem[] = [];
  for (const item of items) {
    const med = medicines.find(m => m.id === item.id);
    if (med) {
      verifiedItems.push({
        id: med.id,
        name: med.name,
        price: med.price,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        prescriptionRequired: med.prescriptionRequired,
      });
    }
  }

  const calc = calculateAuthoritativeCart(verifiedItems, 0);

  if (calc.requiresPrescription && !prescriptionUploaded) {
    return res.status(400).json({
      error: 'One or more medications in your order require a valid doctor prescription before dispensing under Pharmacy Practice Regulations.',
      requiresPrescription: true,
    });
  }

  const orderNum = `ORD-VTR-${Math.floor(100000 + Math.random() * 900000)}`;
  const order: PharmacyOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    patientName,
    patientPhone,
    deliveryAddress,
    items: verifiedItems,
    subtotal: calc.subtotal,
    discount: calc.discount,
    taxableAmount: calc.taxableAmount,
    gst: calc.gst,
    deliveryFee: calc.deliveryFee,
    grandTotal: calc.grandTotal,
    requiresPrescription: calc.requiresPrescription,
    prescriptionUploaded: Boolean(prescriptionUploaded),
    status: calc.requiresPrescription ? 'PENDING_REVIEW' : 'VERIFIED',
    paymentStatus: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'PAID_ONLINE',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  logAudit(patientPhone, 'PATIENT', 'PLACE_PHARMACY_ORDER', 'PHARMACY', `Placed order ${orderNum} (Total: ₹${order.grandTotal})`);

  res.json({
    success: true,
    order,
    message: `Order #${orderNum} placed successfully. An electronic invoice has been generated.`,
  });
});

// 6. Insurance & Policies Endpoints
app.get('/api/insurance/policies', (req, res) => {
  res.json(policies);
});

app.get('/api/insurance/claims', (req, res) => {
  res.json(insuranceClaims);
});

app.post('/api/insurance/claims', (req, res) => {
  const { policyId, patientName, hospitalName, admissionDate, dischargeDate, claimedAmountInr, diagnosis } = req.body;

  if (!policyId || !patientName || !hospitalName || !claimedAmountInr || !diagnosis) {
    return res.status(400).json({ error: 'All claim requisition fields are required' });
  }

  const pol = policies.find(p => p.id === policyId);
  const claimNum = `CLM-VTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const claim: InsuranceClaim = {
    id: `clm-${Date.now()}`,
    claimNumber: claimNum,
    policyId,
    policyName: pol ? pol.name : 'Health Insurance Policy',
    patientName,
    hospitalName,
    admissionDate: admissionDate || new Date().toISOString().split('T')[0],
    dischargeDate: dischargeDate || new Date().toISOString().split('T')[0],
    claimedAmountInr: parseFloat(claimedAmountInr),
    status: 'SUBMITTED',
    diagnosis,
    documentsUploaded: ['Hospital_Admission_Report.pdf', 'Doctor_Prescription.pdf'],
    createdAt: new Date().toISOString(),
  };

  insuranceClaims.unshift(claim);
  logAudit(patientName, 'PATIENT', 'SUBMIT_INSURANCE_CLAIM', 'INSURANCE', `Submitted claim ${claimNum} for ₹${claimedAmountInr}`);

  res.json({
    success: true,
    claim,
    message: `Claim #${claimNum} submitted for third-party medical review.`,
  });
});

// 7. Patient Health Records Vault
app.get('/api/records', (req, res) => {
  res.json(patientRecords);
});

app.post('/api/records', (req, res) => {
  const { title, category, date, doctorName, hospitalName, summary, aiInsights } = req.body;

  if (!title || !category || !summary) {
    return res.status(400).json({ error: 'Title, category, and summary are required' });
  }

  const record: PatientRecord = {
    id: `rec-${Date.now()}`,
    patientId: 'pat-current-user',
    patientName: 'Rameshwar Kumar Singh',
    title,
    category,
    date: date || new Date().toISOString().split('T')[0],
    doctorName: doctorName || 'Attending Physician',
    hospitalName: hospitalName || 'Clinical Health Centre',
    summary,
    status: 'REVIEWED',
    aiInsights,
  };

  patientRecords.unshift(record);
  logAudit('pat-current-user', 'PATIENT', 'UPLOAD_HEALTH_RECORD', 'MEDICAL_RECORDS', `Uploaded ${title}`);

  res.json({
    success: true,
    record,
  });
});

// 8. Healthcare Audit Trail
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// ----------------- VITE MIDDLEWARE / STATIC FILES -----------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VITALORA Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
