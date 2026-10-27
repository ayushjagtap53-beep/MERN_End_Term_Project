import React from 'react';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-200">
              MediFlow <span className="text-teal-400 font-normal">| Clinical Triage & Appointment Engine</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Role-Based HIPAA Compliant Workflow
            </span>
            <span className="flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              Real-time Algorithmic Urgency Scoring
            </span>
          </div>

          <p className="text-xs text-slate-500">
            End-Term Capstone Software Project &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
