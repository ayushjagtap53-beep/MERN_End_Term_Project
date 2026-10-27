import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle, Loader2, UserCheck, Stethoscope } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate(redirectPath === '/login' ? '/doctors' : redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'patient') {
      setEmail('patient@mediflow.com');
      setPassword('password123');
    } else {
      setEmail('doctor@mediflow.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to MediFlow</h2>
          <p className="text-xs text-slate-500">Access your clinical consultations, triage records, and doctor portal.</p>
        </div>

        {/* Demo Fast-Fill Pill Buttons for Evaluators */}
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 space-y-2 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
            1-Click Evaluator Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('patient')}
              className="py-1.5 px-2 bg-white hover:bg-teal-100/50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800 transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              Demo Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('doctor')}
              className="py-1.5 px-2 bg-white hover:bg-teal-100/50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800 transition flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Demo Doctor
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In to MediFlow
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
