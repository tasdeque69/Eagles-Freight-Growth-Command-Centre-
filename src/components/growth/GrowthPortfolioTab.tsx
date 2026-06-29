import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GrowthPortfolio } from '../../types';
import { Loader2, Plus, Edit2, Trash2, Award } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function GrowthPortfolioTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<GrowthPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<GrowthPortfolio>>({});

  const fetchPortfolio = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('growth_portfolio')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      console.error("fetchPortfolio error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('growth_portfolio').update({
          evidence_title: editItem.evidence_title,
          evidence_type: editItem.evidence_type,
          date: editItem.date,
          summary: editItem.summary,
          business_value: editItem.business_value,
          skill_demonstrated: editItem.skill_demonstrated,
          visibility: editItem.visibility,
          notes: editItem.notes
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('growth_portfolio').insert({
          user_id: userId,
          evidence_title: editItem.evidence_title,
          evidence_type: editItem.evidence_type,
          date: editItem.date || new Date().toISOString().split('T')[0],
          summary: editItem.summary,
          business_value: editItem.business_value,
          skill_demonstrated: editItem.skill_demonstrated,
          visibility: editItem.visibility || 'Internal',
          notes: editItem.notes || ''
        });
        if (error) throw error;
      }
      setIsEditing(false);
      fetchPortfolio();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: GrowthPortfolio) => {
    const tableName = 'growth_portfolio';
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
      fetchPortfolio();
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
              onClick={() => { setEditItem({ date: new Date().toISOString().split('T')[0], visibility: 'Internal', evidence_type: 'Project' }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Evidence
            </button>
          </div>
          <div className="space-y-4">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No portfolio evidence found. Start documenting your wins.</p>
            ) : (
              data.map(item => (
                <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                        <Award className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{item.evidence_title}</h3>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{item.date} • {item.evidence_type} • {item.visibility}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDelete(item)} className="p-2 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4 mt-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase">Summary</div>
                      <div className="whitespace-pre-line">{item.summary}</div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase">Business Value Generated</div>
                      <div className="text-green-400 font-medium">{item.business_value}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-500 border-t border-gray-800/50 pt-3">
                    Skill Demonstrated: <span className="text-blue-400">{item.skill_demonstrated}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg max-w-3xl">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Evidence' : 'New Portfolio Evidence'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
              <input required type="text" value={editItem.evidence_title || ''} onChange={e => setEditItem({...editItem, evidence_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Evidence Type</label>
              <select required value={editItem.evidence_type || ''} onChange={e => setEditItem({...editItem, evidence_type: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Project">Project</option>
                <option value="Major Account Won">Major Account Won</option>
                <option value="Process Improvement">Process Improvement</option>
                <option value="Certification/Training">Certification/Training</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
              <input required type="date" value={editItem.date || ''} onChange={e => setEditItem({...editItem, date: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Summary</label>
              <textarea required rows={3} value={editItem.summary || ''} onChange={e => setEditItem({...editItem, summary: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Business Value (Quantify if possible)</label>
              <input required type="text" value={editItem.business_value || ''} onChange={e => setEditItem({...editItem, business_value: e.target.value})} placeholder="e.g. Secured $50k annual revenue, reduced processing time by 2hrs/week" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Skill Demonstrated</label>
              <input required type="text" value={editItem.skill_demonstrated || ''} onChange={e => setEditItem({...editItem, skill_demonstrated: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Visibility Level</label>
              <select required value={editItem.visibility || ''} onChange={e => setEditItem({...editItem, visibility: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Internal">Internal (Personal tracking)</option>
                <option value="Manager">Manager Level</option>
                <option value="Public">Public (LinkedIn/Resume)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Notes / Links</label>
              <input type="text" value={editItem.notes || ''} onChange={e => setEditItem({...editItem, notes: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
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
