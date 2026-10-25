import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Heart,
  Activity,
  Wind,
  Brain,
  Layers,
  ChevronRight,
  Info,
  Sparkles,
  ShieldAlert,
  RotateCw,
  Search,
  ExternalLink,
} from 'lucide-react';

interface OrganData {
  id: string;
  name: string;
  system: 'Cardiovascular' | 'Respiratory' | 'Nervous' | 'Digestive' | 'Musculoskeletal';
  position: [number, number, number];
  color: number;
  normalRange: string;
  biometricParams: { label: string; value: string; status: 'Optimal' | 'Normal' | 'Alert' }[];
  clinicalOverview: string;
  commonPathologies: string[];
  warningSigns: string[];
  recommendedTests: string[];
  specialtyDoctor: string;
}

const ORGANS: OrganData[] = [
  {
    id: 'heart',
    name: 'Heart (Cardiovascular Central Node)',
    system: 'Cardiovascular',
    position: [-0.15, 0.5, 0.25],
    color: 0xffb547, // Golden warm red/gold
    normalRange: '60 – 100 bpm resting, Systolic BP 90-120 mmHg',
    biometricParams: [
      { label: 'Resting Heart Rate', value: '72 bpm', status: 'Optimal' },
      { label: 'Blood Pressure', value: '118/76 mmHg', status: 'Optimal' },
      { label: 'Ejection Fraction (EF)', value: '60%', status: 'Normal' },
      { label: 'Cardiac Output', value: '5.0 L/min', status: 'Optimal' },
    ],
    clinicalOverview:
      'A four-chambered muscular organ that circulates blood through pulmonary and systemic vascular beds, supplying oxygenated blood to all peripheral tissues.',
    commonPathologies: ['Coronary Artery Disease', 'Hypertensive Heart Disease', 'Atrial Fibrillation', 'Heart Failure'],
    warningSigns: ['Crushing retrosternal chest pain', 'Radiation of pain to left arm or jaw', 'Sudden dyspnea with diaphoresis'],
    recommendedTests: ['12-Lead Electrocardiogram (ECG)', '2D Echocardiogram', 'Serum Troponin I / T', 'Lipid Profile'],
    specialtyDoctor: 'Dr. Anand Kishore (Cardiology & Critical Care, AIIMS Patna)',
  },
  {
    id: 'lungs',
    name: 'Lungs & Bronchial Tree',
    system: 'Respiratory',
    position: [0.35, 0.55, 0.2],
    color: 0x38bdf8,
    normalRange: 'Respiratory Rate 12 – 18 breaths/min, SpO2 95 – 100%',
    biometricParams: [
      { label: 'SpO2 Oxygen Saturation', value: '98%', status: 'Optimal' },
      { label: 'Respiratory Rate', value: '15 /min', status: 'Normal' },
      { label: 'Peak Expiratory Flow (PEFR)', value: '480 L/min', status: 'Optimal' },
    ],
    clinicalOverview:
      'Paired spongy organs of respiration responsible for alveolar gas exchange—delivering oxygen to capillary erythrocytes and discharging carbon dioxide waste.',
    commonPathologies: ['Chronic Obstructive Pulmonary Disease (COPD)', 'Bronchial Asthma', 'Bacterial Pneumonia', 'Pulmonary Fibrosis'],
    warningSigns: ['Stridor or wheezing at rest', 'SpO2 drop below 92%', 'Hemoptysis (coughing blood)'],
    recommendedTests: ['Spirometry / Pulmonary Function Test (PFT)', 'High-Resolution Chest CT (HRCT)', 'Arterial Blood Gas (ABG)'],
    specialtyDoctor: 'Pulmonology Outpatient Clinic, AIIMS / PMCH Patna',
  },
  {
    id: 'brain',
    name: 'Brain (Cerebrum & Central Nervous System)',
    system: 'Nervous',
    position: [0, 1.7, 0.1],
    color: 0xd97706,
    normalRange: 'Intracranial Pressure < 15 mmHg, Normal Alpha/Beta EEG',
    biometricParams: [
      { label: 'Cerebral Perfusion Pressure', value: '75 mmHg', status: 'Optimal' },
      { label: 'Glasgow Coma Scale (GCS)', value: '15 / 15', status: 'Optimal' },
      { label: 'Cognitive Baseline', value: 'Intact', status: 'Normal' },
    ],
    clinicalOverview:
      'The central processing organ of the body, controlling motor functions, autonomic reflex arcs, cognitive functions, memory, and neuroendocrine signaling.',
    commonPathologies: ['Ischemic Stroke / TIA', 'Migraine & Tension Headaches', 'Epilepsy', 'Neurodegenerative Disorders'],
    warningSigns: ['Sudden unilateral weakness / facial droop', 'Acute slurred speech (FAST criteria)', 'Sudden worst headache of life (Thunderclap)'],
    recommendedTests: ['Brain MRI + MR Angiography', 'Non-contrast CT Head', 'Electroencephalography (EEG)'],
    specialtyDoctor: 'Dr. Pratibha Sharma (Neurology & Stroke Care, IGIMS Patna)',
  },
  {
    id: 'liver',
    name: 'Liver (Hepatic Metabolic Hub)',
    system: 'Digestive',
    position: [-0.3, 0.05, 0.25],
    color: 0xf59e0b,
    normalRange: 'Total Bilirubin 0.2 – 1.2 mg/dL, ALT/SGPT 7 – 56 U/L',
    biometricParams: [
      { label: 'Serum ALT (SGPT)', value: '28 U/L', status: 'Optimal' },
      { label: 'Serum AST (SGOT)', value: '24 U/L', status: 'Optimal' },
      { label: 'Total Bilirubin', value: '0.8 mg/dL', status: 'Normal' },
      { label: 'Serum Albumin', value: '4.2 g/dL', status: 'Optimal' },
    ],
    clinicalOverview:
      'The primary detoxifying and biochemical synthesis powerhouse, generating bile salts, plasma albumin, coagulation factors, and glycogen reserves.',
    commonPathologies: ['Non-Alcoholic Fatty Liver Disease (NAFLD)', 'Viral Hepatitis (B/C)', 'Hepatic Cirrhosis', 'Drug-induced liver injury'],
    warningSigns: ['Scleral jaundice (yellow eyes)', 'Right upper quadrant persistent pain', 'Dark tea-colored urine and pale stools'],
    recommendedTests: ['Liver Function Test (LFT Profile)', 'Abdominal Ultrasound', 'FibroScan Hepatic Elastography'],
    specialtyDoctor: 'Gastroenterology & Hepatology, IGIMS Patna',
  },
  {
    id: 'stomach',
    name: 'Stomach & Gastrointestinal Conduit',
    system: 'Digestive',
    position: [0.25, 0.1, 0.2],
    color: 0x10b981,
    normalRange: 'Gastric acid pH 1.5 – 3.5, Normal gastric emptying 2-4 hrs',
    biometricParams: [
      { label: 'Gastric Acid pH', value: '2.1', status: 'Normal' },
      { label: 'Endoscopy Baseline', value: 'Unremarkable', status: 'Normal' },
      { label: 'H. pylori Antigen', value: 'Negative', status: 'Optimal' },
    ],
    clinicalOverview:
      'A muscular reservoir where enzymatic breakdown of proteins begins via pepsin and hydrochloric acid secretion before passing chyme to the duodenum.',
    commonPathologies: ['Gastroesophageal Reflux Disease (GERD)', 'Peptic Ulcer Disease', 'Gastritis', 'Functional Dyspepsia'],
    warningSigns: ['Persistent vomiting', 'Melena (dark tarry stools)', 'Unexplained weight loss with early satiety'],
    recommendedTests: ['Upper GI Endoscopy', 'H. pylori Stool Antigen / Urea Breath Test', 'Barium Swallow Series'],
    specialtyDoctor: 'Gastroenterology Outpatient OPD, PMCH Patna',
  },
  {
    id: 'kidneys',
    name: 'Kidneys & Renal Filtration System',
    system: 'Musculoskeletal',
    position: [0, -0.2, -0.15],
    color: 0xf59e0b,
    normalRange: 'Serum Creatinine 0.7 – 1.3 mg/dL, eGFR > 90 mL/min/1.73m²',
    biometricParams: [
      { label: 'Serum Creatinine', value: '0.9 mg/dL', status: 'Optimal' },
      { label: 'eGFR', value: '98 mL/min', status: 'Optimal' },
      { label: 'Blood Urea Nitrogen (BUN)', value: '14 mg/dL', status: 'Normal' },
    ],
    clinicalOverview:
      'Bean-shaped retroperitoneal organs filtering approximately 180 liters of blood daily, regulating electrolyte balance, acid-base equilibrium, and erythropoietin secretion.',
    commonPathologies: ['Chronic Kidney Disease (CKD)', 'Renal Calculi (Kidney Stones)', 'Glomerulonephritis', 'Hypertensive Nephrosclerosis'],
    warningSigns: ['Oliguria (decreased urine output)', 'Periorbital edema and lower extremity swelling', 'Persistent hematuria (blood in urine)'],
    recommendedTests: ['Kidney Function Test (KFT Profile)', 'Urine Routine & Microscopic Examination (Urine R/M)', 'Renal Doppler Ultrasound'],
    specialtyDoctor: 'Nephrology Department, AIIMS & IGIMS Patna',
  },
];

interface Props {
  onAskGeminiAboutOrgan?: (organName: string) => void;
  onBookSpecialist?: (doctorSpecialty: string) => void;
}

export const Anatomy3DExplorer: React.FC<Props> = ({ onAskGeminiAboutOrgan, onBookSpecialist }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganData>(ORGANS[0]);
  const [activeSystemFilter, setActiveSystemFilter] = useState<string>('All');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const isRotatingRef = useRef<boolean>(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const organMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  isRotatingRef.current = isRotating;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffb547, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.7);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Stylized Translucent Body Silhouette (Warm Dark Tone)
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x241d17,
      roughness: 0.3,
      metalness: 0.1,
      transmission: 0.85,
      opacity: 0.45,
      transparent: true,
      wireframe: false,
    });

    const torsoGeo = new THREE.CylinderGeometry(0.65, 0.45, 1.8, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMaterial);
    torsoMesh.position.set(0, 0.2, 0);
    rootGroup.add(torsoMesh);

    const headGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    headMesh.position.set(0, 1.65, 0);
    rootGroup.add(headMesh);

    const neckGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.35, 16);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMaterial);
    neckMesh.position.set(0, 1.25, 0);
    rootGroup.add(neckMesh);

    // Rib cage wireframe rings
    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.TorusGeometry(0.55 - i * 0.02, 0.015, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x785638, opacity: 0.4, transparent: true });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, 0.8 - i * 0.18, 0);
      rootGroup.add(ringMesh);
    }

    // Spine Column
    for (let i = 0; i < 12; i++) {
      const vertGeo = new THREE.BoxGeometry(0.12, 0.07, 0.12);
      const vertMat = new THREE.MeshStandardMaterial({ color: 0x8a6e50, roughness: 0.5 });
      const vertMesh = new THREE.Mesh(vertGeo, vertMat);
      vertMesh.position.set(0, 1.0 - i * 0.12, -0.22);
      rootGroup.add(vertMesh);
    }

    organMeshesRef.current.clear();
    ORGANS.forEach(org => {
      let geo: THREE.BufferGeometry;
      if (org.id === 'heart') {
        geo = new THREE.SphereGeometry(0.22, 20, 20);
      } else if (org.id === 'lungs') {
        geo = new THREE.CapsuleGeometry(0.18, 0.4, 16, 16);
      } else if (org.id === 'brain') {
        geo = new THREE.SphereGeometry(0.3, 20, 20);
      } else if (org.id === 'liver') {
        geo = new THREE.BoxGeometry(0.42, 0.25, 0.28);
      } else if (org.id === 'stomach') {
        geo = new THREE.SphereGeometry(0.24, 18, 18);
      } else {
        geo = new THREE.CapsuleGeometry(0.12, 0.24, 12, 12);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: org.color,
        emissive: org.color,
        emissiveIntensity: 0.35,
        roughness: 0.25,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...org.position);
      mesh.userData = { organId: org.id };
      rootGroup.add(mesh);
      organMeshesRef.current.set(org.id, mesh);

      const haloGeo = new THREE.RingGeometry(0.25, 0.3, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: org.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(org.position[0], org.position[1], org.position[2] + 0.1);
      rootGroup.add(halo);
    });

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rootGroup.rotation.y += deltaX * 0.008;
      rootGroup.rotation.x += deltaY * 0.005;
      rootGroup.rotation.x = Math.max(-0.5, Math.min(0.5, rootGroup.rotation.x));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rootGroup.children, true);

      for (const hit of intersects) {
        const organId = hit.object.userData?.organId;
        if (organId) {
          const found = ORGANS.find(o => o.id === organId);
          if (found) {
            setSelectedOrgan(found);
            break;
          }
        }
      }
    };

    dom.addEventListener('click', onClick);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isRotatingRef.current && !isDragging) {
        rootGroup.rotation.y += 0.004;
      }

      const heartMesh = organMeshesRef.current.get('heart');
      if (heartMesh) {
        const pulse = 1 + Math.sin(elapsed * 4.5) * 0.06;
        heartMesh.scale.set(pulse, pulse, pulse);
      }

      const lungMesh = organMeshesRef.current.get('lungs');
      if (lungMesh) {
        const breathe = 1 + Math.sin(elapsed * 1.5) * 0.04;
        lungMesh.scale.set(breathe, breathe, breathe);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const systems = ['All', 'Cardiovascular', 'Respiratory', 'Nervous', 'Digestive', 'Musculoskeletal'];

  const filteredOrgans =
    activeSystemFilter === 'All' ? ORGANS : ORGANS.filter(o => o.system === activeSystemFilter);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl glass border border-border shadow-glass">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            Interactive 3D Physiological Explorer
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Human Anatomy & Clinical Systems
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Click any organ node on the 3D model or select a biological system below to inspect clinical norms and red-flag symptoms.
          </p>
        </div>

        {/* System filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-background/50 p-1.5 rounded-2xl border border-border">
          {systems.map(sys => (
            <button
              key={sys}
              onClick={() => setActiveSystemFilter(sys)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                activeSystemFilter === sys
                  ? 'bg-gold text-primary-foreground font-semibold shadow-gold'
                  : 'text-muted-foreground hover:text-white hover:bg-muted'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas + Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Viewport (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl glass border border-border p-4 shadow-glass relative overflow-hidden flex flex-col items-center">
          {/* Top Controls Overlay */}
          <div className="w-full flex items-center justify-between z-10 px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-mono text-primary font-medium">3D WebGL Engine Active</span>
            </div>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isRotating
                  ? 'bg-muted text-primary border-primary/40 font-medium'
                  : 'bg-background/40 border-border text-muted-foreground'
              }`}
              title="Toggle automatic rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              {isRotating ? 'Auto-Rotate ON' : 'Paused (Drag to rotate)'}
            </button>
          </div>

          {/* Three.js Container */}
          <div
            ref={mountRef}
            className="w-full h-[480px] cursor-grab active:cursor-grabbing relative flex items-center justify-center"
            data-testid="threejs-anatomy-canvas"
          />

          {/* Bottom Organ Fast Picker Pills */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 pt-3 border-t border-border z-10">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap pl-2">Hotspots:</span>
            {filteredOrgans.map(org => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgan(org)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                  selectedOrgan.id === org.id
                    ? 'bg-gold text-primary-foreground font-semibold shadow-gold'
                    : 'bg-muted/50 text-muted-foreground hover:text-white border border-border'
                }`}
              >
                {org.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Organ Clinical Inspection Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl glass border border-border p-6 shadow-glass space-y-5">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-primary border border-border">
                {selectedOrgan.system} System
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{selectedOrgan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                Normal Target: <span className="text-foreground font-medium">{selectedOrgan.normalRange}</span>
              </p>
            </div>
          </div>

          {/* Biometrics Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Key Biomarkers & Target Norms
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedOrgan.biometricParams.map(param => (
                <div key={param.label} className="p-3 rounded-2xl bg-background/50 border border-border">
                  <div className="text-xs text-muted-foreground">{param.label}</div>
                  <div className="text-base font-bold text-white mt-0.5">{param.value}</div>
                  <div className="text-[10px] font-medium text-primary mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {param.status} Range
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Overview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Physiological Function
            </h4>
            <p className="text-xs text-foreground/90 leading-relaxed bg-background/40 p-3.5 rounded-2xl border border-border/60">
              {selectedOrgan.clinicalOverview}
            </p>
          </div>

          {/* Warning Signs / Red Flags */}
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-1.5">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Emergency Red-Flag Symptoms:
            </div>
            <ul className="text-xs text-destructive-foreground/90 space-y-1 list-disc list-inside">
              {selectedOrgan.warningSigns.map((sign, idx) => (
                <li key={idx}>{sign}</li>
              ))}
            </ul>
          </div>

          {/* Recommended Diagnostics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Standard Clinical Diagnostics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedOrgan.recommendedTests.map(test => (
                <span
                  key={test}
                  className="text-xs px-2.5 py-1 rounded-xl bg-muted text-foreground border border-border font-mono"
                >
                  {test}
                </span>
              ))}
            </div>
          </div>

          {/* Consult Specialist Link */}
          <div className="p-3.5 rounded-2xl bg-background/50 border border-border flex items-center justify-between">
            <div className="text-xs">
              <div className="text-muted-foreground">Recommended Specialist:</div>
              <div className="font-semibold text-primary mt-0.5">{selectedOrgan.specialtyDoctor}</div>
            </div>
            {onBookSpecialist && (
              <button
                onClick={() => onBookSpecialist(selectedOrgan.system)}
                className="text-xs px-3 py-1.5 rounded-xl bg-gold text-primary-foreground font-semibold shadow-gold flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
              >
                Book OPD <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Gemini AI Action Prompt */}
          {onAskGeminiAboutOrgan && (
            <button
              onClick={() => onAskGeminiAboutOrgan(selectedOrgan.name)}
              className="w-full py-2.5 px-4 rounded-xl bg-gold text-primary-foreground font-medium text-xs flex items-center justify-center gap-2 shadow-gold transition-transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Ask Vitalora AI about {selectedOrgan.name.split(' (')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
