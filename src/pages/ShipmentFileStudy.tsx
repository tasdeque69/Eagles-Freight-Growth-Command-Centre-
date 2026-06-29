import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, getLocalDateString } from '../lib/dataService';
import { ShipmentFile } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Calendar, 
  X, 
  Save, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { AddShipmentFileModal } from '../components/Modals';

export default function ShipmentFileStudy() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [shipments, setShipments] = useState<ShipmentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Edit form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<ShipmentFile | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('All');

  const loadShipments = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      const data = await dataService.getShipmentFiles(user.id);
      setShipments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleDelete = async (row: ShipmentFile) => {
    const tableName = 'shipment_files';
    console.log("Delete clicked", { tableName, recordId: row.id, row });
    if (!row.id) {
      alert('Error: record ID is missing');
      return;
    }
    if (!window.confirm('Delete this shipment file study?')) return;
    try {
      await dataService.deleteShipmentFile(userId, row.id);
      alert('Shipment file study deleted successfully.');
      loadShipments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete file');
    }
  };

  // Filter Logic
  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.shipment_route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer_requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.key_learning.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = modeFilter === 'All' || s.mode === modeFilter;

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Shipment File Studies</h2>
          <p className="text-xs text-gray-400 mt-1">Study operational files, identify service gaps, and extract commercial golden rules.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          id="btn-add-shipment-page"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Study File
        </button>
      </header>

      {/* FILTER CONTROLS */}
      <section className="bg-gray-900/20 border border-gray-800/80 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search route, requirement, learning takeaways..."
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
            <option value="All">All Shipping Modes</option>
            <option value="Air">Air</option>
            <option value="Ocean">Ocean</option>
            <option value="Rail">Rail</option>
            <option value="Road">Road</option>
            <option value="Express">Express</option>
          </select>
        </div>
      </section>

      {/* FILES TIMELINE/GRID */}
      {loading ? (
        <div className="text-xs font-mono text-gray-500 text-center py-10">Loading study files...</div>
      ) : filteredShipments.length === 0 ? (
        <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">No studied files match your query.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 mt-2 cursor-pointer"
          >
            Study your first shipment file now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredShipments.map((s) => {
            const modeColors = {
              Air: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
              Ocean: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              Rail: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              Road: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              Express: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            };

            return (
              <div 
                key={s.id} 
                id={`shipment-card-${s.id}`}
                className="bg-gray-900/30 border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex justify-between items-start gap-2 border-b border-gray-800/40 pb-3 mb-3 text-xs">
                    <div>
                      <span className="font-mono text-gray-500 uppercase">Route Analysis</span>
                      <h4 className="text-sm font-semibold text-white tracking-tight mt-0.5">{s.shipment_route}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${modeColors[s.mode]}`}>
                        {s.mode}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {s.date}
                      </span>
                    </div>
                  </div>

                  {/* Core checklist info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-950/20 border border-gray-800/40 rounded-xl p-3.5 text-xs mb-4">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Booking Status</span>
                      <span className="font-medium text-gray-300 mt-0.5 block">{s.booking_status || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Docs Status</span>
                      <span className="font-medium text-gray-300 mt-0.5 block">{s.document_status || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Handover Status</span>
                      <span className="font-medium text-gray-300 mt-0.5 block truncate">{s.cargo_handover_status || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Cut-off date</span>
                      <span className="font-medium text-gray-300 mt-0.5 block font-mono">{s.cut_off_date || 'None'}</span>
                    </div>
                  </div>

                  {/* Customer constraints & operational problems */}
                  <div className="space-y-3 mb-4 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-semibold uppercase tracking-wider">Customer Target Requirements</span>
                      <p className="text-gray-300 mt-0.5 leading-relaxed bg-gray-900/40 border border-gray-800/50 p-2.5 rounded-lg">{s.customer_requirement}</p>
                    </div>

                    {(s.problem_or_delay || s.solution_taken) && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Observed Bottleneck</span>
                          <p className="text-gray-300 mt-0.5 leading-relaxed">{s.problem_or_delay || 'No major issues recorded'}</p>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-gray-800/40 pt-2.5 sm:pt-0 sm:pl-3">
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Remedial Action Taken</span>
                          <p className="text-gray-300 mt-0.5 leading-relaxed">{s.solution_taken || 'No action required'}</p>
                        </div>
                      </div>
                    )}

                    {/* KEY TAKEAWAY GOLDEN RULE */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex gap-2.5 items-start">
                      <Tag className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide block">Golden Learning Rule</span>
                        <p className="text-gray-200 mt-0.5 font-medium leading-relaxed italic">"{s.key_learning}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="border-t border-gray-800/40 pt-3 flex justify-end items-center gap-1.5">
                  <button
                    onClick={() => setEditingShipment(s)}
                    id={`btn-edit-shipment-${s.id}`}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Study
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    id={`btn-delete-shipment-${s.id}`}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-400 transition cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD SHIPMENT MODAL */}
      <AddShipmentFileModal
        userId={userId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={loadShipments}
      />

      {/* EDIT SHIPMENT MODAL */}
      {editingShipment && (
        <EditShipmentModalWrapper
          userId={userId}
          shipment={editingShipment}
          onClose={() => setEditingShipment(null)}
          onSave={loadShipments}
        />
      )}
    </div>
  );
}

// EDIT SHIPMENT MODAL WRAPPER
function EditShipmentModalWrapper({
  userId,
  shipment,
  onClose,
  onSave
}: {
  userId: string;
  shipment: ShipmentFile;
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...shipment });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.shipment_route || !form.customer_requirement || !form.key_learning) {
      setError('Please fill in route, requirement, and key learning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.updateShipmentFile(userId, shipment.id, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update shipment study');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Edit Shipment File Study</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Study Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mode *</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as any})}>
                <option value="Ocean">Ocean</option>
                <option value="Air">Air</option>
                <option value="Rail">Rail</option>
                <option value="Road">Road</option>
                <option value="Express">Express</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Shipment Route *</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.shipment_route} onChange={e => setForm({...form, shipment_route: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Customer Requirement *</label>
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.customer_requirement} onChange={e => setForm({...form, customer_requirement: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Booking Status</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.booking_status} onChange={e => setForm({...form, booking_status: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Document Status</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.document_status} onChange={e => setForm({...form, document_status: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Port Cut-off Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.cut_off_date} onChange={e => setForm({...form, cut_off_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Cargo Handover Status</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.cargo_handover_status} onChange={e => setForm({...form, cargo_handover_status: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Problem or Delay</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.problem_or_delay} onChange={e => setForm({...form, problem_or_delay: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Solution Taken</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.solution_taken} onChange={e => setForm({...form, solution_taken: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Key Learning / Golden Rule *</label>
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.key_learning} onChange={e => setForm({...form, key_learning: e.target.value})} />
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
