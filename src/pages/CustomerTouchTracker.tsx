import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, getLocalDateString } from '../lib/dataService';
import { CustomerTouch, Prospect } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  Calendar, 
  Quote, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { AddTouchModal } from '../components/Modals';

export default function CustomerTouchTracker() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [touches, setTouches] = useState<CustomerTouch[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / edit forms
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTouch, setEditingTouch] = useState<CustomerTouch | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [trialQuoteFilter, setTrialQuoteFilter] = useState<string>('All');

  const loadData = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      
      const [touchList, prospectList] = await Promise.all([
        dataService.getCustomerTouches(user.id),
        dataService.getProspects(user.id)
      ]);

      setTouches(touchList);
      setProspects(prospectList);
    } catch (err: any) {
      setError(err.message || 'Failed to sync touches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (row: CustomerTouch) => {
    const tableName = 'customer_touches';
    console.log("Delete clicked", { tableName, recordId: row.id, row });
    if (!row.id) {
      alert('Error: record ID is missing');
      return;
    }
    if (!window.confirm('Delete this customer touch record?')) return;
    try {
      await dataService.deleteCustomerTouch(userId, row.id);
      alert('Record deleted successfully.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const getProspectName = (prospectId?: string) => {
    if (!prospectId) return 'General Prospect / Direct Entry';
    const found = prospects.find(p => p.id === prospectId);
    return found ? found.company_name : 'Unknown Prospect';
  };

  // Filter logic
  const filteredTouches = touches.filter(t => {
    const pName = getProspectName(t.prospect_id).toLowerCase();
    const summary = t.message_summary.toLowerCase();
    const response = t.response_status.toLowerCase();
    
    const matchesSearch = 
      pName.includes(searchTerm.toLowerCase()) || 
      summary.includes(searchTerm.toLowerCase()) ||
      response.includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || t.touch_type === typeFilter;
    
    const matchesTrial = 
      trialQuoteFilter === 'All' || 
      (trialQuoteFilter === 'Yes' && t.trial_quote_asked === true) ||
      (trialQuoteFilter === 'No' && t.trial_quote_asked === false);

    return matchesSearch && matchesType && matchesTrial;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Customer Touches</h2>
          <p className="text-xs text-gray-400 mt-1">Log calls, rate inquiries, quotations, and commercial follow-ups.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          id="btn-add-touch-page"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Touch
        </button>
      </header>

      {/* FILTERS PANEL */}
      <section className="bg-gray-900/20 border border-gray-800/80 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search company name, summary details..."
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Touch Type Filter */}
        <div>
          <select
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Touch Types</option>
            <option value="Meeting follow-up">Meeting follow-up</option>
            <option value="Pending quotation follow-up">Pending quotation follow-up</option>
            <option value="Company profile follow-up">Company profile follow-up</option>
            <option value="Trial quotation request">Trial quotation request</option>
            <option value="Shipment route discussion">Shipment route discussion</option>
            <option value="Backup rate support">Backup rate support</option>
            <option value="Customer value message">Customer value message</option>
          </select>
        </div>

        {/* Trial Quote Asked Filter */}
        <div>
          <select
            className="w-full bg-gray-950 border border-gray-800/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            value={trialQuoteFilter}
            onChange={e => setTrialQuoteFilter(e.target.value)}
          >
            <option value="All">All Quotations</option>
            <option value="Yes">Trial Quotation Asked</option>
            <option value="No">No Trial Quotation</option>
          </select>
        </div>
      </section>

      {/* CUSTOMER TOUCHES CARDS */}
      {loading ? (
        <div className="text-xs font-mono text-gray-500 text-center py-10">Loading communication logs...</div>
      ) : filteredTouches.length === 0 ? (
        <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">No touches matching your filter query have been registered.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 mt-2 cursor-pointer"
          >
            Log your first customer touch now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTouches.map((t) => (
            <div 
              key={t.id} 
              id={`touch-card-${t.id}`}
              className="bg-gray-900/30 border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all duration-200"
            >
              {/* Left Column: Icon + Core */}
              <div className="flex gap-4 flex-1">
                <div className={`p-2.5 rounded-xl border shrink-0 h-fit ${
                  t.trial_quote_asked 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 glow-accent' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  {t.trial_quote_asked ? <Quote className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>

                <div className="space-y-2 flex-1 min-w-0 text-xs">
                  <div>
                    <h4 className="font-semibold text-white tracking-tight text-sm">
                      {getProspectName(t.prospect_id)}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] font-mono bg-gray-950/60 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                        {t.touch_type}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {t.date}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed bg-gray-950/20 border border-gray-800/40 p-3 rounded-xl italic">
                    "{t.message_summary}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Response Status</span>
                      <span className="font-medium text-gray-300">{t.response_status || 'In Progress'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Next Agreed Action</span>
                      <span className="font-medium text-blue-400">{t.next_action || 'Pending schedule'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Date Info + Options */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 shrink-0 border-t sm:border-t-0 border-gray-800/40 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-gray-500 uppercase block">Follow-up Date</span>
                  <span className="text-xs font-semibold font-mono text-gray-300 block mt-0.5">{t.follow_up_date || 'No follow-up set'}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() => setEditingTouch(t)}
                    id={`btn-edit-touch-${t.id}`}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                    title="Edit Log"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t)}
                    id={`btn-delete-touch-${t.id}`}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-400 transition cursor-pointer"
                    title="Delete Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD TOUCH MODAL */}
      <AddTouchModal
        userId={userId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={loadData}
      />

      {/* EDIT TOUCH MODAL */}
      {editingTouch && (
        <EditTouchModalWrapper
          userId={userId}
          touch={editingTouch}
          prospects={prospects}
          onClose={() => setEditingTouch(null)}
          onSave={loadData}
        />
      )}
    </div>
  );
}

// EDIT TOUCH MODAL WRAPPER
function EditTouchModalWrapper({
  userId,
  touch,
  prospects,
  onClose,
  onSave
}: {
  userId: string;
  touch: CustomerTouch;
  prospects: Prospect[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...touch });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message_summary) {
      setError('Please fill in the message summary');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.updateCustomerTouch(userId, touch.id, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Edit Customer Touch Log</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Link to Prospect</label>
            <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.prospect_id || ''} onChange={e => setForm({...form, prospect_id: e.target.value || undefined})}>
              <option value="">-- No Linked Prospect --</option>
              {prospects.map(p => (
                <option key={p.id} value={p.id}>{p.company_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Touch Type *</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.touch_type} onChange={e => setForm({...form, touch_type: e.target.value as any})}>
                <option value="Meeting follow-up">Meeting follow-up</option>
                <option value="Pending quotation follow-up">Pending quotation follow-up</option>
                <option value="Company profile follow-up">Company profile follow-up</option>
                <option value="Trial quotation request">Trial quotation request</option>
                <option value="Shipment route discussion">Shipment route discussion</option>
                <option value="Backup rate support">Backup rate support</option>
                <option value="Customer value message">Customer value message</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Message Summary *</label>
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-20 resize-none" value={form.message_summary} onChange={e => setForm({...form, message_summary: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Response Status</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.response_status} onChange={e => setForm({...form, response_status: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Next Action</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.next_action} onChange={e => setForm({...form, next_action: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-gray-400 mb-1">Follow-up Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.follow_up_date} onChange={e => setForm({...form, follow_up_date: e.target.value})} />
            </div>
            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-800 rounded focus:ring-blue-500" checked={form.trial_quote_asked} onChange={e => setForm({...form, trial_quote_asked: e.target.checked})} />
                <span className="text-gray-200 font-semibold text-xs">Trial quotation asked?</span>
              </label>
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
