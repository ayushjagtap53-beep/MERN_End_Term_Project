import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  Printer,
  Calendar,
  User,
  HeartPulse,
  Activity,
  Stethoscope,
  Loader2,
  Clock
} from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions/my');
      if (res.data.success) {
        setPrescriptions(res.data.prescriptions);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Digital Prescriptions & Records</h1>
          <p className="text-slate-600 text-sm mt-1">
            Official post-consultation medical orders, clinical diagnoses, and medication regimens.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Print Records
        </button>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-sm">Fetching digital health records...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Prescriptions Issued Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Once a specialist completes your appointment and authors medical notes, your digital prescriptions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Prescription Clinical Header */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                    <Activity className="w-4 h-4" />
                    MediFlow Official Medical Record
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {rx.doctor?.clinicAddress?.hospitalName || 'MediFlow Central Medical Hub'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Attending: <strong className="text-slate-200">{rx.doctor?.user?.name}</strong> ({rx.doctor?.qualification})
                  </p>
                </div>

                <div className="text-right text-xs text-slate-300 space-y-1">
                  <div className="font-mono font-bold text-teal-400">
                    Ref: {rx.appointment?.referenceCode}
                  </div>
                  <div>Issued: {new Date(rx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Patient & Vitals Summary Strip */}
              <div className="bg-teal-50/60 p-4 sm:px-8 border-b border-teal-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient</span>
                  <strong className="text-slate-800">{rx.patient?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Blood Group</span>
                  <strong className="text-slate-800">{rx.patient?.bloodGroup || 'O+'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">BP / Heart Rate</span>
                  <strong className="text-slate-800">
                    {rx.vitals?.bloodPressure || '120/80'} | {rx.vitals?.heartRate || '72'} bpm
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">SpO2 / Temp</span>
                  <strong className="text-slate-800">
                    {rx.vitals?.spO2 || '99'}% | {rx.vitals?.temperatureF || '98.6'}°F
                  </strong>
                </div>
              </div>

              {/* Clinical Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Diagnosis */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Diagnosis</span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{rx.diagnosis}</h4>
                </div>

                {/* Medications Table */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <span className="font-serif italic text-lg text-teal-700 font-bold">℞</span> Prescribed Medications
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Medicine & Dosage</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Clinical Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.medications && rx.medications.length > 0 ? (
                          rx.medications.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                {m.name} <span className="font-normal text-slate-500">({m.dosage})</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">{m.frequency}</td>
                              <td className="py-2.5 px-3 text-slate-700">{m.duration}</td>
                              <td className="py-2.5 px-3 text-slate-600 italic">{m.instructions}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 px-3 text-slate-400 text-center">
                              No pharmaceuticals prescribed.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Clinical Notes & Follow-up */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Doctor Notes</span>
                    <p className="text-slate-700">{rx.clinicalNotes || 'No specific restrictions noted.'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Follow-Up Advisory</span>
                    <p className="text-slate-700">
                      {rx.followUpDate
                        ? `Scheduled review on ${new Date(rx.followUpDate).toLocaleDateString()}`
                        : 'Follow up as needed if symptoms do not resolve within 7 days.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
