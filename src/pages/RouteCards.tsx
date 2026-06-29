import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { RouteCard } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Map, 
  Calendar, 
  X, 
  Save, 
  AlertCircle,
  Loader2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { AddRouteCardModal } from '../components/Modals';

export default function RouteCards() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [routes, setRoutes] = useState<RouteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Edit state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteCard | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('All');

  const loadRoutes = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      const data = await dataService.getRouteCards(user.id);
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load route cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleDelete = async (row: RouteCard) => {
    const tableName = 'route_cards';
    console.log("Delete clicked", { tableName, recordId: row.id, row });
    if (!row.id) {
      alert('Error: record ID is missing');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this route card?')) return;
    try {
      await dataService.deleteRouteCard(userId, row.id);
      alert('Route card deleted successfully.');
      await loadRoutes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete route card');
    }
  };

  // Filter Logic
  const filteredRoutes = routes.filter(r => {
    const matchesSearch = 
      r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.carrier_or_airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.common_cargo_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.possible_solution.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = modeFilter === 'All' || r.mode === modeFilter;

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-5">
          <div>
            <h2 className="text-xl font-display font-semibold text-white tracking-tight">Route Cards</h2>
            <p className="text-xs text-gray-400 mt-1">Design target routes, map carrier schedules, and build pitch strategies.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            id="btn-add-route-page"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Route Card
          </button>
      </header>

      {/* FILTER PANEL */}
      <section className="bg-gray-900/20 border border-gray-800/80 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search port origin, destination, carrier, pitch details..."
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
          >
            <option value="All">All Modes</option>
            <option value="Air">Air Freight</option>
            <option value="Ocean">Ocean Freight</option>
            <option value="Rail">Rail Freight</option>
            <option value="Road">Road Freight</option>
            <option value="Express">Express</option>
          </select>
        </div>
      </section>

      {/* CARDS LIST */}
      {loading ? (
        <div className="text-xs font-mono text-gray-500 text-center py-10">Loading route profiles...</div>
      ) : filteredRoutes.length === 0 ? (
        <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">No route cards recorded yet.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 mt-2 cursor-pointer"
          >
            Create your first route profile now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRoutes.map((r) => {
            const modeColors = {
              Air: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
              Ocean: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              Rail: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              Road: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              Express: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            };

            return (
              <div 
                key={r.id} 
                id={`route-card-${r.id}`}
                className="bg-gray-900/30 border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition"
              >
                <div>
                  {/* Title / Path */}
                  <div className="flex justify-between items-start gap-2 border-b border-gray-800/40 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-950 p-1.5 rounded-lg border border-gray-800 font-mono text-xs font-bold text-white tracking-wider">
                        {r.origin}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <div className="bg-gray-950 p-1.5 rounded-lg border border-gray-800 font-mono text-xs font-bold text-white tracking-wider">
                        {r.destination}
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${modeColors[r.mode]}`}>
                      {r.mode}
                    </span>
                  </div>

                  {/* Core Logistics */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-950/20 border border-gray-800/40 rounded-xl p-3 text-xs mb-4">
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase">Carrier</span>
                      <span className="font-semibold text-gray-300 block truncate mt-0.5">{r.carrier_or_airline}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase">Transit Time</span>
                      <span className="font-semibold text-gray-300 block mt-0.5">{r.transit_time || 'Direct'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase">Routing Hub</span>
                      <span className="font-semibold text-gray-300 block mt-0.5">{r.transshipment_point || 'Direct'}</span>
                    </div>
                  </div>

                  {/* Cargo type & Gaps */}
                  <div className="space-y-3.5 text-xs mb-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase">Common Cargo Type</span>
                        <p className="text-gray-300 mt-0.5">{r.common_cargo_type || 'General Cargo'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold block text-[10px] uppercase">Destination Agent Role</span>
                        <p className="text-gray-300 mt-0.5">{r.agent_role || 'No specific coordination'}</p>
                      </div>
                    </div>

                    {r.common_issue && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide block">Operational Gaps / Bottlenecks</span>
                        <p className="text-gray-300 mt-0.5 leading-relaxed">{r.common_issue}</p>
                      </div>
                    )}

                    {r.customer_objection && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide block">Customer Objection</span>
                          <p className="text-gray-300 mt-0.5 leading-relaxed">"{r.customer_objection}"</p>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-gray-800/40 pt-2.5 sm:pt-0 sm:pl-3">
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide block">Commercial Response / Pitch</span>
                          <p className="text-gray-300 mt-0.5 leading-relaxed font-medium">"{r.possible_solution}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="border-t border-gray-800/40 pt-3 mt-auto flex justify-end gap-1.5 text-xs">
                  <button
                    onClick={() => setEditingRoute(r)}
                    id={`btn-edit-route-${r.id}`}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    id={`btn-delete-route-${r.id}`}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-400 transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD ROUTE CARD MODAL */}
      <AddRouteCardModal
        userId={userId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={loadRoutes}
      />

      {/* EDIT ROUTE CARD MODAL */}
      {editingRoute && (
        <EditRouteCardModalWrapper
          userId={userId}
          route={editingRoute}
          onClose={() => setEditingRoute(null)}
          onSave={loadRoutes}
        />
      )}
    </div>
  );
}

// EDIT ROUTE CARD WRAPPER
function EditRouteCardModalWrapper({
  userId,
  route,
  onClose,
  onSave
}: {
  userId: string;
  route: RouteCard;
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...route });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.carrier_or_airline) {
      setError('Please fill in origin, destination, and carrier');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.updateRouteCard(userId, route.id, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update route card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Edit Route Card Details</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Origin *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Destination *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mode</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as any})}>
                <option value="Air">Air</option>
                <option value="Ocean">Ocean</option>
                <option value="Rail">Rail</option>
                <option value="Road">Road</option>
                <option value="Express">Express</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Carrier/Airline *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.carrier_or_airline} onChange={e => setForm({...form, carrier_or_airline: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Transit Time</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.transit_time} onChange={e => setForm({...form, transit_time: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Transshipment</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.transshipment_point} onChange={e => setForm({...form, transshipment_point: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Common Cargo Type</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.common_cargo_type} onChange={e => setForm({...form, common_cargo_type: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Overseas Agent Role</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.agent_role} onChange={e => setForm({...form, agent_role: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Common Issue / Bottleneck</label>
            <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.common_issue} onChange={e => setForm({...form, common_issue: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Customer Objection</label>
              <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.customer_objection} onChange={e => setForm({...form, customer_objection: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Possible Pitch / Solution</label>
              <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.possible_solution} onChange={e => setForm({...form, possible_solution: e.target.value})} />
            </div>
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
