import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, getLocalDateString } from '../lib/dataService';
import { ShieldAlert, Loader2, Save, Rocket } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    role: 'Business Development Executive',
    company_name: 'The Eagles Company',
    roadmap_start_date: getLocalDateString()
  });

  useEffect(() => {
    dataService.getCurrentUser().then(user => {
      if (!user) {
        navigate('/login');
      } else {
        setUserId(user.id);
        // If profile already exists, redirect to dashboard
        dataService.getProfile(user.id).then(profile => {
          if (profile) {
            navigate('/');
          }
        }).catch(err => console.error("Profile check error:", err));
      }
    }).catch(err => console.error("Auth check error:", err));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setError('Please provide your Full Name');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await dataService.saveProfile({
        user_id: userId,
        full_name: form.full_name,
        role: form.role,
        company_name: form.company_name,
        roadmap_start_date: form.roadmap_start_date
      });
      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to save onboarding profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-[#0c111e]/90 border border-gray-800/80 p-8 rounded-2xl shadow-2xl relative glow-accent">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20">
              <Rocket className="w-7 h-7 text-blue-500" />
            </div>
          </div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">
            Onboard Command Center
          </h2>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Please configure your Business Development settings before starting Phase 1 tracking.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Full Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Alexander Eagles"
              className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Role Description</label>
            <input
              type="text"
              className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Company Name</label>
            <input
              type="text"
              className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
              value={form.company_name}
              onChange={e => setForm({...form, company_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Roadmap Start Date</label>
            <input
              type="date"
              className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
              value={form.roadmap_start_date}
              onChange={e => setForm({...form, roadmap_start_date: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-onboarding-submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition text-sm mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Enter Command Center
          </button>
        </form>
      </div>
    </div>
  );
}
