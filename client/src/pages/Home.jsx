import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  AlertTriangle,
  Stethoscope,
  Clock,
  CheckCircle,
  FileText,
  Shield,
  Activity,
  ArrowRight,
  UserCheck,
  Heart
} from 'lucide-react';

export default function Home() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (role) => {
    try {
      if (role === 'patient') {
        await login('patient@mediflow.com', 'password123');
        navigate('/doctors');
      } else {
        await login('doctor@mediflow.com', 'password123');
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      alert('Demo accounts not seeded yet. Please ensure backend has seeded data.');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold tracking-wide uppercase">
                <Activity className="w-3.5 h-3.5 text-teal-700 animate-pulse" />
                Algorithmic Pre-Consultation Triage Engine
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Smart Clinical Appointments with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                  Intelligent Triage
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Eliminate clinic double-booking and intake delays. MediFlow analyzes patient symptoms in real-time,
                scores urgency levels, guarantees conflict-free slot reservation, and empowers physicians with
                structured digital prescriptions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="px-6 py-3.5 rounded-xl bg-teal-600 text-white font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 hover:shadow-teal-600/40 transition flex items-center gap-2 group"
                >
                  <Stethoscope className="w-5 h-5" />
                  Find & Book a Specialist
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                {!user && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickDemoLogin('patient')}
                      className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition text-sm flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      Demo Patient
                    </button>
                    <button
                      onClick={() => handleQuickDemoLogin('doctor')}
                      className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition text-sm flex items-center gap-2"
                    >
                      <Stethoscope className="w-4 h-4 text-cyan-600" />
                      Demo Doctor
                    </button>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  Zero Race-Condition Booking
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Red Flag Detection Engine
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-600" />
                  Role-Based Secure Auth
                </div>
              </div>
            </div>

            {/* Hero Visual Card / Triage Simulation Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-2xl -mr-10 -mt-10" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Intake Telemetry</span>
                  </div>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">Ref: MDF-LIVE</span>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="text-xs text-slate-400 font-medium">Chief Symptom Input</div>
                    <div className="text-sm font-semibold text-slate-800">"Severe sharp chest pain radiating to left shoulder"</div>
                  </div>

                  {/* Triage Matrix Result */}
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Triage Assessment: URGENT
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-md">Score: 92/100</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      ⚠️ Red Flag Detected: Cardiac indicator match. Automated priority escalation queued for attending physician.
                    </p>
                  </div>

                  {/* Slot Allocation Preview */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 font-semibold">
                      09:00 AM
                      <span className="block text-[10px] text-teal-600 font-normal">Available</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 line-through">
                      09:30 AM
                      <span className="block text-[10px] text-slate-400 font-normal">Reserved</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-teal-500 bg-teal-600 text-white font-semibold shadow-xs">
                      10:00 AM
                      <span className="block text-[10px] text-teal-100 font-normal">Selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Tier Clinical Triage Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Algorithmic Triage Prioritization</h2>
          <p className="text-slate-600">
            Unlike basic booking calendars, MediFlow computes clinical severity during intake so doctors can address
            critical cases first while maintaining schedule integrity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm relative overflow-hidden hover:shadow-md transition">
            <div className="w-2 h-full bg-rose-500 absolute left-0 top-0" />
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                URGENT (Score 75-100)
              </span>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">High-Risk Clinical Flags</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Triggers on emergency indicators (chest pain, dyspnea, acute neurologic deficits, severe trauma). Prioritizes at the top of physician queue.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm relative overflow-hidden hover:shadow-md transition">
            <div className="w-2 h-full bg-amber-500 absolute left-0 top-0" />
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                MEDIUM (Score 40-74)
              </span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Moderate Acute Illness</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              High pyrexia, prolonged symptom duration (&gt;14 days), multiple comorbidities, or severe localized pain requiring prompt clinical evaluation.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden hover:shadow-md transition">
            <div className="w-2 h-full bg-emerald-500 absolute left-0 top-0" />
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                LOW (Score 0-39)
              </span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Standard Consultation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Routine checkups, mild seasonal allergies, prescription renewals, and chronic disease follow-ups operating on regular scheduling timeframes.
            </p>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold text-slate-900">End-to-End Application Workflow</h2>
            <p className="text-slate-600">
              Structured multi-step lifecycle satisfying comprehensive engineering guidelines.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-4">1</div>
              <h4 className="font-bold text-slate-900 mb-1">Search & Doctor Discovery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Filter by clinical specialty, experience, reviews, and consultation fee with instant search.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-4">2</div>
              <h4 className="font-bold text-slate-900 mb-1">Dynamic Slot Calculation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Server calculates open 30-min slots based on doctor hours and active reservations to avoid double booking.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-4">3</div>
              <h4 className="font-bold text-slate-900 mb-1">Clinical Intake & Triage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Patient reports symptoms, duration, and vitals. Triage engine scores urgency and locks reference code.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-4">4</div>
              <h4 className="font-bold text-slate-900 mb-1">Consult & Digital Rx</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Doctor examines triage queue, records diagnosis & vitals, prescribes drugs, and marks consultation complete.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
