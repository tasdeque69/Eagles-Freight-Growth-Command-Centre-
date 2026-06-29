import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { Profile } from '../types';
import { 
  Settings, 
  User, 
  Building2, 
  ShieldAlert, 
  Check, 
  Database, 
  LogOut, 
  Save, 
  AlertCircle,
  Loader2,
  Calendar,
  Trash2,
  Play
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    role: '',
    companyName: '',
    roadmapStartDate: ''
  });

  // Diagnostics State
  const [diagTable, setDiagTable] = useState('prospects');
  const [diagRecords, setDiagRecords] = useState<any[]>([]);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState('');
  const [diagSuccess, setDiagSuccess] = useState('');

  const loadProfile = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const data = await dataService.getProfile(user.id);
      if (data) {
        setProfile(data);
        setForm({
          fullName: data.full_name,
          role: data.role,
          companyName: data.company_name,
          roadmapStartDate: data.roadmap_start_date
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFetchDiagRecords = async () => {
    setDiagLoading(true);
    setDiagError('');
    setDiagSuccess('');
    try {
      const user = await dataService.getCurrentUser();
      if (!user) throw new Error("No authenticated user");
      
      let data: any[] = [];
      const supabase = dataService.getSupabaseClient();
      if (supabase) {
        const { data: res, error: err } = await supabase
          .from(diagTable)
          .select('*')
          .eq('user_id', user.id)
          .limit(5);
        if (err) throw err;
        data = res || [];
      } else {
        const key = `freight_bd_${diagTable}_${user.id}`;
        const localData = localStorage.getItem(key);
        if (localData) {
          data = JSON.parse(localData).slice(0, 5);
        }
      }
      setDiagRecords(data);
      setDiagSuccess(`Successfully fetched ${data.length} records from '${diagTable}'.`);
    } catch (err: any) {
      console.error("Diagnostic fetch failed:", err);
      setDiagError(err.message || 'Failed to fetch diagnostic records');
    } finally {
      setDiagLoading(false);
    }
  };

  const handleDiagDelete = async (record: any) => {
    if (!window.confirm(`Force delete record ${record.id} from ${diagTable} via diagnostics?`)) return;
    setDiagLoading(true);
    setDiagError('');
    setDiagSuccess('');
    try {
      console.log('Diagnostic delete trigger', { table: diagTable, id: record.id, row: record });
      await dataService.deleteRecord(diagTable as any, record.id);
      setDiagSuccess(`Record ${record.id} successfully deleted from ${diagTable}.`);
      await handleFetchDiagRecords();
    } catch (err: any) {
      console.error("Diagnostic delete failed:", err);
      setDiagError(err.message || 'Failed to delete record');
      setDiagLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!form.fullName || !form.companyName || !form.role) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await dataService.saveProfile({
        user_id: profile.user_id,
        full_name: form.fullName,
        role: form.role,
        company_name: form.companyName,
        roadmap_start_date: form.roadmapStartDate
      });
      setSuccess('Profile modifications saved successfully.');
      loadProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dataService.logout();
      navigate('/login');
    } catch (err: any) {
      alert(err.message || 'Failed to logout');
    }
  };

  if (loading) {
    return <div className="text-xs font-mono text-gray-500 text-center py-10">Fetching system configurations...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <header className="border-b border-gray-800/60 pb-5">
        <h2 className="text-xl font-display font-semibold text-white tracking-tight">System Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure profile information, verify cloud database bridges, and manage active sessions.</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* CORE PROFILE CONFIGURATION */}
      <section className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-5 md:p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> Executive User Settings
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Full Name *</label>
              <input 
                required 
                type="text" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500" 
                value={form.fullName} 
                onChange={e => setForm({...form, fullName: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Corporate Title / Role *</label>
              <input 
                required 
                type="text" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500" 
                value={form.role} 
                onChange={e => setForm({...form, role: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Company Name *</label>
              <input 
                required 
                type="text" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500" 
                value={form.companyName} 
                onChange={e => setForm({...form, companyName: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Roadmap Tracker Start Date *</label>
              <input 
                required 
                type="date" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500 font-mono" 
                value={form.roadmapStartDate} 
                onChange={e => setForm({...form, roadmapStartDate: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Settings Changes
          </button>
        </form>
      </section>

      {/* DATABASE CLOUD CONNECTION STATUS */}
      <section className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-5 md:p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" /> Database Pipeline Status
        </h3>

        {isSupabaseConfigured ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 flex gap-3 items-start text-xs leading-relaxed">
            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="font-semibold block text-white">Supabase Cloud Database Connected</span>
              <p className="text-gray-400 mt-1">
                Your application is connected to live PostgreSQL servers. All logs, prospects, route profiles, and reviews are stored securely with user isolated Row Level Security (RLS).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl p-4 flex gap-3 items-start text-xs leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold block text-white">Local Storage (Demo Mode) Active</span>
              <p className="text-gray-400 mt-1">
                The application is running in an offline-friendly sandbox using your local browser database. Your data is persists between page reloads, but won't sync with cloud resources unless live Supabase credentials are set in your Secrets panel.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* DELETE DIAGNOSTICS PANEL */}
      <section className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Temporary Delete Diagnostics Panel
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Troubleshoot database deletions, inspect row level security (RLS) policies, and confirm exact user context.
          </p>
        </div>

        {diagError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl">
            {diagError}
          </div>
        )}

        {diagSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl">
            {diagSuccess}
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-400">Target Table:</span>
          <select 
            className="bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-white"
            value={diagTable}
            onChange={(e) => {
              setDiagTable(e.target.value);
              setDiagRecords([]);
            }}
          >
            <option value="prospects">prospects</option>
            <option value="customer_touches">customer_touches</option>
            <option value="shipment_files">shipment_files</option>
            <option value="route_cards">route_cards</option>
            <option value="journal_entries">journal_entries</option>
            <option value="five_year_roadmap">five_year_roadmap</option>
            <option value="annual_goals">annual_goals</option>
            <option value="quarterly_sprints">quarterly_sprints</option>
            <option value="skill_matrix">skill_matrix</option>
            <option value="market_intelligence">market_intelligence</option>
            <option value="ai_prompt_library">ai_prompt_library</option>
            <option value="growth_portfolio">growth_portfolio</option>
          </select>

          <button
            type="button"
            onClick={handleFetchDiagRecords}
            disabled={diagLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {diagLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Query Records
          </button>
        </div>

        {diagRecords.length > 0 ? (
          <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-950/40 text-[11px] font-mono">
            <div className="bg-gray-900/50 px-3 py-2 border-b border-gray-800 font-bold text-gray-400 grid grid-cols-12 gap-2">
              <div className="col-span-4">Record ID</div>
              <div className="col-span-6">Details / Summary</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            <div className="divide-y divide-gray-800/40">
              {diagRecords.map((rec) => (
                <div key={rec.id} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-gray-900/20 text-gray-300">
                  <div className="col-span-4 truncate text-gray-500" title={rec.id}>{rec.id}</div>
                  <div className="col-span-6 truncate">
                    {rec.company_name || rec.theme || rec.goal_title || rec.headline || rec.prompt_title || rec.evidence_title || rec.message_summary || rec.shipment_route || rec.origin || rec.today_i_learned || 'No title field'}
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDiagDelete(rec)}
                      className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition"
                      title="Diag Force Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !diagLoading && (
          <div className="text-center py-4 border border-gray-850 border-dashed rounded-xl text-gray-500 text-xs">
            No active diagnostic records retrieved. Select a table and run query.
          </div>
        )}
      </section>

      {/* AUTH ACTIONS */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs"
        >
          <LogOut className="w-4 h-4" /> Terminate Active Session
        </button>
      </div>
    </div>
  );
}
