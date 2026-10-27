import React, { useState } from 'react';
import api from '../services/api';
import {
  X,
  AlertTriangle,
  HeartPulse,
  Thermometer,
  Clock,
  Calendar,
  CheckCircle2,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const COMMON_CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'None'];

export default function BookingModal({ doctor, selectedDate, selectedSlot, onClose, onSuccess }) {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [durationDays, setDurationDays] = useState(2);
  const [temperatureF, setTemperatureF] = useState(98.6);
  const [patientAge, setPatientAge] = useState(28);
  const [selectedConditions, setSelectedConditions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Client-side quick red flag detection for UI feedback
  const lowerComplaint = chiefComplaint.toLowerCase();
  const hasUrgentFlag =
    lowerComplaint.includes('chest pain') ||
    lowerComplaint.includes('shortness of breath') ||
    lowerComplaint.includes('difficulty breathing') ||
    lowerComplaint.includes('loss of consciousness') ||
    lowerComplaint.includes('slurred speech') ||
    symptomSeverity >= 9;

  const toggleCondition = (cond) => {
    if (cond === 'None') {
      setSelectedConditions(['None']);
      return;
    }
    const filtered = selectedConditions.filter((c) => c !== 'None');
    if (filtered.includes(cond)) {
      setSelectedConditions(filtered.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...filtered, cond]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      setError('Please provide a description of your symptoms.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        chiefComplaint,
        symptomSeverity: Number(symptomSeverity),
        durationDays: Number(durationDays),
        temperatureF: Number(temperatureF),
        patientAge: Number(patientAge),
        preExistingConditions: selectedConditions.filter((c) => c !== 'None')
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        setBookingSuccessData(res.data.appointment);
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Clinical Intake & Triage Assessment</h3>
              <p className="text-xs text-teal-100">
                With {doctor.user?.name} &bull; {selectedDate} ({selectedSlot.start} - {selectedSlot.end})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {bookingSuccessData ? (
            /* Booking Confirmation View */
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-500">Your clinical reservation has been securely recorded.</p>
              </div>

              {/* Reference token badge */}
              <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Unique Reference Token</div>
                <div className="text-xl font-mono font-extrabold text-teal-700">{bookingSuccessData.referenceCode}</div>
                <div className="text-xs text-slate-600 mt-2">
                  Scheduled for: <strong>{bookingSuccessData.appointmentDate}</strong> at{' '}
                  <strong>{bookingSuccessData.timeSlot?.start} - {bookingSuccessData.timeSlot?.end}</strong>
                </div>
              </div>

              {/* Assigned Triage Level */}
              <div
                className={`p-4 rounded-xl text-left border ${
                  bookingSuccessData.triage?.triageLevel === 'URGENT'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : bookingSuccessData.triage?.triageLevel === 'MEDIUM'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Triage Urgency: {bookingSuccessData.triage?.triageLevel}
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-white shadow-xs">
                    Score: {bookingSuccessData.triage?.urgencyScore}/100
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{bookingSuccessData.triage?.recommendedAction}</p>
              </div>

              <button
                onClick={() => onSuccess(bookingSuccessData)}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition shadow-md shadow-teal-600/30"
              >
                View My Appointments
              </button>
            </div>
          ) : (
            /* Intake Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Red flag live warning banner */}
              {hasUrgentFlag && (
                <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Critical Urgency Indicator Detected</span>
                    Your symptoms will trigger a high-priority physician alert in the queue.
                  </div>
                </div>
              )}

              {/* Chief complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chief Complaint & Symptoms *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what you are experiencing (e.g. sharp headache, chest discomfort, fever, cough)..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Symptom Severity Slider */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Reported Distress Severity</span>
                  <span
                    className={`font-extrabold px-2.5 py-0.5 rounded text-white ${
                      symptomSeverity >= 8
                        ? 'bg-rose-600'
                        : symptomSeverity >= 5
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {symptomSeverity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={symptomSeverity}
                  onChange={(e) => setSymptomSeverity(e.target.value)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 (Mild / Discomfort)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Debilitating / Severe)</span>
                </div>
              </div>

              {/* Clinical Vitals Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="95"
                    max="107"
                    value={temperatureF}
                    onChange={(e) => setTemperatureF(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Patient Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Pre-existing Conditions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Relevant Pre-existing Conditions
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CONDITIONS.map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Slot & Score Triage
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
