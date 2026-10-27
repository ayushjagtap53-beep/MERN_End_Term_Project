import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Activity,
  Plus,
  Trash2,
  X,
  Loader2,
  Calendar,
  Stethoscope,
  HeartPulse
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected appointment for issuing prescription
  const [activePrescriptionApp, setActivePrescriptionApp] = useState(null);

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState(72);
  const [tempF, setTempF] = useState(98.6);
  const [spO2, setSpO2] = useState(99);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState(14);
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '1-0-1 (Twice Daily)', duration: '5 Days', instructions: 'Take after meals' }
  ]);
  const [submittingRx, setSubmittingRx] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [appRes, statsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/stats/dashboard')
      ]);

      if (appRes.data.success) {
        setAppointments(appRes.data.appointments);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/appointments/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '1-0-1 (Twice Daily)', duration: '5 Days', instructions: 'Take with water' }
    ]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      alert('Clinical diagnosis is required.');
      return;
    }

    setSubmittingRx(true);
    try {
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + Number(followUpDays));

      const payload = {
        appointmentId: activePrescriptionApp._id,
        diagnosis,
        vitals: {
          bloodPressure,
          heartRate: Number(heartRate),
          temperatureF: Number(tempF),
          spO2: Number(spO2)
        },
        medications: medications.filter((m) => m.name.trim().length > 0),
        clinicalNotes,
        followUpDate: followUp
      };

      const res = await api.post('/prescriptions', payload);
      if (res.data.success) {
        alert('Digital prescription issued and appointment marked as COMPLETED.');
        setActivePrescriptionApp(null);
        fetchDoctorData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSubmittingRx(false);
    }
  };

  const urgentAppointments = appointments.filter(
    (a) => a.triage?.triageLevel === 'URGENT' && a.status !== 'COMPLETED' && a.status !== 'CANCELLED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
            Physician Clinical Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Clinical Triage & Patient Queue
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Review live patient triage scores, manage consult lifecycle states, and issue structured digital prescriptions.
          </p>
        </div>

        <button
          onClick={fetchDoctorData}
          className="self-start md:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition"
        >
          Refresh Queue
        </button>
      </div>

      {/* Urgent Warning Banner */}
      {urgentAppointments.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-rose-900 text-base">
              High-Priority Alert: {urgentAppointments.length} Urgent Patient(s) In Queue
            </h3>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Clinical triage scoring detected emergency indicators (e.g. acute chest tightness, severe pain, respiratory distress).
              Please review these patients immediately.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Bookings</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalAppointments}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">Urgent Priority</span>
            <span className="text-2xl font-extrabold text-rose-700">{stats.triageBreakdown?.urgent || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Medium Priority</span>
            <span className="text-2xl font-extrabold text-amber-700">{stats.triageBreakdown?.medium || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Completed Consults</span>
            <span className="text-2xl font-extrabold text-emerald-700">{stats.completedCount}</span>
          </div>
        </div>
      )}

      {/* Patient Queue List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Clinical Queue</h2>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm">Loading physician patient queue...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Patient Appointments</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your consultation schedule is currently empty. Bookings will appear here as patients schedule appointments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => {
              const isUrgent = app.triage?.triageLevel === 'URGENT';
              const isMedium = app.triage?.triageLevel === 'MEDIUM';

              return (
                <div
                  key={app._id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs space-y-4 transition ${
                    isUrgent
                      ? 'border-rose-300 ring-1 ring-rose-300/50'
                      : isMedium
                      ? 'border-amber-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {app.referenceCode}
                        </span>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : isMedium
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Triage: {app.triage?.triageLevel} ({app.triage?.urgencyScore} pts)
                        </span>

                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {app.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {app.patient?.name || 'Walk-in Patient'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Phone: {app.patient?.phone || 'N/A'} &bull; Blood: {app.patient?.bloodGroup || 'Unknown'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <strong>{app.appointmentDate}</strong>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <strong>{app.timeSlot?.start} - {app.timeSlot?.end}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Triage Overview */}
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Chief Complaint</span>
                      <p className="text-slate-800 font-medium">{app.triage?.chiefComplaint}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Intake Vitals</span>
                      <div className="text-slate-700 space-y-0.5">
                        <div>Severity: <strong>{app.triage?.symptomSeverity}/10</strong></div>
                        <div>Duration: <strong>{app.triage?.durationDays} day(s)</strong></div>
                        <div>Reported Temp: <strong>{app.triage?.temperatureF}°F</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Flagged Concerns */}
                  {app.triage?.flaggedConcerns && app.triage.flaggedConcerns.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Automated Risk Flags:
                      </span>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {app.triage.flaggedConcerns.map((concern, idx) => (
                          <li key={idx}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Doctor Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      Recommendation: <em>{app.triage?.recommendedAction}</em>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'CHECKED_IN')}
                          className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
                        >
                          Mark Checked In
                        </button>
                      )}

                      {app.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'IN_CONSULTATION')}
                          className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                        >
                          Start Consultation
                        </button>
                      )}

                      {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                        <button
                          onClick={() => setActivePrescriptionApp(app)}
                          className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Issue Prescription & Complete
                        </button>
                      )}

                      {app.status === 'COMPLETED' && (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Consultation Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescription Authoring Modal */}
      {activePrescriptionApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Author Digital Clinical Prescription</h3>
                  <p className="text-xs text-slate-400">
                    Patient: {activePrescriptionApp.patient?.name} &bull; Ref: {activePrescriptionApp.referenceCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePrescriptionApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="p-6 space-y-6">
              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension, Dermatitis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Vitals Recorded */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Clinical Vitals Measured
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempF}
                      onChange={(e) => setTempF(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Medications List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Prescribed Medications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {medications.map((med, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">Medicine #{idx + 1}</span>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Medicine Name (e.g. Amoxicillin)"
                          value={med.name}
                          onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                          className="p-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          className="p-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Frequency (e.g. 1-0-1)"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          className="p-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 7 Days)"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                          className="p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Instructions (e.g. Take with water after breakfast)"
                        value={med.instructions}
                        onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Notes & Follow-up */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 block">Physician Clinical Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Advised hydration, bed rest, and lifestyle adjustments..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Follow-up in (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActivePrescriptionApp(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRx}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition flex items-center gap-2"
                >
                  {submittingRx && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign & Issue Digital Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
