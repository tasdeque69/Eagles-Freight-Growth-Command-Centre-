import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MarketIntelligence } from '../../types';
import { Loader2, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function MarketIntelligenceTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<MarketIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<MarketIntelligence>>({});

  const fetchIntel = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('market_intelligence')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      console.error("fetchIntel error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('market_intelligence').update({
          date: editItem.date,
          category: editItem.category,
          headline: editItem.headline,
          source_name: editItem.source_name,
          source_link: editItem.source_link,
          summary: editItem.summary,
          why_it_matters: editItem.why_it_matters,
          action_for_bd: editItem.action_for_bd,
          related_route: editItem.related_route,
          related_customer_segment: editItem.related_customer_segment,
          confidence_level: editItem.confidence_level,
          important: editItem.important
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('market_intelligence').insert({
          user_id: userId,
          date: editItem.date || new Date().toISOString().split('T')[0],
          category: editItem.category,
          headline: editItem.headline,
          source_name: editItem.source_name,
          source_link: editItem.source_link || '',
          summary: editItem.summary,
          why_it_matters: editItem.why_it_matters,
          action_for_bd: editItem.action_for_bd,
          related_route: editItem.related_route,
          related_customer_segment: editItem.related_customer_segment,
          confidence_level: editItem.confidence_level,
          important: editItem.important || false
        });
        if (error) throw error;
      }
      setIsEditing(false);
      fetchIntel();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: MarketIntelligence) => {
    const tableName = 'market_intelligence';
    console.log("Delete clicked", { tableName, recordId: item.id, row: item });
    if (!item.id) {
      alert("Error: record ID is missing.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      setLoading(true);
      await dataService.deleteRecord(tableName, item.id);
      alert('Record deleted successfully.');
      fetchIntel();
      onUpdate();
    } catch (err: any) {
      console.error("handleDelete error", err);
      setError(err.message || "Failed to delete record");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-6 h-6" /></div>;

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{error}</div>}
      
      {!isEditing ? (
        <>
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => { setEditItem({ confidence_level: 'High', important: false, date: new Date().toISOString().split('T')[0] }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Market Intel
            </button>
          </div>
          <div className="space-y-4">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No market intelligence records found.</p>
            ) : (
              data.map(item => (
                <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {item.important && <AlertCircle className="w-5 h-5 text-red-500" />}
                      <span className="text-xs font-semibold text-teal-400 bg-teal-400/10 px-2 py-1 rounded inline-block">{item.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.headline}</h3>
                  <div className="text-xs text-gray-500 mb-4">{item.date} • Source: {item.source_name} {item.source_link && <a href={item.source_link} target="_blank" className="text-blue-400 hover:underline">Link</a>} • Confidence: {item.confidence_level}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider">Summary</div>
                      <div className="whitespace-pre-line">{item.summary}</div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider">Why It Matters & Action</div>
                      <div className="mb-2"><span className="font-semibold text-gray-400">Why:</span> {item.why_it_matters}</div>
                      <div><span className="font-semibold text-blue-400">Action:</span> {item.action_for_bd}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-t border-gray-800/50 pt-3">
                    <div>Route: <span className="text-gray-300">{item.related_route || 'N/A'}</span></div>
                    <div>Segment: <span className="text-gray-300">{item.related_customer_segment || 'N/A'}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Market Intel' : 'New Market Intel'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
              <input required type="text" value={editItem.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})} placeholder="e.g. Rate Trend, Port Congestion" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Headline</label>
              <input required type="text" value={editItem.headline || ''} onChange={e => setEditItem({...editItem, headline: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
              <input required type="date" value={editItem.date || ''} onChange={e => setEditItem({...editItem, date: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Source Name</label>
              <input required type="text" value={editItem.source_name || ''} onChange={e => setEditItem({...editItem, source_name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Source Link (Optional)</label>
              <input type="text" value={editItem.source_link || ''} onChange={e => setEditItem({...editItem, source_link: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="https://" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Confidence Level</label>
              <select required value={editItem.confidence_level || ''} onChange={e => setEditItem({...editItem, confidence_level: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Summary</label>
              <textarea required rows={2} value={editItem.summary || ''} onChange={e => setEditItem({...editItem, summary: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Why It Matters</label>
              <textarea required rows={2} value={editItem.why_it_matters || ''} onChange={e => setEditItem({...editItem, why_it_matters: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Action for BD</label>
              <textarea required rows={2} value={editItem.action_for_bd || ''} onChange={e => setEditItem({...editItem, action_for_bd: e.target.value})} placeholder="How to use this in sales pitches..." className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Related Route</label>
              <input type="text" value={editItem.related_route || ''} onChange={e => setEditItem({...editItem, related_route: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Related Customer Segment</label>
              <input type="text" value={editItem.related_customer_segment || ''} onChange={e => setEditItem({...editItem, related_customer_segment: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="important" checked={editItem.important || false} onChange={e => setEditItem({...editItem, important: e.target.checked})} className="rounded bg-gray-900 border-gray-700" />
              <label htmlFor="important" className="text-sm font-medium text-red-400 cursor-pointer">Flag as Important / Critical</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
