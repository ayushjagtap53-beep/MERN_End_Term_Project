import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  ChevronRight,
  Loader2,
  Stethoscope
} from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      const res = await api.get('/appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
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
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const getTriageBadge = (triage) => {
    if (!triage) return null;
    if (triage.triageLevel === 'URGENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          URGENT ({triage.urgencyScore} pts)
        </span>
      );
    }
    if (triage.triageLevel === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          MEDIUM ({triage.urgencyScore} pts)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        LOW ({triage.urgencyScore} pts)
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">CONFIRMED</span>;
      case 'CHECKED_IN':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800">CHECKED IN</span>;
      case 'IN_CONSULTATION':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">IN CONSULTATION</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-600 line-through">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-600 text-sm mt-1">
            Track your upcoming clinical consultations, triage priority scores, and digital prescription history.
          </p>
        </div>

        <Link
          to="/doctors"
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs hover:bg-teal-700 transition inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          Book New Consultation
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'All Records' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-sm">Fetching clinical appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Appointments Recorded</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don't have any appointments matching this category. Book a specialist consultation today.
          </p>
          <Link
            to="/doctors"
            className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
          >
            Browse Specialists
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-6 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {app.referenceCode}
                    </span>
                    {getStatusBadge(app.status)}
                    {getTriageBadge(app.triage)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {app.doctor?.user?.name || 'Attending Physician'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {app.doctor?.specialty} &bull; {app.doctor?.qualification}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <strong>{app.appointmentDate}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <strong>{app.timeSlot?.start} - {app.timeSlot?.end}</strong>
                  </div>
                </div>
              </div>

              {/* Triage & Symptoms summary */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reported Symptoms</span>
                  <p className="text-slate-700 font-medium">{app.triage?.chiefComplaint}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Facility Details</span>
                  <p className="text-slate-700 font-medium">
                    {app.doctor?.clinicAddress?.hospitalName}, {app.doctor?.clinicAddress?.roomNumber}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Fee: <strong className="text-slate-700">${app.consultationFee}</strong> (Paid)
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'CHECKED_IN')}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition flex items-center gap-1.5 shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Check In Now
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'CANCELLED')}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {app.status === 'COMPLETED' && (
                    <Link
                      to="/prescriptions"
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Digital Prescription
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
