import React, { useState, useEffect } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { dataService, getLocalDateString } from '../lib/dataService';
import { Prospect } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  MapPin, 
  Sparkles, 
  Phone, 
  Calendar,
  AlertCircle,
  X,
  Save,
  MessageSquare,
  TrendingUp,
  Quote,
  Loader2
} from 'lucide-react';
import { AddProspectModal } from '../components/Modals';

export default function ProspectTracker() {
  const navigate = useNav();
  const [userId, setUserId] = useState('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals / forms state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [marketFilter, setMarketFilter] = useState<string>('All');

  const loadProspects = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      const data = await dataService.getProspects(user.id);
      setProspects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prospects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const handleDelete = async (row: Prospect) => {
    const tableName = 'prospects';
    console.log("Delete clicked", { tableName, recordId: row.id, row });
    if (!row.id) {
      alert('Error: record ID is missing');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this prospect?')) return;
    try {
      await dataService.deleteProspect(userId, row.id);
      alert('Prospect deleted successfully.');
      loadProspects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete prospect');
    }
  };

  // Extract unique export markets for filters
  const uniqueMarkets = Array.from(
    new Set(prospects.map(p => p.export_market).filter(Boolean))
  );

  // Filter & Search Logic
  const filteredProspects = prospects.filter(p => {
    const matchesSearch = 
      p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.commercial_contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone_or_email && p.phone_or_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesMarket = marketFilter === 'All' || p.export_market === marketFilter;

    return matchesSearch && matchesStatus && matchesMarket;
  });

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Prospect Board</h2>
          <p className="text-xs text-gray-400 mt-1">Research, screen, and target high-value logistics leads.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          id="btn-add-prospect-page"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Prospect
        </button>
      </header>

      {/* SEARCH AND FILTER BAR */}
      <section className="bg-gray-900/20 border border-gray-800/80 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search company, contact, location..."
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Negotiating">Negotiating</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>

        {/* Export Market Filter */}
        <div>
          <select
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            value={marketFilter}
            onChange={e => setMarketFilter(e.target.value)}
          >
            <option value="All">All Export Markets</option>
            {uniqueMarkets.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </section>

      {/* PROSPECT LIST/CARDS */}
      {loading ? (
        <div className="text-xs font-mono text-gray-500 text-center py-10">Syncing with database...</div>
      ) : filteredProspects.length === 0 ? (
        <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">No prospects match your search criteria.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 mt-2 cursor-pointer"
          >
            Add your first prospect now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProspects.map((p) => {
            const statusColors: Record<Prospect['status'], string> = {
              'New': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              'Contacted': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
              'Negotiating': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              'Closed Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              'Closed Lost': 'bg-red-500/10 text-red-400 border-red-500/20'
            };

            return (
              <div 
                key={p.id} 
                id={`prospect-card-${p.id}`}
                className="bg-gray-900/30 border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Title Bar */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{p.company_name}</h3>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-600" /> {p.location}
                      </p>
                    </div>
                    <span className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Core details list */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-950/20 border border-gray-800/40 rounded-xl p-3.5 text-xs mb-4">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Product & Market</span>
                      <span className="font-medium text-gray-300 mt-0.5 block truncate">{p.product_type || 'Unspecified'} ({p.export_market || 'Global'})</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Decision Maker</span>
                      <span className="font-medium text-gray-300 mt-0.5 block truncate flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-500" /> {p.commercial_contact_person}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-gray-800/40 pt-2.5">
                      <span className="block text-[10px] text-gray-500 uppercase">Target Route</span>
                      <span className="font-medium text-blue-400 mt-0.5 block truncate">{p.possible_shipment_route || 'Not studied yet'}</span>
                    </div>
                  </div>

                  {/* Pain point & notes */}
                  <div className="space-y-2 mb-4 text-xs">
                    {p.possible_pain_point && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                        <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide block">Identified Pain Point</span>
                        <p className="text-gray-300 mt-0.5 leading-relaxed">{p.possible_pain_point}</p>
                      </div>
                    )}
                    {p.notes && (
                      <p className="text-gray-400 leading-relaxed italic bg-gray-950/10 p-2.5 rounded-lg border border-gray-800/30">
                        "{p.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Action & CTA Buttons */}
                <div className="border-t border-gray-800/60 pt-4 mt-auto flex justify-between items-center text-xs">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="block text-[9px] text-gray-500 uppercase tracking-wider">Next Objective Action</span>
                    <p className="font-semibold text-blue-400 truncate mt-0.5">{p.next_action || 'Set next action'}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingProspect(p)}
                      id={`btn-edit-prospect-${p.id}`}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                      title="Edit Prospect"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      id={`btn-delete-prospect-${p.id}`}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-400 transition cursor-pointer"
                      title="Delete Prospect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      <AddProspectModal
        userId={userId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={loadProspects}
      />

      {/* EDIT PROSPECT MODAL */}
      {editingProspect && (
        <EditProspectModalWrapper
          userId={userId}
          prospect={editingProspect}
          onClose={() => setEditingProspect(null)}
          onSave={loadProspects}
        />
      )}
    </div>
  );
}

// EDIT PROSPECT MODAL WRAPPER
function EditProspectModalWrapper({ 
  userId, 
  prospect, 
  onClose, 
  onSave 
}: { 
  userId: string; 
  prospect: Prospect; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...prospect });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.location || !form.commercial_contact_person) {
      setError('Please fill in required fields (Company, Location, Contact Person)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.updateProspect(userId, prospect.id, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Edit Prospect Details</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Company Name *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Location *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Product Type</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.product_type} onChange={e => setForm({...form, product_type: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Export Market</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.export_market} onChange={e => setForm({...form, export_market: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Contact Person *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.commercial_contact_person} onChange={e => setForm({...form, commercial_contact_person: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Phone or Email</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.phone_or_email} onChange={e => setForm({...form, phone_or_email: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Possible Shipment Route</label>
            <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.possible_shipment_route} onChange={e => setForm({...form, possible_shipment_route: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Possible Pain Point</label>
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.possible_pain_point || ''} onChange={e => setForm({...form, possible_pain_point: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Next Action</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.next_action} onChange={e => setForm({...form, next_action: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Follow-up Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.follow_up_date} onChange={e => setForm({...form, follow_up_date: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Status</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.status} onChange={e => setForm({...form, status: e.target.value as Prospect['status']})}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Notes</label>
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
