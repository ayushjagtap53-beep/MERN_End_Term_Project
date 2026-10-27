import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Award,
  Stethoscope,
  DollarSign,
  ChevronRight,
  Loader2
} from 'lucide-react';

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Dermatology',
  'General Medicine',
  'Pediatrics',
  'Neurology',
  'Orthopedics'
];

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, sortBy]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedSpecialty !== 'All') params.specialty = selectedSpecialty;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get('/doctors', { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError('Could not load specialist directory. Please ensure the backend server and MongoDB are connected.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Specialist Directory</h1>
        <p className="text-slate-600 text-sm mt-1">
          Explore board-certified medical specialists, check real-time availability, and initiate clinical triage intake.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by physician name, specialty, or clinic facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
              <Filter className="w-4 h-4 text-slate-400" />
              Sort By:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee_asc">Consultation Fee: Low to High</option>
              <option value="fee_desc">Consultation Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Specialty Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <p className="font-semibold">{error}</p>
          <p className="text-xs text-amber-700 mt-1">Tip: In terminal, run <code>npm run seed</code> inside the server folder to populate specialist profiles.</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium">Querying specialist availability...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Specialists Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No doctors matched your current search criteria. Try selecting another specialty or reset filters.
          </p>
          <button
            onClick={() => {
              setSelectedSpecialty('All');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Doctor Cards Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
            >
              <div className="p-6 flex-1 space-y-4">
                {/* Doctor Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-100 mb-1.5">
                      {doc.specialty}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-600 transition">
                      {doc.user?.name || 'Medical Specialist'}
                    </h3>
                    <p className="text-xs text-slate-500">{doc.qualification}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-800">{doc.averageRating.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400">({doc.reviewCount})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.bio}
                </p>

                {/* Details list */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {doc.clinicAddress?.hospitalName}, {doc.clinicAddress?.roomNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {doc.workingHours?.start} - {doc.workingHours?.end} ({doc.workingHours?.slotDurationMinutes}m slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.experienceYears} Years Clinical Experience</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Consultation Fee</span>
                  <span className="text-base font-extrabold text-slate-900">${doc.consultationFee}</span>
                </div>

                <Link
                  to={`/doctors/${doc._id}`}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-xs hover:bg-teal-700 transition flex items-center gap-1.5"
                >
                  Book Slot
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
