import React, { useState, useEffect } from 'react';
import {
  Droplet,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  PlusCircle,
  Send,
  Building2,
  CheckCircle2,
  Heart,
  Share2,
  Calendar,
  UserCheck,
  UserPlus,
  Compass,
  Award,
  ExternalLink,
  MessageCircle,
  Info,
  Activity,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  BloodInventoryItem,
  UrgentBloodRequest,
  RegisteredDonor,
  BloodBankDirectoryEntry,
  BloodDonationCamp,
  bloodCompatibilityDetails,
  patnaBloodInventory,
  initialUrgentBloodRequests,
  registeredPatnaDonors,
  patnaBloodBanksDirectory,
  upcomingDonationCamps,
} from '../data/patnaBloodData.js';
import {
  getCompatibleDonorBloodGroups,
  getCompatibleRecipientBloodGroups,
  isInventoryStale,
  evaluateDonorEligibility,
  DonorEligibilityInput,
  DonorEligibilityOutput,
  UserRole,
} from '../utils/healthcareLogic.js';

interface Props {
  userRole: UserRole;
  onRequestBloodFromAssistant?: (bloodGroup: string) => void;
}

type BloodSubTab =
  | 'inventory'
  | 'urgent-requests'
  | 'donors'
  | 'eligibility'
  | 'directory'
  | 'camps'
  | 'compatibility';

export const BloodBandBiharView: React.FC<Props> = ({ userRole, onRequestBloodFromAssistant }) => {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<BloodSubTab>('inventory');

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState<BloodInventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedComponent, setSelectedComponent] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Urgent Requests State
  const [urgentRequests, setUrgentRequests] = useState<UrgentBloodRequest[]>([]);
  const [selectedReqGroup, setSelectedReqGroup] = useState<string>('All');
  const [pledgedSuccessMsg, setPledgedSuccessMsg] = useState<string | null>(null);

  // Donors State
  const [donors, setDonors] = useState<RegisteredDonor[]>([]);
  const [selectedDonorGroup, setSelectedDonorGroup] = useState<string>('All');
  const [selectedDonorLocality, setSelectedDonorLocality] = useState<string>('All');

  // Camps State
  const [camps, setCamps] = useState<BloodDonationCamp[]>([]);
  const [registeredCampPass, setRegisteredCampPass] = useState<{ pass: string; campTitle: string } | null>(null);

  // Directory State
  const [directoryItems, setDirectoryItems] = useState<BloodBankDirectoryEntry[]>([]);
  const [selectedDirCategory, setSelectedDirCategory] = useState<string>('All');

  // Compatibility State
  const [selectedCompatGroup, setSelectedCompatGroup] = useState<'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'>('O+');
  const [compatMode, setCompatMode] = useState<'RBC' | 'PLASMA'>('RBC');

  // Eligibility Checker State
  const [eligAge, setEligAge] = useState<number>(26);
  const [eligGender, setEligGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [eligWeight, setEligWeight] = useState<number>(68);
  const [eligMonthsGap, setEligMonthsGap] = useState<number>(4);
  const [eligHasFever, setEligHasFever] = useState<boolean>(false);
  const [eligHasTattoo, setEligHasTattoo] = useState<boolean>(false);
  const [eligHasSurgery, setEligHasSurgery] = useState<boolean>(false);
  const [eligIsPregnant, setEligIsPregnant] = useState<boolean>(false);
  const [eligResult, setEligResult] = useState<DonorEligibilityOutput | null>(null);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [showDonorRegisterModal, setShowDonorRegisterModal] = useState<boolean>(false);
  const [showCampModal, setShowCampModal] = useState<BloodDonationCamp | null>(null);
  const [showPledgeModal, setShowPledgeModal] = useState<UrgentBloodRequest | null>(null);
  const [showStaffUpdateModal, setShowStaffUpdateModal] = useState<boolean>(false);
  const [activeItemForUpdate, setActiveItemForUpdate] = useState<BloodInventoryItem | null>(null);

  // Emergency Requisition Form State
  const [reqPatientName, setReqPatientName] = useState('');
  const [reqPatientAge, setReqPatientAge] = useState('32');
  const [reqAttendantName, setReqAttendantName] = useState('');
  const [reqPhone, setReqPhone] = useState('+91-9876543210');
  const [reqBloodGroup, setReqBloodGroup] = useState<'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'>('O-');
  const [reqComponent, setReqComponent] = useState('Packed Red Cells (PRBC)');
  const [reqUnits, setReqUnits] = useState('2');
  const [reqHospital, setReqHospital] = useState('AIIMS Patna');
  const [reqDistrict, setReqDistrict] = useState('Patna');
  const [reqReason, setReqReason] = useState('Urgent surgical intervention / severe anemia');
  const [reqUrgency, setReqUrgency] = useState<'CRITICAL_IMMEDIATE' | 'WITHIN_4_HOURS' | 'WITHIN_24_HOURS'>('CRITICAL_IMMEDIATE');
  const [requestSubmittedToken, setRequestSubmittedToken] = useState<string | null>(null);

  // Donor Registration Form State
  const [dnrName, setDnrName] = useState('');
  const [dnrAge, setDnrAge] = useState('28');
  const [dnrGender, setDnrGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dnrWeight, setDnrWeight] = useState('65');
  const [dnrBloodGroup, setDnrBloodGroup] = useState<'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'>('O+');
  const [dnrLocality, setDnrLocality] = useState('Kankarbagh');
  const [dnrPhone, setDnrPhone] = useState('+91-9835012345');
  const [dnrWhatsapp, setDnrWhatsapp] = useState(true);
  const [dnrMode, setDnrMode] = useState<'Immediate SOS & Planned' | 'Emergency Only' | 'Weekends Only'>('Immediate SOS & Planned');
  const [dnrSuccessMsg, setDnrSuccessMsg] = useState<string | null>(null);

  // Camp RSVP State
  const [campRsvpName, setCampRsvpName] = useState('Rameshwar Singh');
  const [campRsvpPhone, setCampRsvpPhone] = useState('+91-9876543210');
  const [campRsvpSlot, setCampRsvpSlot] = useState('10:00 AM - 11:30 AM');

  // Pledge Donation State
  const [pledgeDonorName, setPledgeDonorName] = useState('Rameshwar Singh');
  const [pledgeDonorPhone, setPledgeDonorPhone] = useState('+91-9876543210');

  // Staff Update Form State
  const [staffName, setStaffName] = useState('Dr. Anand Kishore');
  const [updatedUnits, setUpdatedUnits] = useState<number>(10);
  const [staffUpdateMsg, setStaffUpdateMsg] = useState<string | null>(null);

  // Fetch all initial data
  const loadAllData = async () => {
    setIsLoadingInventory(true);
    try {
      // 1. Inventory
      const resInv = await fetch('/api/blood-bank/inventory');
      if (resInv.ok) {
        const data = await resInv.json();
        setInventoryItems(data.items || patnaBloodInventory);
      } else {
        setInventoryItems(patnaBloodInventory);
      }

      // 2. Urgent Requests
      const resReq = await fetch('/api/blood-bank/requests');
      if (resReq.ok) {
        const data = await resReq.json();
        setUrgentRequests(data.requests || initialUrgentBloodRequests);
      } else {
        setUrgentRequests(initialUrgentBloodRequests);
      }

      // 3. Donors
      const resDnr = await fetch('/api/blood-bank/donors');
      if (resDnr.ok) {
        const data = await resDnr.json();
        setDonors(data.donors || registeredPatnaDonors);
      } else {
        setDonors(registeredPatnaDonors);
      }

      // 4. Directory
      const resDir = await fetch('/api/blood-bank/directory');
      if (resDir.ok) {
        const data = await resDir.json();
        setDirectoryItems(data.directory || patnaBloodBanksDirectory);
      } else {
        setDirectoryItems(patnaBloodBanksDirectory);
      }

      // 5. Camps
      const resCamps = await fetch('/api/blood-bank/camps');
      if (resCamps.ok) {
        const data = await resCamps.json();
        setCamps(data.camps || upcomingDonationCamps);
      } else {
        setCamps(upcomingDonationCamps);
      }
    } catch (e) {
      console.warn('Using client-side fallback blood datasets:', e);
      setInventoryItems(patnaBloodInventory);
      setUrgentRequests(initialUrgentBloodRequests);
      setDonors(registeredPatnaDonors);
      setDirectoryItems(patnaBloodBanksDirectory);
      setCamps(upcomingDonationCamps);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter lists
  const bloodGroups = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const districts = ['All', 'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'];
  const components = ['All', 'Packed Red Cells (PRBC)', 'Whole Blood', 'Platelets (RDP/SDP)', 'Fresh Frozen Plasma (FFP)'];
  const patnaLocalities = [
    'All',
    'Kankarbagh',
    'Boring Road',
    'Bailey Road',
    'Phulwari Sharif',
    'Rajendra Nagar',
    'Danapur',
    'Anisabad',
    'Fraser Road',
    'Ashiana Nagar',
  ];

  // Filtered inventory
  const filteredInventory = inventoryItems.filter(item => {
    if (selectedGroup !== 'All' && item.bloodGroup !== selectedGroup) return false;
    if (selectedDistrict !== 'All' && item.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (selectedComponent !== 'All' && !item.component.toLowerCase().includes(selectedComponent.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.hospitalName.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.bloodGroup.toLowerCase().includes(q) ||
        item.component.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered urgent requests
  const filteredRequests = urgentRequests.filter(req => {
    if (selectedReqGroup !== 'All' && req.bloodGroup !== selectedReqGroup) return false;
    return true;
  });

  // Filtered donors
  const filteredDonors = donors.filter(d => {
    if (selectedDonorGroup !== 'All' && d.bloodGroup !== selectedDonorGroup) return false;
    if (selectedDonorLocality !== 'All' && !d.locality.toLowerCase().includes(selectedDonorLocality.toLowerCase())) return false;
    return true;
  });

  // Filtered Directory
  const filteredDirectory = directoryItems.filter(b => {
    if (selectedDirCategory !== 'All' && b.category !== selectedDirCategory) return false;
    return true;
  });

  // Calculations
  const totalUnitsInInventory = inventoryItems.reduce((acc, curr) => acc + curr.units, 0);
  const criticalLowCount = inventoryItems.filter(i => i.units < 5).length;
  const activeSosCount = urgentRequests.filter(r => r.status === 'ACTIVE_SEARCHING').length;
  const compatibleDonorsForFilter = selectedGroup !== 'All' ? getCompatibleDonorBloodGroups(selectedGroup) : [];

  // Handlers
  const handleOpenStaffModal = (item: BloodInventoryItem) => {
    setActiveItemForUpdate(item);
    setUpdatedUnits(item.units);
    setStaffUpdateMsg(null);
    setShowStaffUpdateModal(true);
  };

  const handleSaveStaffUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemForUpdate) return;
    try {
      const res = await fetch('/api/blood-bank/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeItemForUpdate.id,
          units: updatedUnits,
          staffName,
          hospitalCode: 'VTR-STAFF-AUTH',
        }),
      });
      if (res.ok) {
        setStaffUpdateMsg('Inventory stock verified and recorded in Bihar Blood Ledger.');
        setTimeout(() => {
          setShowStaffUpdateModal(false);
          loadAllData();
        }, 1000);
      } else {
        // Optimistic local update
        setInventoryItems(prev =>
          prev.map(item => (item.id === activeItemForUpdate.id ? { ...item, units: updatedUnits } : item))
        );
        setShowStaffUpdateModal(false);
      }
    } catch {
      setInventoryItems(prev =>
        prev.map(item => (item.id === activeItemForUpdate.id ? { ...item, units: updatedUnits } : item))
      );
      setShowStaffUpdateModal(false);
    }
  };

  const handleSubmitEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = `VTR-BLD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: UrgentBloodRequest = {
      id: `req-${Date.now()}`,
      requestToken: token,
      patientName: reqPatientName || 'Urgent Patient',
      patientAge: parseInt(reqPatientAge, 10) || 30,
      bloodGroup: reqBloodGroup,
      component: reqComponent,
      unitsRequested: parseInt(reqUnits, 10) || 2,
      unitsFulfilled: 0,
      hospitalName: reqHospital,
      district: reqDistrict,
      attendantName: reqAttendantName || 'Family Attendant',
      attendantPhone: reqPhone,
      reason: reqReason,
      urgency: reqUrgency,
      status: 'ACTIVE_SEARCHING',
      createdAtIso: new Date().toISOString(),
    };

    try {
      await fetch('/api/blood-bank/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
    } catch (err) {
      console.warn(err);
    }

    setUrgentRequests(prev => [newReq, ...prev]);
    setRequestSubmittedToken(token);
  };

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDonor: RegisteredDonor = {
      id: `dnr-${Date.now()}`,
      fullName: dnrName,
      bloodGroup: dnrBloodGroup,
      age: parseInt(dnrAge, 10) || 28,
      gender: dnrGender,
      weightKg: parseInt(dnrWeight, 10) || 65,
      locality: `${dnrLocality}, Patna`,
      city: 'Patna',
      phone: dnrPhone,
      isWhatsappAvailable: dnrWhatsapp,
      totalDonations: 1,
      lastDonationDate: new Date().toISOString().split('T')[0],
      isAvailableNow: true,
      availabilityMode: dnrMode,
      verifiedBadge: true,
    };

    try {
      await fetch('/api/blood-bank/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonor),
      });
    } catch (err) {
      console.warn(err);
    }

    setDonors(prev => [newDonor, ...prev]);
    setDnrSuccessMsg(`Congratulations ${dnrName}! You are officially registered in the Patna Voluntary Lifesaver Network.`);
  };

  const handlePledgeDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPledgeModal) return;

    try {
      await fetch(`/api/blood-bank/requests/${showPledgeModal.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: pledgeDonorName,
          donorPhone: pledgeDonorPhone,
        }),
      });
    } catch (err) {
      console.warn(err);
    }

    setUrgentRequests(prev =>
      prev.map(r =>
        r.id === showPledgeModal.id
          ? {
              ...r,
              unitsFulfilled: Math.min(r.unitsRequested, r.unitsFulfilled + 1),
              status: r.unitsFulfilled + 1 >= r.unitsRequested ? 'ARRANGED' : 'DONOR_EN_ROUTE',
            }
          : r
      )
    );

    setPledgedSuccessMsg(
      `Heartfelt gratitude, ${pledgeDonorName}! Your intent to donate ${showPledgeModal.bloodGroup} has been signaled to the attendant at ${showPledgeModal.hospitalName}.`
    );
    setShowPledgeModal(null);
  };

  const handleCampRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCampModal) return;

    const pass = `CAMP-PASS-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      await fetch('/api/blood-bank/camps/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campId: showCampModal.id,
          donorName: campRsvpName,
          donorPhone: campRsvpPhone,
        }),
      });
    } catch (err) {
      console.warn(err);
    }

    setCamps(prev =>
      prev.map(c => (c.id === showCampModal.id ? { ...c, registeredCount: c.registeredCount + 1 } : c))
    );

    setRegisteredCampPass({
      pass,
      campTitle: showCampModal.title,
    });
    setShowCampModal(null);
  };

  const runEligibilityAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const input: DonorEligibilityInput = {
      age: eligAge,
      gender: eligGender,
      weightKg: eligWeight,
      monthsSinceLastDonation: eligMonthsGap,
      hasRecentFeverOrAntibiotics: eligHasFever,
      hasRecentTattooOrPiercing: eligHasTattoo,
      hasMajorSurgeryLast6Months: eligHasSurgery,
      isPregnantOrLactating: eligIsPregnant,
    };
    const result = evaluateDonorEligibility(input);
    setEligResult(result);
  };

  const currentCompat = bloodCompatibilityDetails[selectedCompatGroup] || bloodCompatibilityDetails['O+'];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Bihar Blood Band Cinematic Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 glass border border-border shadow-glass relative overflow-hidden bg-gradient-to-br from-card/90 via-card/70 to-card/90">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-destructive/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold tracking-wider border border-destructive/30 uppercase">
              <Droplet className="w-3.5 h-3.5 text-destructive fill-destructive animate-pulse" />
              Verified Bihar Emergency Transfusion Grid
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Bihar Blood Band <span className="text-gold font-normal text-2xl sm:text-3xl">(लाइव रक्त कोष)</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold text-primary-foreground font-mono font-bold">
                Patna Hub Active
              </span>
            </div>

            <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
              Unified state network connecting AIIMS Patna, PMCH, IGIMS, Mahavir Cancer Sansthan, Paras HMRI, Kurji Holy Family, Red Cross Patna, and regional medical colleges. Real-time apheresis stocks, emergency patient SOS feeds, voluntary donor registry, and licensed blood bank helplines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setRequestSubmittedToken(null);
                setShowRequestModal(true);
              }}
              className="px-5 py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-sm shadow-lg shadow-destructive/25 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              Post Emergency SOS
            </button>

            <button
              onClick={() => {
                setDnrSuccessMsg(null);
                setShowDonorRegisterModal(true);
              }}
              className="px-5 py-3 rounded-xl bg-gold text-primary-foreground font-bold text-sm shadow-gold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Register as Donor
            </button>

            <button
              onClick={loadAllData}
              disabled={isLoadingInventory}
              className="p-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors cursor-pointer"
              title="Refresh Grid Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingInventory ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Helplines & Network Status Ribbon */}
        <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Phone className="w-3.5 h-3.5 text-primary" />
              Bihar Blood Council Helpline: <a href="tel:104" className="text-gold font-bold hover:underline">104 (24x7)</a>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Phone className="w-3.5 h-3.5 text-destructive" />
              Ambulance Emergency: <a href="tel:108" className="text-foreground font-bold hover:underline">108</a>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5 text-accent" />
              AIIMS Patna Blood Bank: <a href="tel:06122451055" className="text-foreground font-semibold hover:underline">0612-2451055</a>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5 text-accent" />
              Red Cross Patna: <a href="tel:06122200233" className="text-foreground font-semibold hover:underline">0612-2200233</a>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-semibold">{totalUnitsInInventory} Units Verified</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-destructive font-semibold">{activeSosCount} Active SOS Needs</span>
          </div>
        </div>
      </div>

      {/* Pledged Confirmation Banner */}
      {pledgedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>{pledgedSuccessMsg}</span>
          </div>
          <button
            onClick={() => setPledgedSuccessMsg(null)}
            className="text-emerald-400 hover:text-white font-bold text-sm px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Camp Pass Confirmation Banner */}
      {registeredCampPass && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/80 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-gold shrink-0" />
            <div>
              <div className="font-bold text-white">Donation Camp Registration Confirmed!</div>
              <div className="text-xs text-amber-300">
                Pass <span className="font-mono font-bold text-gold">#{registeredCampPass.pass}</span> for &quot;{registeredCampPass.campTitle}&quot;. Please present this SMS/screen at the venue.
              </div>
            </div>
          </div>
          <button
            onClick={() => setRegisteredCampPass(null)}
            className="text-amber-400 hover:text-white font-bold text-sm px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'inventory'
              ? 'bg-gold text-primary-foreground shadow-gold'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <Droplet className="w-4 h-4" />
          लाइव रक्त भंडार (Live Stock)
        </button>

        <button
          onClick={() => setActiveSubTab('urgent-requests')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer relative ${
            activeSubTab === 'urgent-requests'
              ? 'bg-destructive text-white shadow-lg shadow-destructive/25'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          आपातकालीन मांग (Urgent SOS)
          {activeSosCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-destructive text-[10px] font-black">
              {activeSosCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('donors')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'donors'
              ? 'bg-gold text-primary-foreground shadow-gold'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <Heart className="w-4 h-4" />
          रक्तदाता नेटवर्क (Find Donors)
        </button>

        <button
          onClick={() => setActiveSubTab('eligibility')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'eligibility'
              ? 'bg-gold text-primary-foreground shadow-gold'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          पात्रता जांच (Eligibility Quiz)
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-gold text-primary-foreground shadow-gold'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          अधिकृत ब्लड बैंक (Directory)
        </button>

        <button
          onClick={() => setActiveSubTab('camps')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'camps'
              ? 'bg-gold text-primary-foreground shadow-gold'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          रक्तदान शिविर (Camps & Drives)
        </button>

        <button
          onClick={() => setActiveSubTab('compatibility')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'compatibility'
              ? 'bg-gold text-primary-foreground shadow-gold'
              : 'bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/60'
          }`}
        >
          <Compass className="w-4 h-4" />
          अनुकूलता चार्ट (Compatibility Matrix)
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE BLOOD INVENTORY (लाइव रक्त भंडार) */}
      {/* ======================================================== */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-5 rounded-2xl glass border border-border space-y-4 shadow-glass">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by hospital name, locality, address, or blood group..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/50 border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* District Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-background/60 border border-input text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                >
                  {districts.map(d => (
                    <option key={d} value={d} className="bg-popover text-foreground">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Component Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Component:</span>
                <select
                  value={selectedComponent}
                  onChange={e => setSelectedComponent(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-background/60 border border-input text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                >
                  {components.map(c => (
                    <option key={c} value={c} className="bg-popover text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Blood Group Fast Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap mr-1">Blood Group:</span>
              {bloodGroups.map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    selectedGroup === bg
                      ? 'bg-gold text-primary-foreground shadow-gold'
                      : 'bg-muted/40 text-muted-foreground hover:text-white border border-border'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Clinical Compatibility Advisory */}
            {selectedGroup !== 'All' && (
              <div className="p-3.5 rounded-xl bg-background/60 border border-border flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">Recipient Blood Group:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-gold text-primary-foreground font-extrabold">
                    {selectedGroup}
                  </span>
                  <span className="text-muted-foreground ml-2">Can safely receive red cells from:</span>
                  <div className="flex items-center gap-1.5">
                    {compatibleDonorsForFilter.map(d => (
                      <span key={d} className="px-2 py-0.5 rounded-md bg-muted text-gold font-mono font-bold border border-border">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedGroup === 'O-' && (
                  <span className="text-gold font-semibold text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Universal RBC Donor (Can only receive O- in transfusion)
                  </span>
                )}
                {selectedGroup === 'AB+' && (
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Universal RBC Recipient (Can receive from all groups)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass border border-border">
              <div className="text-xs text-muted-foreground">Total Verified Stock</div>
              <div className="text-2xl font-black text-white mt-1">{totalUnitsInInventory} Units</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Across Patna & Bihar Apex Centers</div>
            </div>
            <div className="p-4 rounded-2xl glass border border-border">
              <div className="text-xs text-muted-foreground">Active Blood Banks</div>
              <div className="text-2xl font-black text-gold mt-1">{directoryItems.length} Nodal Centers</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">24x7 Government & Super Specialty</div>
            </div>
            <div className="p-4 rounded-2xl glass border border-border">
              <div className="text-xs text-muted-foreground">Critical Shortage Alert</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{criticalLowCount} Categories</div>
              <div className="text-[11px] text-amber-400/80 mt-0.5">&lt;5 units in reserve (SOS active)</div>
            </div>
            <div className="p-4 rounded-2xl glass border border-border">
              <div className="text-xs text-muted-foreground">Registered Lifesavers</div>
              <div className="text-2xl font-black text-white mt-1">{donors.length}+ Donors</div>
              <div className="text-[11px] text-primary mt-0.5">Ready for emergency Patna calls</div>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInventory.map(item => {
              const freshness = isInventoryStale(item.lastUpdatedIso);
              const isStale = freshness.isStale;
              const isLowStock = item.units < 5;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between shadow-glass ${
                    isStale
                      ? 'glass border-amber-800/60 hover:border-amber-600'
                      : isLowStock
                      ? 'glass border-destructive/40 hover:border-destructive/70'
                      : 'glass border-border hover:border-gold/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-gold font-mono border border-border">
                          {item.district}, Bihar
                        </span>
                        <h3 className="text-base font-bold text-white mt-2 line-clamp-1">{item.hospitalName}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span className="line-clamp-1">{item.address}</span>
                        </p>
                      </div>

                      {/* Blood Group Unit Badge */}
                      <div className="flex flex-col items-center justify-center min-w-16 h-16 rounded-2xl bg-gold text-primary-foreground shadow-gold p-2">
                        <span className="text-xl font-black leading-none">{item.bloodGroup}</span>
                        <span className="text-[10px] font-bold opacity-90 mt-1 uppercase tracking-wider">Group</span>
                      </div>
                    </div>

                    {/* Units & Component Details */}
                    <div className="mt-4 p-3 rounded-xl bg-background/50 border border-border flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">Component</div>
                        <div className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">{item.component}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground font-medium">Available Reserves</div>
                        <div
                          className={`text-lg font-black ${
                            item.units === 0 ? 'text-destructive' : item.units < 5 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.units} Units
                        </div>
                      </div>
                    </div>

                    {/* Freshness & Verification Status */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          <span className={isStale ? 'text-amber-400 font-medium' : 'text-foreground'}>
                            {freshness.freshnessLabel}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-gold border border-border font-mono font-semibold">
                          {item.verificationStatus}
                        </span>
                      </div>

                      {isStale && (
                        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span>Last updated &gt;24h ago. Call hospital counter to verify before dispatch.</span>
                        </div>
                      )}

                      {isLowStock && !isStale && (
                        <div className="p-2 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-[11px] flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Critically low stock (&lt;5 units). Reserved for emergency cases.</span>
                        </div>
                      )}

                      <div className="text-[11px] text-muted-foreground pt-1">
                        Verified by: <span className="text-foreground font-medium">{item.verifiedByStaff}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <a
                      href={`tel:${item.contactPhone}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-muted/70 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-border"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      Call: {item.contactPhone.split('-').pop()}
                    </a>

                    <button
                      onClick={() => {
                        setReqBloodGroup(item.bloodGroup);
                        setReqHospital(item.hospitalName);
                        setReqComponent(item.component);
                        setRequestSubmittedToken(null);
                        setShowRequestModal(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold transition-transform active:scale-95 cursor-pointer"
                      title="Request blood from this center"
                    >
                      Request Units
                    </button>

                    {(userRole === 'HOSPITAL_STAFF' || userRole === 'ADMIN') && (
                      <button
                        onClick={() => handleOpenStaffModal(item)}
                        className="py-2 px-2.5 rounded-xl bg-muted hover:bg-muted/90 text-foreground border border-border text-xs font-medium cursor-pointer"
                        title="Authorized Staff: Update Physical Inventory"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredInventory.length === 0 && !isLoadingInventory && (
            <div className="p-12 text-center rounded-3xl glass border border-border text-muted-foreground space-y-3">
              <Droplet className="w-12 h-12 text-muted-foreground/60 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Matching Blood Inventory Found</h3>
              <p className="text-sm max-w-md mx-auto">
                No inventory currently logged under these filters. You can broadcast an emergency SOS requisition to the entire Bihar blood bank network.
              </p>
              <button
                onClick={() => {
                  setSelectedGroup('All');
                  setSelectedDistrict('All');
                  setSelectedComponent('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-gold text-primary-foreground text-xs font-semibold shadow-gold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACTIVE SOS REQUISITIONS BOARD (आपातकालीन मांग बोर्ड) */}
      {/* ======================================================== */}
      {activeSubTab === 'urgent-requests' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-5 rounded-2xl glass border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                Live Patient SOS Emergency Feed
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">Critical Blood Requisitions in Patna & Bihar</h3>
              <p className="text-xs text-muted-foreground">
                Verified hospital requisitions awaiting volunteer donors. Respond immediately if you are eligible to donate.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 overflow-x-auto">
                {bloodGroups.map(bg => (
                  <button
                    key={bg}
                    onClick={() => setSelectedReqGroup(bg)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedReqGroup === bg
                        ? 'bg-destructive text-white'
                        : 'bg-muted/40 text-muted-foreground hover:text-white'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setRequestSubmittedToken(null);
                  setShowRequestModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-destructive text-white font-bold text-xs shadow-lg shadow-destructive/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Post SOS
              </button>
            </div>
          </div>

          {/* Requisitions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map(req => {
              const isFulfilled = req.status === 'ARRANGED';
              const isUrgent = req.urgency === 'CRITICAL_IMMEDIATE';

              return (
                <div
                  key={req.id}
                  className={`p-6 rounded-3xl border glass transition-all space-y-4 relative overflow-hidden shadow-glass ${
                    isFulfilled
                      ? 'border-emerald-800/60 bg-emerald-950/20'
                      : isUrgent
                      ? 'border-destructive/60 bg-destructive/10'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-background border border-border text-gold font-bold">
                          #{req.requestToken}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isUrgent ? 'bg-destructive text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {req.urgency.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            isFulfilled
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white pt-1">{req.patientName} ({req.patientAge} yrs)</h4>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="text-foreground font-semibold">{req.hospitalName}</span>
                      </div>
                    </div>

                    {/* Big Blood Badge */}
                    <div className="flex flex-col items-center justify-center min-w-16 h-16 rounded-2xl bg-destructive text-white shadow-lg shadow-destructive/25 p-2 shrink-0">
                      <span className="text-xl font-black leading-none">{req.bloodGroup}</span>
                      <span className="text-[10px] font-bold opacity-90 mt-1 uppercase">Needed</span>
                    </div>
                  </div>

                  {/* Clinical Reason */}
                  <div className="p-3 rounded-xl bg-background/50 border border-border text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground">Clinical Indications:</div>
                    <p className="leading-relaxed">{req.reason}</p>
                    {req.verifiedDoctor && (
                      <div className="text-[11px] text-gold pt-1">
                        Attending Consultant: <span className="font-medium text-foreground">{req.verifiedDoctor}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress & Units */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Units Arranged:</span>
                      <span className="font-bold text-foreground">
                        {req.unitsFulfilled} of {req.unitsRequested} Units ({req.component})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gold transition-all duration-500"
                        style={{ width: `${Math.min(100, (req.unitsFulfilled / req.unitsRequested) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Attendant & Call Actions */}
                  <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-muted-foreground">
                      Attendant: <span className="text-foreground font-medium">{req.attendantName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.attendantPhone}`}
                        className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold flex items-center gap-1.5 border border-border"
                      >
                        <Phone className="w-3.5 h-3.5 text-gold" />
                        Call Attendant
                      </a>

                      {!isFulfilled && (
                        <button
                          onClick={() => setShowPledgeModal(req)}
                          className="px-4 py-2 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-lg shadow-destructive/25 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          I Can Donate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRequests.length === 0 && (
            <div className="p-12 text-center rounded-3xl glass border border-border text-muted-foreground space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Active SOS Requisitions for {selectedReqGroup}</h3>
              <p className="text-sm max-w-md mx-auto">
                Currently, there are no unfulfilled emergency requisitions for this blood group in the regional network.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REGISTERED VOLUNTARY DONORS (रक्तदाता नेटवर्क) */}
      {/* ======================================================== */}
      {activeSubTab === 'donors' && (
        <div className="space-y-6">
          {/* Header & Filter */}
          <div className="p-5 rounded-2xl glass border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
                Patliputra Lifesaver Registry
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">Verified Voluntary Donors in Patna</h3>
              <p className="text-xs text-muted-foreground">
                Direct community lifesavers willing to donate blood or apheresis platelets across Patna localities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Group Filter */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {bloodGroups.map(bg => (
                  <button
                    key={bg}
                    onClick={() => setSelectedDonorGroup(bg)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedDonorGroup === bg
                        ? 'bg-gold text-primary-foreground shadow-gold'
                        : 'bg-muted/40 text-muted-foreground hover:text-white'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>

              {/* Locality Dropdown */}
              <select
                value={selectedDonorLocality}
                onChange={e => setSelectedDonorLocality(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-background/60 border border-input text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
              >
                {patnaLocalities.map(loc => (
                  <option key={loc} value={loc} className="bg-popover text-foreground">
                    {loc}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setDnrSuccessMsg(null);
                  setShowDonorRegisterModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Join Registry
              </button>
            </div>
          </div>

          {/* Donor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDonors.map(donor => (
              <div
                key={donor.id}
                className="p-5 rounded-2xl glass border border-border shadow-glass flex flex-col justify-between space-y-4 hover:border-gold/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-base shadow-sm">
                        {donor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-base">{donor.fullName}</h4>
                          {donor.verifiedBadge && (
                            <span title="Identity Verified by NBTC Node">
                              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold shrink-0" />
                          <span>{donor.locality}</span>
                        </p>
                      </div>
                    </div>

                    {/* Blood Group Pill */}
                    <div className="px-3 py-1 rounded-xl bg-destructive text-white font-black text-sm shadow-md">
                      {donor.bloodGroup}
                    </div>
                  </div>

                  {/* Donor Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-background/50 border border-border text-center text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Donations</div>
                      <div className="font-bold text-gold mt-0.5">{donor.totalDonations} Times</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Age / Wt</div>
                      <div className="font-bold text-foreground mt-0.5">{donor.age}y / {donor.weightKg}k</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Status</div>
                      <div className="font-bold text-emerald-400 mt-0.5">Ready</div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-medium text-[11px] border border-border">
                      {donor.availabilityMode}
                    </span>
                  </div>
                </div>

                {/* Connect Actions */}
                <div className="pt-3 border-t border-border flex items-center gap-2">
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-muted/70 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 border border-border transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    Call
                  </a>

                  {donor.isWhatsappAvailable && (
                    <a
                      href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Namaste ${donor.fullName}, we are contacting you via the Bihar Blood Band regarding an urgent blood requirement for ${donor.bloodGroup} in Patna.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DONOR ELIGIBILITY CHECKER (पात्रता जांच) */}
      {/* ======================================================== */}
      {activeSubTab === 'eligibility' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass border border-border shadow-glass max-w-4xl mx-auto space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                NBTC & MoHFW Medical Screening Protocol
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">
                Am I Eligible to Donate Blood Today? (रक्तदान पात्रता जांच)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Take this quick 6-question clinical self-assessment to verify your eligibility before visiting a blood bank or donation camp.
              </p>
            </div>

            <form onSubmit={runEligibilityAssessment} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Your Age (Years) <span className="text-gold">*</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="80"
                    required
                    value={eligAge}
                    onChange={e => setEligAge(parseInt(e.target.value, 10) || 18)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">Permitted: 18 - 65 yrs</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Biological Gender <span className="text-gold">*</span>
                  </label>
                  <select
                    value={eligGender}
                    onChange={e => setEligGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                  >
                    <option value="Male" className="bg-popover text-foreground">Male</option>
                    <option value="Female" className="bg-popover text-foreground">Female</option>
                    <option value="Other" className="bg-popover text-foreground">Other</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Weight & donation interval threshold</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Body Weight (in kg) <span className="text-gold">*</span>
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="150"
                    required
                    value={eligWeight}
                    onChange={e => setEligWeight(parseInt(e.target.value, 10) || 50)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">Min 45 kg (Female) / 50 kg (Male)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Months Elapsed Since Your Last Blood Donation
                </label>
                <select
                  value={eligMonthsGap}
                  onChange={e => setEligMonthsGap(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                >
                  <option value={999} className="bg-popover text-foreground">First Time Donor (Never donated before)</option>
                  <option value={1} className="bg-popover text-foreground">Less than 1 month ago</option>
                  <option value={2} className="bg-popover text-foreground">2 months ago</option>
                  <option value={3} className="bg-popover text-foreground">3 months ago</option>
                  <option value={4} className="bg-popover text-foreground">4 months ago</option>
                  <option value={6} className="bg-popover text-foreground">6 months or longer</option>
                </select>
              </div>

              {/* Toggle Question Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Health & Medical History Checklist
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border cursor-pointer hover:bg-background/60">
                  <input
                    type="checkbox"
                    checked={eligHasFever}
                    onChange={e => setEligHasFever(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-gold"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground block">Active fever, cold, or antibiotics in last 48 hours?</span>
                    <span className="text-muted-foreground">Donors must be symptom-free and finished with antimicrobial medications.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border cursor-pointer hover:bg-background/60">
                  <input
                    type="checkbox"
                    checked={eligHasTattoo}
                    onChange={e => setEligHasTattoo(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-gold"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground block">Tattoo, body piercing, or acupuncture in the past 6 months?</span>
                    <span className="text-muted-foreground">Requires a standard 6-month deferral window to rule out window-period infections.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border cursor-pointer hover:bg-background/60">
                  <input
                    type="checkbox"
                    checked={eligHasSurgery}
                    onChange={e => setEligHasSurgery(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-gold"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground block">Major surgical procedure or blood transfusion received in last 6 months?</span>
                    <span className="text-muted-foreground">Allows full systemic recovery and iron replenishment.</span>
                  </div>
                </label>

                {eligGender === 'Female' && (
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border cursor-pointer hover:bg-background/60">
                    <input
                      type="checkbox"
                      checked={eligIsPregnant}
                      onChange={e => setEligIsPregnant(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded accent-gold"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-foreground block">Are you currently pregnant or actively breastfeeding?</span>
                      <span className="text-muted-foreground">Pregnancy and lactation require deferral for maternal health protection.</span>
                    </div>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gold text-primary-foreground font-extrabold text-sm shadow-gold flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Activity className="w-4 h-4" />
                Evaluate My Donor Eligibility
              </button>
            </form>

            {/* Assessment Result Output */}
            {eligResult && (
              <div
                className={`p-6 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
                  eligResult.isEligible
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {eligResult.isEligible ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-white">{eligResult.statusTitle}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {eligResult.isEligible
                        ? 'You meet all physiological and safety requirements under Indian national guidelines.'
                        : 'You are temporarily advised not to donate blood for your own health or recipient safety.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  {eligResult.reasons.map((r, i) => (
                    <div key={i} className="text-xs flex items-start gap-2">
                      <span className="text-gold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {eligResult.isEligible && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setDnrAge(eligAge.toString());
                        setDnrGender(eligGender);
                        setDnrWeight(eligWeight.toString());
                        setShowDonorRegisterModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold cursor-pointer"
                    >
                      Register in Patna Donor Directory
                    </button>
                    <button
                      onClick={() => setActiveSubTab('camps')}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-white font-semibold text-xs border border-border cursor-pointer"
                    >
                      View Upcoming Donation Camps
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: LICENSED BLOOD BANKS DIRECTORY (अधिकृत ब्लड बैंक सूची) */}
      {/* ======================================================== */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl glass border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                Licensed Transfusion Medicine Centers
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">Patna & Regional Bihar Blood Bank Directory</h3>
              <p className="text-xs text-muted-foreground">
                Authoritative licensed centers with 24x7 blood component processing and emergency testing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Type:</span>
              <select
                value={selectedDirCategory}
                onChange={e => setSelectedDirCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-background/60 border border-input text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="All" className="bg-popover text-foreground">All Categories</option>
                <option value="Government Apex" className="bg-popover text-foreground">Government Apex</option>
                <option value="Government Medical College" className="bg-popover text-foreground">Medical Colleges</option>
                <option value="Charitable / Red Cross" className="bg-popover text-foreground">Charitable / Red Cross</option>
                <option value="Private Super Specialty" className="bg-popover text-foreground">Private Super Specialty</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDirectory.map(bank => (
              <div
                key={bank.id}
                className="p-6 rounded-3xl glass border border-border shadow-glass space-y-4 hover:border-gold/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-gold border border-border">
                        {bank.category}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-2">{bank.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{bank.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border text-muted-foreground block">
                        Lic: {bank.licenseNumber.split('-').pop()}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 mt-1 block">
                        {bank.timing}
                      </span>
                    </div>
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bank.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-foreground border border-border font-medium"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground pt-1">
                    Officer-in-Charge: <span className="text-foreground font-semibold">{bank.officerInCharge}</span>
                  </div>
                </div>

                {/* Direct Dial and Emergency Contact */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <a
                    href={`tel:${bank.phone}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call: {bank.phone}
                  </a>

                  <a
                    href={`https://maps.google.com/?q=${bank.lat},${bank.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1 border border-border"
                  >
                    <Compass className="w-3.5 h-3.5 text-gold" />
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: UPCOMING DONATION CAMPS (रक्तदान शिविर व मोबाइल वैन) */}
      {/* ======================================================== */}
      {activeSubTab === 'camps' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl glass border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Community Donation Drives
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">Upcoming Blood Donation Camps in Patna</h3>
              <p className="text-xs text-muted-foreground">
                Join life-saving mobile drives and community camps organized by government colleges and charitable trusts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {camps.map(camp => (
              <div
                key={camp.id}
                className="p-6 rounded-3xl glass border border-border shadow-glass space-y-4 hover:border-gold/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                        {camp.organizedBy}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-2">{camp.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="text-foreground font-medium">{camp.venue}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-muted/60 border border-border text-center shrink-0">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Date</div>
                      <div className="text-sm font-black text-gold mt-0.5">{camp.date}</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>Time Slot: <strong className="text-foreground">{camp.timeRange}</strong></span>
                  </div>

                  {/* Target vs Registered Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Registered Donors:</span>
                      <span className="font-bold text-foreground">
                        {camp.registeredCount} / {camp.targetUnits} Slots
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${Math.min(100, (camp.registeredCount / camp.targetUnits) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Donor Benefits */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-foreground">Complimentary Donor Benefits:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {camp.benefits.map((b, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Coordinator: <span className="text-foreground font-semibold">{camp.contactPerson}</span>
                  </div>

                  <button
                    onClick={() => setShowCampModal(camp)}
                    className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold transition-transform active:scale-95 cursor-pointer"
                  >
                    Book Donation Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: BLOOD COMPATIBILITY MATRIX (अनुकूलता चार्ट) */}
      {/* ======================================================== */}
      {activeSubTab === 'compatibility' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass border border-border shadow-glass max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  Transfusion Immunology Reference
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Interactive Blood Compatibility Matrix (रक्त अनुकूलता मार्गदर्शिका)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select any blood group below to inspect transfusion safety, red cell matching, and plasma exchange rules.
                </p>
              </div>

              {/* RBC vs Plasma Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-background/60 border border-border self-start sm:self-auto">
                <button
                  onClick={() => setCompatMode('RBC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    compatMode === 'RBC' ? 'bg-gold text-primary-foreground shadow-gold' : 'text-muted-foreground'
                  }`}
                >
                  Red Blood Cells (PRBC)
                </button>
                <button
                  onClick={() => setCompatMode('PLASMA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    compatMode === 'PLASMA' ? 'bg-gold text-primary-foreground shadow-gold' : 'text-muted-foreground'
                  }`}
                >
                  Plasma (FFP)
                </button>
              </div>
            </div>

            {/* Blood Group Selectors */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const).map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedCompatGroup(bg)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedCompatGroup === bg
                      ? 'bg-gold text-primary-foreground shadow-gold scale-105'
                      : 'bg-muted/40 text-muted-foreground hover:text-white border border-border'
                  }`}
                >
                  <span className="text-lg font-black">{bg}</span>
                  <span className="text-[9px] uppercase font-semibold mt-0.5">Select</span>
                </button>
              ))}
            </div>

            {/* Matrix Details Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Can Give To */}
              <div className="p-5 rounded-2xl bg-background/50 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {compatMode === 'RBC' ? 'Can Donate Red Cells To (Recipient)' : 'Can Donate Plasma To (Recipient)'}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(compatMode === 'RBC' ? currentCompat.canGiveRbcTo : currentCompat.canGivePlasmaTo).map(g => (
                    <span
                      key={g}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Can Receive From */}
              <div className="p-5 rounded-2xl bg-background/50 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-gold fill-gold" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {compatMode === 'RBC' ? 'Can Receive Red Cells From (Donor)' : 'Can Receive Plasma From (Donor)'}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(compatMode === 'RBC' ? currentCompat.canReceiveRbcFrom : currentCompat.canReceivePlasmaFrom).map(g => (
                    <span
                      key={g}
                      className="px-3.5 py-1.5 rounded-xl bg-gold/15 border border-gold/40 text-gold font-mono font-bold text-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Scientific Breakdown */}
            <div className="p-5 rounded-2xl glass border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Antigens on Red Cells:</span>
                <span className="text-foreground font-semibold mt-1 block">{currentCompat.antigensOnRbc}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Antibodies in Blood Plasma:</span>
                <span className="text-foreground font-semibold mt-1 block">{currentCompat.antibodiesInPlasma}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Prevalence in India / Bihar:</span>
                <span className="text-gold font-bold mt-1 block">{currentCompat.frequencyInIndia}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
              <strong className="text-white">Clinical Note: </strong>
              {currentCompat.keyClinicalRole}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EMERGENCY BLOOD REQUISITION MODAL */}
      {/* ======================================================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl glass border border-border p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive uppercase tracking-wider">
                <Droplet className="w-4 h-4 text-destructive fill-destructive" />
                Emergency Blood Requisition Token
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Submit Blood Request</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transmitted directly to impaneled blood bank nodal officers & registered Patna donors.
              </p>
            </div>

            {requestSubmittedToken ? (
              <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-gold mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Emergency Request Broadcasted!</h4>
                <div className="p-3 bg-background rounded-xl border border-border font-mono text-gold text-lg font-bold tracking-wider">
                  Token: #{requestSubmittedToken}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your request has been posted to the Live SOS Feed and transmitted to AIIMS Patna, PMCH, and IGIMS blood banks. Keep this token ready when arriving at the counter.
                </p>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setActiveSubTab('urgent-requests');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold cursor-pointer"
                >
                  View on SOS Feed
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEmergencyRequest} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={reqPatientName}
                      onChange={e => setReqPatientName(e.target.value)}
                      placeholder="e.g. Rameshwar Singh"
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Patient Age</label>
                    <input
                      type="number"
                      required
                      value={reqPatientAge}
                      onChange={e => setReqPatientAge(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Attendant Name</label>
                    <input
                      type="text"
                      required
                      value={reqAttendantName}
                      onChange={e => setReqAttendantName(e.target.value)}
                      placeholder="e.g. Manoj Kumar (Brother)"
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Attendant Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={reqPhone}
                      onChange={e => setReqPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Blood Group</label>
                    <select
                      value={reqBloodGroup}
                      onChange={e => setReqBloodGroup(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                    >
                      {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const).map(bg => (
                        <option key={bg} value={bg} className="bg-popover text-foreground">
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={reqUnits}
                      onChange={e => setReqUnits(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">District</label>
                    <select
                      value={reqDistrict}
                      onChange={e => setReqDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                    >
                      {['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'].map(d => (
                        <option key={d} value={d} className="bg-popover text-foreground">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Component Required</label>
                  <select
                    value={reqComponent}
                    onChange={e => setReqComponent(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                  >
                    <option value="Packed Red Cells (PRBC)" className="bg-popover text-foreground">Packed Red Cells (PRBC)</option>
                    <option value="Whole Blood" className="bg-popover text-foreground">Whole Blood</option>
                    <option value="Platelets (RDP/SDP)" className="bg-popover text-foreground">Platelets (RDP / Apheresis SDP)</option>
                    <option value="Fresh Frozen Plasma (FFP)" className="bg-popover text-foreground">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Admitted Hospital</label>
                  <input
                    type="text"
                    required
                    value={reqHospital}
                    onChange={e => setReqHospital(e.target.value)}
                    placeholder="e.g. AIIMS Patna / PMCH Emergency / Paras HMRI"
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Clinical Diagnosis / Reason</label>
                  <input
                    type="text"
                    required
                    value={reqReason}
                    onChange={e => setReqReason(e.target.value)}
                    placeholder="e.g. Severe Dengue, Emergency C-Section, Trauma accident"
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-destructive text-white font-bold shadow-lg shadow-destructive/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmit Requisition
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DONOR REGISTRATION MODAL */}
      {/* ======================================================== */}
      {showDonorRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl glass border border-border p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setShowDonorRegisterModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold uppercase tracking-wider">
                <Heart className="w-4 h-4 text-destructive fill-destructive" />
                Voluntary Lifesaver Enrollment
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Register as a Blood Donor</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join 1,000+ verified volunteers in Patna ready to help when hospital reserves run dry.
              </p>
            </div>

            {dnrSuccessMsg ? (
              <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Enrollment Successful!</h4>
                <p className="text-xs text-muted-foreground">{dnrSuccessMsg}</p>
                <button
                  onClick={() => {
                    setShowDonorRegisterModal(false);
                    setActiveSubTab('donors');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold cursor-pointer"
                >
                  View My Listing in Directory
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterDonor} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={dnrName}
                    onChange={e => setDnrName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Verma"
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Blood Group</label>
                    <select
                      value={dnrBloodGroup}
                      onChange={e => setDnrBloodGroup(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold"
                    >
                      {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const).map(bg => (
                        <option key={bg} value={bg} className="bg-popover text-foreground">
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Age</label>
                    <input
                      type="number"
                      min="18"
                      max="65"
                      required
                      value={dnrAge}
                      onChange={e => setDnrAge(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min="45"
                      required
                      value={dnrWeight}
                      onChange={e => setDnrWeight(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Patna Locality / Area</label>
                    <input
                      type="text"
                      required
                      value={dnrLocality}
                      onChange={e => setDnrLocality(e.target.value)}
                      placeholder="e.g. Kankarbagh / Bailey Road"
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground font-medium block mb-1">Contact Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={dnrPhone}
                      onChange={e => setDnrPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Preferred Availability Mode</label>
                  <select
                    value={dnrMode}
                    onChange={e => setDnrMode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                  >
                    <option value="Immediate SOS & Planned" className="bg-popover text-foreground">Immediate SOS & Planned Drives (Recommended)</option>
                    <option value="Emergency Only" className="bg-popover text-foreground">Critical Emergency Night Calls Only</option>
                    <option value="Weekends Only" className="bg-popover text-foreground">Weekends Only</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dnrWhatsapp}
                    onChange={e => setDnrWhatsapp(e.target.checked)}
                    className="rounded accent-gold"
                  />
                  <span className="text-muted-foreground">Allow verified hospital attendants to message me on WhatsApp</span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDonorRegisterModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold cursor-pointer"
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PLEDGE DONATION MODAL */}
      {/* ======================================================== */}
      {showPledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl glass border border-border p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowPledgeModal(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                Life-Saving Pledge
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Donate Blood for {showPledgeModal.patientName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Required: <strong className="text-gold">{showPledgeModal.bloodGroup}</strong> at {showPledgeModal.hospitalName}
              </p>
            </div>

            <form onSubmit={handlePledgeDonation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={pledgeDonorName}
                  onChange={e => setPledgeDonorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Your Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={pledgeDonorPhone}
                  onChange={e => setPledgeDonorPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                />
              </div>

              <div className="p-3 rounded-xl bg-background/40 border border-border text-[11px] text-muted-foreground">
                Attendant: <strong className="text-foreground">{showPledgeModal.attendantName}</strong> ({showPledgeModal.attendantPhone})
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPledgeModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-lg shadow-destructive/25 cursor-pointer"
                >
                  Confirm & Dispatch Intent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DONATION CAMP SLOT BOOKING */}
      {/* ======================================================== */}
      {showCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl glass border border-border p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowCampModal(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                Camp Slot Reservation
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{showCampModal.title}</h3>
              <p className="text-xs text-muted-foreground">{showCampModal.venue} • {showCampModal.date}</p>
            </div>

            <form onSubmit={handleCampRSVP} className="space-y-3.5 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Donor Name</label>
                <input
                  type="text"
                  required
                  value={campRsvpName}
                  onChange={e => setCampRsvpName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Mobile Phone for SMS Pass</label>
                <input
                  type="tel"
                  required
                  value={campRsvpPhone}
                  onChange={e => setCampRsvpPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Preferred Time Window</label>
                <select
                  value={campRsvpSlot}
                  onChange={e => setCampRsvpSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                >
                  <option value="09:00 AM - 10:30 AM" className="bg-popover text-foreground">09:00 AM - 10:30 AM</option>
                  <option value="10:30 AM - 12:00 PM" className="bg-popover text-foreground">10:30 AM - 12:00 PM</option>
                  <option value="01:00 PM - 02:30 PM" className="bg-popover text-foreground">01:00 PM - 02:30 PM</option>
                  <option value="02:30 PM - 04:00 PM" className="bg-popover text-foreground">02:30 PM - 04:00 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCampModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold cursor-pointer"
                >
                  Generate Camp Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: AUTHORIZED STAFF INVENTORY UPDATE */}
      {/* ======================================================== */}
      {showStaffUpdateModal && activeItemForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl glass border border-border p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowStaffUpdateModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                Staff Authorization Node
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Update Inventory: {activeItemForUpdate.bloodGroup}
              </h3>
              <p className="text-xs text-muted-foreground">{activeItemForUpdate.hospitalName}</p>
            </div>

            <form onSubmit={handleSaveStaffUpdate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Verifying Staff Officer Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Verified Available Physical Units</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  required
                  value={updatedUnits}
                  onChange={e => setUpdatedUnits(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground font-bold text-base"
                />
              </div>

              {staffUpdateMsg && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-gold text-xs">
                  {staffUpdateMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffUpdateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold cursor-pointer"
                >
                  Confirm & Verify Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
