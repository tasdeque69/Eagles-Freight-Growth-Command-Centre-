import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { dataService, getLocalDateString } from '../lib/dataService';
import { Prospect, CustomerTouch, ShipmentFile, RouteCard, JournalEntry, Agent, AgentTouch } from '../types';

interface ModalBaseProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// 1. ADD PROSPECT MODAL
export function AddProspectModal({ userId, isOpen, onClose, onSave }: ModalBaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company_name: '',
    location: '',
    product_type: '',
    export_market: '',
    commercial_contact_person: '',
    phone_or_email: '',
    possible_shipment_route: '',
    possible_pain_point: '',
    next_action: '',
    status: 'New' as Prospect['status'],
    follow_up_date: getLocalDateString(),
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.location || !form.commercial_contact_person) {
      setError('Please fill in required fields (Company, Location, Contact Person)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.addProspect(userId, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save prospect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Add New Freight Prospect</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Company Name *</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Location *</label>
              <input required type="text" placeholder="e.g. Shanghai, China" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Product Type</label>
              <input type="text" placeholder="e.g. Machinery" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.product_type} onChange={e => setForm({...form, product_type: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Export Market</label>
              <input type="text" placeholder="e.g. Europe" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.export_market} onChange={e => setForm({...form, export_market: e.target.value})} />
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
            <input type="text" placeholder="e.g. Shanghai to Hamburg" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.possible_shipment_route} onChange={e => setForm({...form, possible_shipment_route: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Possible Pain Point</label>
            <textarea placeholder="e.g. Space issues, slow customs" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.possible_pain_point} onChange={e => setForm({...form, possible_pain_point: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Next Action</label>
              <input type="text" placeholder="e.g. Send rate proposal" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.next_action} onChange={e => setForm({...form, next_action: e.target.value})} />
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
            <textarea className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Prospect
          </button>
        </form>
      </div>
    </div>
  );
}

// 2. ADD CUSTOMER TOUCH MODAL
export function AddTouchModal({ userId, isOpen, onClose, onSave }: ModalBaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [form, setForm] = useState({
    prospect_id: '',
    prospect_name_manual: '', // if not linked to standard prospect
    touch_type: 'Meeting follow-up' as CustomerTouch['touch_type'],
    date: getLocalDateString(),
    message_summary: '',
    response_status: '',
    next_action: '',
    follow_up_date: getLocalDateString(),
    trial_quote_asked: false
  });

  useEffect(() => {
    if (isOpen) {
      dataService.getProspects(userId)
        .then(setProspects)
        .catch(console.error);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message_summary) {
      setError('Please fill in the message summary');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Find the name of prospect to verify manual linkage or standard linkage
      const selectedProspect = prospects.find(p => p.id === form.prospect_id);
      const isProspectSelected = !!form.prospect_id;
      
      await dataService.addCustomerTouch(userId, {
        prospect_id: isProspectSelected ? form.prospect_id : undefined,
        touch_type: form.touch_type,
        date: form.date,
        message_summary: form.message_summary,
        response_status: form.response_status || 'In Progress',
        next_action: form.next_action,
        follow_up_date: form.follow_up_date,
        trial_quote_asked: form.trial_quote_asked
      });

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save touch record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Log Customer Touch</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Link to Prospect (Optional)</label>
            <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.prospect_id} onChange={e => setForm({...form, prospect_id: e.target.value})}>
              <option value="">-- Or enter customer name in summary --</option>
              {prospects.map(p => (
                <option key={p.id} value={p.id}>{p.company_name} ({p.commercial_contact_person})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Touch Type *</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.touch_type} onChange={e => setForm({...form, touch_type: e.target.value as CustomerTouch['touch_type']})}>
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
            <textarea placeholder="Discussed space, pricing, shared company profile... " className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-20 resize-none" value={form.message_summary} onChange={e => setForm({...form, message_summary: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Response Status</label>
              <input type="text" placeholder="e.g. Sent quotation, pending reply" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.response_status} onChange={e => setForm({...form, response_status: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Next Action</label>
              <input type="text" placeholder="e.g. Send rate sheet" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.next_action} onChange={e => setForm({...form, next_action: e.target.value})} />
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
            Save Touch Record
          </button>
        </form>
      </div>
    </div>
  );
}

// 3. STUDY SHIPMENT FILE MODAL
export function AddShipmentFileModal({ userId, isOpen, onClose, onSave }: ModalBaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: getLocalDateString(),
    shipment_route: '',
    mode: 'Ocean' as ShipmentFile['mode'],
    customer_requirement: '',
    booking_status: '',
    document_status: '',
    cut_off_date: getLocalDateString(),
    cargo_handover_status: '',
    problem_or_delay: '',
    solution_taken: '',
    key_learning: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shipment_route || !form.customer_requirement || !form.key_learning) {
      setError('Please fill in route, requirement, and key learning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.addShipmentFile(userId, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save shipment file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Study Shipment File</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Study Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mode *</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as ShipmentFile['mode']})}>
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
            <input required type="text" placeholder="e.g. Shenzhen to Hamburg" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.shipment_route} onChange={e => setForm({...form, shipment_route: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Customer Requirement *</label>
            <textarea placeholder="What was requested (cargo size, transit constraints, custom clearance)..." className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.customer_requirement} onChange={e => setForm({...form, customer_requirement: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Booking Status</label>
              <input type="text" placeholder="e.g. Space secured with carrier" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.booking_status} onChange={e => setForm({...form, booking_status: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Document Status</label>
              <input type="text" placeholder="e.g. Master BL approved" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.document_status} onChange={e => setForm({...form, document_status: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Port Cut-off Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.cut_off_date} onChange={e => setForm({...form, cut_off_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Cargo Handover Status</label>
              <input type="text" placeholder="e.g. Handed over at depot" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.cargo_handover_status} onChange={e => setForm({...form, cargo_handover_status: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Problem or Delay</label>
              <input type="text" placeholder="e.g. Custom clearance delay" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.problem_or_delay} onChange={e => setForm({...form, problem_or_delay: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Solution Taken</label>
              <input type="text" placeholder="e.g. Submitted amended document" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.solution_taken} onChange={e => setForm({...form, solution_taken: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Key Learning / Golden Rule *</label>
            <textarea placeholder="What is the key commercial or operational takeaway..." className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.key_learning} onChange={e => setForm({...form, key_learning: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Shipment File
          </button>
        </form>
      </div>
    </div>
  );
}

// 4. CREATE ROUTE CARD MODAL
export function AddRouteCardModal({ userId, isOpen, onClose, onSave }: ModalBaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    mode: 'Air' as RouteCard['mode'],
    carrier_or_airline: '',
    transit_time: '',
    transshipment_point: '',
    common_cargo_type: '',
    common_issue: '',
    agent_role: '',
    customer_objection: '',
    possible_solution: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.carrier_or_airline) {
      setError('Please fill in origin, destination, and carrier');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.addRouteCard(userId, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save route card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Create Route Card</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Origin *</label>
              <input required type="text" placeholder="e.g. PVG" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Destination *</label>
              <input required type="text" placeholder="e.g. FRA" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mode</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as RouteCard['mode']})}>
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
              <input required type="text" placeholder="e.g. Lufthansa" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.carrier_or_airline} onChange={e => setForm({...form, carrier_or_airline: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Transit Time</label>
              <input type="text" placeholder="e.g. 2 days" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.transit_time} onChange={e => setForm({...form, transit_time: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Transshipment</label>
              <input type="text" placeholder="e.g. Direct / transit" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.transshipment_point} onChange={e => setForm({...form, transshipment_point: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Common Cargo Type</label>
              <input type="text" placeholder="e.g. Electronics, apparel" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.common_cargo_type} onChange={e => setForm({...form, common_cargo_type: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Overseas Agent Role</label>
              <input type="text" placeholder="e.g. DDP customs clearance" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.agent_role} onChange={e => setForm({...form, agent_role: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Common Issue / Bottleneck</label>
            <input type="text" placeholder="e.g. Port delays, customs paperwork bottleneck" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.common_issue} onChange={e => setForm({...form, common_issue: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Customer Objection</label>
              <textarea placeholder="e.g. Rates are too expensive" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.customer_objection} onChange={e => setForm({...form, customer_objection: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Possible Pitch / Solution</label>
              <textarea placeholder="e.g. Emphasize transit safety, direct routes" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.possible_solution} onChange={e => setForm({...form, possible_solution: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Route Card
          </button>
        </form>
      </div>
    </div>
  );
}

// 5. WRITE JOURNAL MODAL
export function AddJournalModal({ userId, isOpen, onClose, onSave }: ModalBaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: getLocalDateString(),
    today_i_learned: '',
    one_document_i_saw: '',
    one_shipment_route_i_studied: '',
    one_customer_followed_up: '',
    one_agent_contacted: '',
    one_mistake_found: '',
    tomorrow_target: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.today_i_learned || !form.tomorrow_target) {
      setError('Please fill in Today I Learned and Tomorrow\'s Target');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.addJournalEntry(userId, form);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Write Freight Journal Entry</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Journal Date</label>
            <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Today I Learned *</label>
            <textarea placeholder="Write down key industry rules, container sizing, airport handling learned..." className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" value={form.today_i_learned} onChange={e => setForm({...form, today_i_learned: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">One Document I Saw</label>
              <input type="text" placeholder="e.g. Dangerous Goods Declarations, Telex" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_document_i_saw} onChange={e => setForm({...form, one_document_i_saw: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">One Shipment Route Studied</label>
              <input type="text" placeholder="e.g. PVG to FRA - Air direct" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_shipment_route_i_studied} onChange={e => setForm({...form, one_shipment_route_i_studied: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">One Customer/Prospect Followed Up</label>
              <input type="text" placeholder="e.g. Apex Manufacturing Solutions" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_customer_followed_up} onChange={e => setForm({...form, one_customer_followed_up: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">One Agent Contacted</label>
              <input type="text" placeholder="e.g. Eagles Europe Agent" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_agent_contacted} onChange={e => setForm({...form, one_agent_contacted: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">One Mistake or Gap Found</label>
            <input type="text" placeholder="e.g. Miscalculated dim factor for volume weight" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.one_mistake_found} onChange={e => setForm({...form, one_mistake_found: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Tomorrow's Target *</label>
            <input required type="text" placeholder="e.g. Follow up with 3 new European export queries" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.tomorrow_target} onChange={e => setForm({...form, tomorrow_target: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Journal Entry
          </button>
        </form>
      </div>
    </div>
  );
}

// 6. ADD AGENT TOUCH MODAL
export function AddAgentTouchModal({ userId, isOpen, onClose, onSave }: ModalBaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({
    agent_id: '',
    agent_name: '',
    agent_location: 'Europe' as 'Europe' | 'China',
    date: getLocalDateString(),
    summary: ''
  });

  useEffect(() => {
    if (isOpen) {
      dataService.getAgents(userId)
        .then(setAgents)
        .catch(console.error);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = form.agent_id 
      ? (agents.find(a => a.id === form.agent_id)?.name || '')
      : form.agent_name;
      
    if (!finalName || !form.summary) {
      setError('Please provide the Agent name and summary');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dataService.addAgentTouch(userId, {
        agent_id: form.agent_id || undefined,
        agent_name: finalName,
        agent_location: form.agent_location,
        date: form.date,
        summary: form.summary
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save agent touch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1524] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-display font-semibold text-white mb-4">Contact Europe/China Agent</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Select Overseas Agent</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.agent_id} onChange={e => {
                const selected = agents.find(a => a.id === e.target.value);
                setForm({
                  ...form, 
                  agent_id: e.target.value,
                  agent_location: selected && (selected.location === 'Europe' || selected.location === 'China') 
                    ? selected.location 
                    : form.agent_location
                });
              }}>
                <option value="">-- Or type agent name manually below --</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Agent Location *</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.agent_location} onChange={e => setForm({...form, agent_location: e.target.value as any})}>
                <option value="Europe">Europe</option>
                <option value="China">China</option>
              </select>
            </div>
          </div>

          {!form.agent_id && (
            <div>
              <label className="block text-gray-400 mb-1">Agent Name *</label>
              <input required type="text" placeholder="e.g. Eagles Hamburg Agent" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.agent_name} onChange={e => setForm({...form, agent_name: e.target.value})} />
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-1">Contact Date</label>
            <input type="date" className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Discussion Summary *</label>
            <textarea placeholder="Inquired on DDP shipping rates, local handling capacity, custom rules clearance speed..." className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-24 resize-none" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Agent Touch
          </button>
        </form>
      </div>
    </div>
  );
}
