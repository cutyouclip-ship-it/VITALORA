import React, { useState, useEffect } from 'react';
import {
  Building2,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  IndianRupee,
  Globe,
} from 'lucide-react';
import { Hospital, Doctor } from '../data/mockHealthcareData.js';

interface Props {
  onAskDoctorAI?: (doctorName: string, specialty: string) => void;
}

export const HospitalsDoctorsView: React.FC<Props> = ({ onAskDoctorAI }) => {
  const [activeSubTab, setActiveSubTab] = useState<'hospitals' | 'doctors'>('doctors');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  // Appointment Booking Modal
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState('Rameshwar Kumar Singh');
  const [patientPhone, setPatientPhone] = useState('+91-9876543210');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-28');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [hospRes, docRes] = await Promise.all([fetch('/api/hospitals'), fetch('/api/doctors')]);
        if (hospRes.ok) setHospitals(await hospRes.json());
        if (docRes.ok) setDoctors(await docRes.json());
      } catch (err) {
        console.error('Failed to fetch healthcare facilities:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const specialties = [
    'All',
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Nephrology',
    'Surgery',
    'Gastro',
    'Oncology',
    'Ophthalmology',
    'Dentistry',
    'Dermatology',
  ];
  const districts = ['All', 'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'];

  const filteredDoctors = doctors.filter(doc => {
    if (selectedSpecialty !== 'All' && !doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
      return false;
    }
    if (selectedDistrict !== 'All' && doc.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.hospitalName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredHospitals = hospitals.filter(hosp => {
    if (selectedDistrict !== 'All' && hosp.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        hosp.name.toLowerCase().includes(q) ||
        hosp.district.toLowerCase().includes(q) ||
        hosp.departments.some(d => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: bookingDoctor.id,
          patientName,
          patientPhone,
          appointmentDate,
          appointmentTime: selectedSlot,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingSuccessData(data.appointment);
      } else {
        alert(data.error || 'Failed to book slot');
      }
    } catch (err: any) {
      alert(`Booking error: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* View Switcher Header */}
      <div className="glass rounded-2xl p-6 shadow-glass border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Building2 className="w-4 h-4 text-primary" />
            Verified Clinical Directory
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Doctors & Apex Hospital Facilities
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Verified specialist consultations, OPD appointment scheduling, and 24x7 trauma centers in Bihar.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-xl border border-border">
          <button
            onClick={() => setActiveSubTab('doctors')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'doctors'
                ? 'bg-gold text-primary-foreground shadow-gold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Verified Specialists ({doctors.length})
          </button>
          <button
            onClick={() => setActiveSubTab('hospitals')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'hospitals'
                ? 'bg-gold text-primary-foreground shadow-gold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Hospital Network ({hospitals.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-2xl p-4 border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-glass">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'doctors'
                ? 'Search doctor by name, specialty, or hospital...'
                : 'Search hospital by name, department, or location...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {activeSubTab === 'doctors' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Specialty:</span>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-background/60 border border-input text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
            >
              {specialties.map(s => (
                <option key={s} value={s} className="bg-card text-foreground">
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">District:</span>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background/60 border border-input text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
          >
            {districts.map(d => (
              <option key={d} value={d} className="bg-card text-foreground">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {activeSubTab === 'doctors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="glass rounded-2xl p-5 border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between shadow-glass space-y-4 group"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0 group-hover:border-primary/40 transition-colors shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-foreground truncate">{doc.name}</h3>
                      <span title="Verified Medical License">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      </span>
                    </div>
                    <div className="text-xs text-primary font-semibold">{doc.specialty}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{doc.qualification}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Hospital:</span>
                    <span className="text-foreground font-semibold truncate max-w-[190px]">{doc.hospitalName}</span>
                  </div>
                  {doc.opdTiming && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        OPD Timing:
                      </span>
                      <span className="text-foreground font-medium text-[11px] truncate max-w-[190px]">
                        {doc.opdTiming}
                      </span>
                    </div>
                  )}
                  {doc.receptionContact && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-primary" />
                        Desk / Helplines:
                      </span>
                      <span className="text-foreground font-mono text-[11px] truncate max-w-[190px]">
                        {doc.receptionContact.split(';')[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Experience:</span>
                    <span className="text-foreground">{doc.experienceYears} Years</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Languages:</span>
                    <span className="text-foreground">{doc.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-primary font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      {doc.rating} <span className="text-muted-foreground font-normal">({doc.reviewCount})</span>
                    </div>
                    <div className="text-sm font-black text-primary flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                      {doc.consultationFeeInr} OPD
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setBookingDoctor(doc);
                    setSelectedSlot(doc.timeSlots[0] || '10:00 AM');
                    setBookingSuccessData(null);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gold hover:opacity-90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-gold"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book OPD Slot
                </button>

                {doc.officialDirectoryUrl && (
                  <a
                    href={doc.officialDirectoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 transition-all"
                    title="View Official Hospital Profile"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}

                {onAskDoctorAI && (
                  <button
                    onClick={() => onAskDoctorAI(doc.name, doc.specialty)}
                    className="p-2.5 rounded-xl bg-card hover:bg-muted text-primary border border-border hover:border-primary/40 transition-all"
                    title="Ask AI Assistant about this doctor"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospitals Grid */}
      {activeSubTab === 'hospitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHospitals.map(hosp => (
            <div
              key={hosp.id}
              className="glass rounded-2xl overflow-hidden border-border/80 hover:border-primary/40 transition-all shadow-glass flex flex-col justify-between group"
            >
              {/* High-fidelity AI Hospital Image Banner */}
              {hosp.image && (
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={hosp.image}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  
                  {/* Category & Badge overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {hosp.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {hosp.verificationBadge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-lg font-bold text-white drop-shadow-md leading-snug truncate">{hosp.name}</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5 drop-shadow truncate">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {hosp.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-amber-400 font-bold text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {hosp.rating}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Status indicators: ICU beds, 24x7, oxygen */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 border-b border-border/60 text-xs">
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border/60">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">ICU Beds</span>
                      <span className="text-foreground font-bold text-sm">{hosp.icuBedsAvailable} Available</span>
                    </div>
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border/60">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Emergency</span>
                      <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        24x7 Active
                      </span>
                    </div>
                    <div className="bg-background/60 p-2.5 rounded-xl border border-border/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Oxygen Plant</span>
                      <span className="text-foreground font-semibold text-xs flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Operational
                      </span>
                    </div>
                  </div>

                  {/* Key Clinical Departments */}
                  <div className="mt-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                      Key Clinical Departments:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {hosp.departments.slice(0, 6).map(dept => (
                        <span
                          key={dept}
                          className="text-xs px-2.5 py-1 rounded-lg bg-card/80 text-foreground border border-border font-medium"
                        >
                          {dept}
                        </span>
                      ))}
                      {hosp.departments.length > 6 && (
                        <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">
                          +{hosp.departments.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer contacts & Official Link */}
                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">OPD/Desk:</span>
                    <a href={`tel:${hosp.phone}`} className="text-primary font-mono font-bold hover:underline">
                      {hosp.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {hosp.officialUrl && (
                      <a
                        href={hosp.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Official Site
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setBookingDoctor(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                OPD Appointment Desk
              </span>
              <h3 className="text-lg font-bold text-foreground mt-2">Book Slot: {bookingDoctor.name}</h3>
              <p className="text-xs text-muted-foreground">
                {bookingDoctor.specialty} • {bookingDoctor.hospitalName}
              </p>
            </div>

            {bookingSuccessData ? (
              <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <h4 className="text-lg font-bold text-foreground">OPD Appointment Confirmed!</h4>
                <div className="p-3 bg-background/70 rounded-xl border border-border text-xs font-mono space-y-1">
                  <div className="text-primary font-bold">Slip #{bookingSuccessData.id}</div>
                  <div className="text-foreground">
                    {bookingSuccessData.appointmentDate} at {bookingSuccessData.appointmentTime}
                  </div>
                  <div className="text-primary font-bold">
                    Consultation Fee: ₹{bookingDoctor.consultationFeeInr}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  A digital token has been registered in the hospital registry and patient health vault.
                </p>
                <button
                  onClick={() => setBookingDoctor(null)}
                  className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Select Available Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {bookingDoctor.timeSlots.map(slot => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedSlot === slot
                            ? 'bg-gold text-primary-foreground border-primary font-bold shadow-gold'
                            : 'bg-background/60 text-muted-foreground border-border hover:bg-card hover:text-foreground'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border font-semibold text-xs">
                  <span className="text-muted-foreground">OPD Consultation Fee:</span>
                  <span className="text-primary text-sm flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5 inline" />
                    {bookingDoctor.consultationFeeInr} (Pay at counter / online)
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingDoctor(null)}
                    className="px-4 py-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold hover:opacity-90 transition-opacity"
                  >
                    Confirm OPD Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
