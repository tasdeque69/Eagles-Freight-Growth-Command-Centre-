import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { QuarterlySprint } from '../../types';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function QuarterlySprintsTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<QuarterlySprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<QuarterlySprint>>({});

  const fetchSprints = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('quarterly_sprints')
        .select('*')
        .eq('user_id', userId)
        .order('quarter', { ascending: false });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      console.error("fetchSprints error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('quarterly_sprints').update({
          year: editItem.year,
          quarter: editItem.quarter,
          theme: editItem.theme,
          priority_outcome_1: editItem.priority_outcome_1,
          priority_outcome_2: editItem.priority_outcome_2,
          priority_outcome_3: editItem.priority_outcome_3,
          month_1_focus: editItem.month_1_focus,
          month_2_focus: editItem.month_2_focus,
          month_3_focus: editItem.month_3_focus,
          review_notes: editItem.review_notes,
          status: editItem.status,
          completion_score: editItem.completion_score
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('quarterly_sprints').insert({
          user_id: userId,
          year: editItem.year || new Date().getFullYear().toString(),
          quarter: editItem.quarter || 'Q1',
          theme: editItem.theme || '',
          priority_outcome_1: editItem.priority_outcome_1 || '',
          priority_outcome_2: editItem.priority_outcome_2 || '',
          priority_outcome_3: editItem.priority_outcome_3 || '',
          month_1_focus: editItem.month_1_focus || '',
          month_2_focus: editItem.month_2_focus || '',
          month_3_focus: editItem.month_3_focus || '',
          review_notes: editItem.review_notes || '',
          status: editItem.status || 'Planning',
          completion_score: editItem.completion_score || 0
        });
        if (error) throw error;
      }
      setIsEditing(false);
      await fetchSprints();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: QuarterlySprint) => {
    const tableName = 'quarterly_sprints';
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
      await fetchSprints();
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
              onClick={() => { setEditItem({ status: 'Planning', quarter: 'Q1 2026', completion_score: 0 }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Sprint
            </button>
          </div>
          <div className="space-y-4">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No quarterly sprints found.</p>
            ) : (
              data.map(item => (
                <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded inline-block">{item.quarter}</span>
                      <h3 className="text-lg font-bold text-white mt-2">{item.theme}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-xs text-gray-500 mb-2 font-semibold uppercase">Priority Outcomes</div>
                      <ul className="list-decimal pl-4 space-y-1">
                        {item.priority_outcome_1 && <li>{item.priority_outcome_1}</li>}
                        {item.priority_outcome_2 && <li>{item.priority_outcome_2}</li>}
                        {item.priority_outcome_3 && <li>{item.priority_outcome_3}</li>}
                      </ul>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <div className="text-xs text-gray-500 mb-2 font-semibold uppercase">Monthly Focus</div>
                      <ul className="space-y-1">
                        {item.month_1_focus && <li><span className="text-gray-500 mr-2">M1:</span>{item.month_1_focus}</li>}
                        {item.month_2_focus && <li><span className="text-gray-500 mr-2">M2:</span>{item.month_2_focus}</li>}
                        {item.month_3_focus && <li><span className="text-gray-500 mr-2">M3:</span>{item.month_3_focus}</li>}
                      </ul>
                    </div>
                    {item.review_notes && (
                      <div className="md:col-span-2 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <div className="text-xs text-gray-500 mb-1 font-semibold uppercase">Review Notes</div>
                        <div className="whitespace-pre-line">{item.review_notes}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-800/50 pt-3">
                    <div className="text-xs font-medium text-gray-500">Status: <span className="text-gray-300">{item.status}</span></div>
                    <div className="text-xs font-medium text-gray-500">Completion Score: <span className="text-blue-400">{item.completion_score}%</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Sprint' : 'New Sprint'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Year</label>
              <input required type="text" value={editItem.year || ''} onChange={e => setEditItem({...editItem, year: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Quarter (e.g. Q1)</label>
              <input required type="text" value={editItem.quarter || ''} onChange={e => setEditItem({...editItem, quarter: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Sprint Theme</label>
              <input required type="text" value={editItem.theme || ''} onChange={e => setEditItem({...editItem, theme: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Priority Outcome 1</label>
                <input type="text" value={editItem.priority_outcome_1 || ''} onChange={e => setEditItem({...editItem, priority_outcome_1: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Priority Outcome 2</label>
                <input type="text" value={editItem.priority_outcome_2 || ''} onChange={e => setEditItem({...editItem, priority_outcome_2: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Priority Outcome 3</label>
                <input type="text" value={editItem.priority_outcome_3 || ''} onChange={e => setEditItem({...editItem, priority_outcome_3: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Month 1 Focus</label>
                <input type="text" value={editItem.month_1_focus || ''} onChange={e => setEditItem({...editItem, month_1_focus: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Month 2 Focus</label>
                <input type="text" value={editItem.month_2_focus || ''} onChange={e => setEditItem({...editItem, month_2_focus: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Month 3 Focus</label>
                <input type="text" value={editItem.month_3_focus || ''} onChange={e => setEditItem({...editItem, month_3_focus: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Review Notes</label>
              <textarea rows={2} value={editItem.review_notes || ''} onChange={e => setEditItem({...editItem, review_notes: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select required value={editItem.status || ''} onChange={e => setEditItem({...editItem, status: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Completion Score (%)</label>
              <input required type="number" min="0" max="100" value={editItem.completion_score || 0} onChange={e => setEditItem({...editItem, completion_score: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
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
