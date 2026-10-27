import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Award,
  DollarSign,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Info
} from 'lucide-react';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Date selection (default today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Slots state
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Booking modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [id, selectedDate]);

  const fetchDoctor = async () => {
    setLoadingDoctor(true);
    try {
      const res = await api.get(`/doctors/${id}`);
      if (res.data.success) {
        setDoctor(res.data.doctor);
      }
    } catch (err) {
      console.error('Failed to load doctor profile:', err);
    } finally {
      setLoadingDoctor(false);
    }
  };

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await api.get(`/doctors/${id}/available-slots`, {
        params: { date }
      });
      if (res.data.success) {
        setSlotsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleStartBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    if (!selectedSlot) return;
    setIsModalOpen(true);
  };

  if (loadingDoctor) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-sm">Retrieving physician credentials...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Specialist Profile Not Found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="text-teal-600 text-sm font-semibold hover:underline inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Directory
        </button>
      </div>
    );
  }

  // Generate 7-day quick date picker
  const upcomingDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayLabel, formatted };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Specialist Directory
      </button>

      {/* Doctor Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100">
              {doctor.specialty}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {doctor.user?.name}
            </h1>
            <p className="text-sm font-medium text-slate-500">{doctor.qualification}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">Consultation Fee</span>
              <span className="text-2xl font-extrabold text-slate-900">${doctor.consultationFee}</span>
            </div>

            <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-100 flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-sm font-bold text-amber-900 block leading-tight">
                  {doctor.averageRating.toFixed(1)} / 5.0
                </span>
                <span className="text-[10px] text-amber-700 font-medium">({doctor.reviewCount} Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Details Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Clinical Background</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Facility Location</div>
                  <div className="text-slate-600">{doctor.clinicAddress?.hospitalName}</div>
                  <div className="text-slate-400">{doctor.clinicAddress?.roomNumber}, {doctor.clinicAddress?.city}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Operating Schedule</div>
                  <div className="text-slate-600">{doctor.workingHours?.start} - {doctor.workingHours?.end}</div>
                  <div className="text-slate-400">{doctor.workingDays?.join(', ')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-teal-50/70 border border-teal-100 space-y-3">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              Triage-Ready Slot Engine
            </div>
            <p className="text-xs text-teal-700 leading-relaxed">
              When you choose a slot, your intake questionnaire is scored by our triage algorithm before confirming,
              alerting the doctor to any emergency red flags.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Slot Selection Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select Appointment Date & Time</h2>
          <p className="text-xs text-slate-500 mt-1">
            Slots are dynamically recalculated to prevent double-booking. Past and reserved slots are disabled.
          </p>
        </div>

        {/* 7-Day Quick Date Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {upcomingDates.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`p-3 rounded-xl border text-center min-w-[100px] transition ${
                selectedDate === item.dateStr
                  ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="block text-[11px] font-semibold uppercase">{item.dayLabel}</span>
              <span className="text-sm font-extrabold">{item.formatted}</span>
            </button>
          ))}
        </div>

        {/* Slots Grid */}
        {loadingSlots ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <p className="text-xs">Checking real-time calendar availability...</p>
          </div>
        ) : slotsData && !slotsData.isWorkingDay ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">{slotsData.message}</p>
            <p className="text-xs text-slate-500">Please select an alternate date from the doctor's working schedule.</p>
          </div>
        ) : slotsData && slotsData.slots ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                Available Slots on <strong>{selectedDate}</strong>: {slotsData.availableSlotsCount} of {slotsData.totalSlots}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked / Past</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {slotsData.slots.map((slot) => {
                const isSelected = selectedSlot && selectedSlot.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/30'
                        : slot.isAvailable
                        ? 'bg-white border-teal-200 text-teal-900 hover:bg-teal-50 hover:border-teal-400'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                    }`}
                  >
                    <span>{slot.start}</span>
                    <span className="block text-[10px] font-normal opacity-80">{slot.end}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Action bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            {selectedSlot ? (
              <p>
                Selected: <strong className="text-teal-700">{selectedDate}</strong> at{' '}
                <strong className="text-teal-700">{selectedSlot.start} - {selectedSlot.end}</strong>
              </p>
            ) : (
              <p className="text-slate-400">Please select an available time slot above to proceed.</p>
            )}
          </div>

          <button
            disabled={!selectedSlot}
            onClick={handleStartBooking}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
              selectedSlot
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Proceed to Clinical Triage Intake
          </button>
        </div>
      </div>

      {/* Booking Modal with Triage Questionnaire */}
      {isModalOpen && (
        <BookingModal
          doctor={doctor}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newApp) => {
            setIsModalOpen(false);
            navigate('/appointments');
          }}
        />
      )}
    </div>
  );
}
