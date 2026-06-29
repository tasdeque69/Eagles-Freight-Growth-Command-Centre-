import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { JournalEntry } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Calendar, 
  X, 
  Save, 
  AlertCircle,
  Loader2,
  FileCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { AddJournalModal } from '../components/Modals';

export default function FreightJournal() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Edit state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  const loadEntries = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      const data = await dataService.getJournalEntries(user.id);
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync journal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (row: JournalEntry) => {
    const tableName = 'journal_entries';
    console.log("Delete clicked", { tableName, recordId: row.id, row });
    if (!row.id) {
      alert('Error: record ID is missing');
      return;
    }
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await dataService.deleteJournalEntry(userId, row.id);
      alert('Journal entry deleted successfully.');
      await loadEntries();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  const filteredEntries = entries.filter(j => {
    const term = searchTerm.toLowerCase();
    return (
      j.date.includes(term) ||
      j.today_i_learned.toLowerCase().includes(term) ||
      j.tomorrow_target.toLowerCase().includes(term) ||
      j.one_document_i_saw.toLowerCase().includes(term) ||
      j.one_shipment_route_i_studied.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Freight Journal</h2>
          <p className="text-xs text-gray-400 mt-1">Reflect on daily lessons, document clearances, and map future targets.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          id="btn-add-journal-page"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Write Journal Log
        </button>
      </header>

      {/* FILTER PANEL */}
      <section className="bg-gray-900/20 border border-gray-800/80 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search dates, lessons learned, route studies, document types..."
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* TIMELINE LIST */}
      {loading ? (
        <div className="text-xs font-mono text-gray-500 text-center py-10">Loading journal timelines...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">No journal logs filed yet.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 mt-2 cursor-pointer"
          >
            File your first daily log now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((j) => (
            <div 
              key={j.id} 
              id={`journal-card-${j.id}`}
              className="bg-gray-900/30 border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 transition"
            >
              {/* Left timeline col: Date badge */}
              <div className="md:w-44 shrink-0 flex flex-col gap-1 text-xs">
                <span className="text-[10px] text-gray-500 font-mono uppercase">Log Entry Date</span>
                <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" /> {j.date}
                </span>
                <div className="mt-3 hidden md:flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded w-fit">
                  <FileCheck className="w-3.5 h-3.5" /> Checked Routine
                </div>
              </div>

              {/* Middle col: Core notes */}
              <div className="flex-1 space-y-4 text-xs">
                {/* 1. Today I learned */}
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Today I Learned</span>
                  <p className="text-gray-200 mt-1 leading-relaxed bg-gray-950/20 border border-gray-800/40 p-3 rounded-xl font-medium">
                    {j.today_i_learned}
                  </p>
                </div>

                {/* 2. Key entities checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-950/10 border border-gray-800/30 rounded-xl p-3 text-[11px]">
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px]">Document Inspected</span>
                    <span className="font-semibold text-gray-300 block truncate mt-0.5">{j.one_document_i_saw || 'None logged'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px]">Route Studied</span>
                    <span className="font-semibold text-gray-300 block truncate mt-0.5">{j.one_shipment_route_i_studied || 'None logged'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px]">Prospect Contacted</span>
                    <span className="font-semibold text-gray-300 block truncate mt-0.5">{j.one_customer_followed_up || 'None logged'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px]">Overseas Agent</span>
                    <span className="font-semibold text-gray-300 block truncate mt-0.5">{j.one_agent_contacted || 'None logged'}</span>
                  </div>
                </div>

                {/* Gaps / Mistakes */}
                {j.one_mistake_found && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide block">Observed Oversight or Operational Gap</span>
                    <p className="text-gray-300 mt-0.5 leading-relaxed italic">"{j.one_mistake_found}"</p>
                  </div>
                )}

                {/* Tomorrow Target */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex gap-2.5 items-start">
                  <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide block">Tomorrow's Core Objective</span>
                    <p className="text-gray-200 mt-0.5 font-semibold leading-relaxed">{j.tomorrow_target}</p>
                  </div>
                </div>
              </div>

              {/* Right col: Controls */}
              <div className="md:w-28 shrink-0 flex md:flex-col justify-end md:justify-start items-center md:items-end gap-1.5 border-t md:border-t-0 border-gray-800/40 pt-3 md:pt-0">
                <button
                  onClick={() => setEditingEntry(j)}
                  id={`btn-edit-journal-${j.id}`}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Log
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(j)}
                  id={`btn-delete-journal-${j.id}`}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-400 transition cursor-pointer text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WRITE JOURNAL MODAL */}
      <AddJournalModal
        userId={userId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={loadEntries}
      />

      {/* EDIT JOURNAL MODAL */}
      {editingEntry && (
        <EditJournalModalWrapper
          userId={userId}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={loadEntries}
        />
      )}
    </div>
  );
}

// EDIT JOURNAL WRAPPER
function EditJournalModalWrapper({
  userId,
  entry,
  onClose,
  onSave
}: {
  userId: string;
  entry: JournalEntry;
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...entry });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.today_i_learned || !form.tomorrow_target) {
      setError('Please fill in Today I Learned and Tomorrow\'s Target');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.addJournalEntry(userId, form); // upserts correctly based on date key
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Edit Freight Journal Log</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Journal Date</label>
            <input disabled type="date" className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-gray-500 cursor-not-allowed outline-none" value={form.date} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Today I Learned *</label>
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.today_i_learned} onChange={e => setForm({...form, today_i_learned: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">One Document I Saw</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_document_i_saw} onChange={e => setForm({...form, one_document_i_saw: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">One Shipment Route Studied</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_shipment_route_i_studied} onChange={e => setForm({...form, one_shipment_route_i_studied: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">One Customer/Prospect Followed Up</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_customer_followed_up} onChange={e => setForm({...form, one_customer_followed_up: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">One Agent Contacted</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_agent_contacted} onChange={e => setForm({...form, one_agent_contacted: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">One Mistake or Gap Found</label>
            <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_mistake_found} onChange={e => setForm({...form, one_mistake_found: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Tomorrow's Target *</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.tomorrow_target} onChange={e => setForm({...form, tomorrow_target: e.target.value})} />
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
