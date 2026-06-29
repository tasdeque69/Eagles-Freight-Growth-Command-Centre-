import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AnnualGoal } from '../../types';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function AnnualGoalsTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<AnnualGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<AnnualGoal>>({});

  const fetchGoals = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('annual_goals')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      console.error("fetchGoals error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('annual_goals').update({
          year: editItem.year,
          category: editItem.category,
          goal_title: editItem.goal_title,
          goal_description: editItem.goal_description,
          target_value: editItem.target_value,
          current_value: editItem.current_value,
          unit: editItem.unit,
          status: editItem.status,
          evidence_notes: editItem.evidence_notes
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('annual_goals').insert({
          user_id: userId,
          year: editItem.year || new Date().getFullYear().toString(),
          category: editItem.category || 'Revenue',
          goal_title: editItem.goal_title || '',
          goal_description: editItem.goal_description || '',
          target_value: editItem.target_value || 0,
          current_value: editItem.current_value || 0,
          unit: editItem.unit || '',
          status: editItem.status || 'On Track',
          evidence_notes: editItem.evidence_notes || ''
        });
        if (error) throw error;
      }
      setIsEditing(false);
      await fetchGoals();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: AnnualGoal) => {
    const tableName = 'annual_goals';
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
      await fetchGoals();
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
              onClick={() => { setEditItem({ status: 'On Track', category: 'Revenue', year: new Date().getFullYear().toString() }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Annual Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center py-8 col-span-full">No annual goals found.</p>
            ) : (
              data.map(item => (
                <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-5 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="text-xs font-semibold text-blue-400 mb-1">{item.year} - {item.category}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.goal_title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{item.goal_description}</p>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm text-gray-400">Progress</div>
                    <div className="text-sm font-medium text-white">{item.current_value} / {item.target_value} {item.unit}</div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((item.current_value || 0) / (item.target_value || 1)) * 100)}%` }}></div>
                  </div>
                  <div className="text-xs font-medium text-gray-500">Status: <span className="text-gray-300">{item.status}</span></div>
                  {item.evidence_notes && <div className="mt-2 text-xs text-gray-500">Notes: {item.evidence_notes}</div>}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg max-w-2xl">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Annual Goal' : 'New Annual Goal'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Goal Title</label>
              <input required type="text" value={editItem.goal_title || ''} onChange={e => setEditItem({...editItem, goal_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <textarea required rows={2} value={editItem.goal_description || ''} onChange={e => setEditItem({...editItem, goal_description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
              <input required type="text" value={editItem.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. Revenue, Skill" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Year</label>
              <input required type="text" value={editItem.year || ''} onChange={e => setEditItem({...editItem, year: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Unit (e.g. TEUs, USD, clients)</label>
              <input required type="text" value={editItem.unit || ''} onChange={e => setEditItem({...editItem, unit: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select required value={editItem.status || ''} onChange={e => setEditItem({...editItem, status: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Off Track">Off Track</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Target Value</label>
              <input required type="number" step="0.01" value={editItem.target_value || ''} onChange={e => setEditItem({...editItem, target_value: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Current Value</label>
              <input required type="number" step="0.01" value={editItem.current_value || 0} onChange={e => setEditItem({...editItem, current_value: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Evidence Notes</label>
              <textarea rows={2} value={editItem.evidence_notes || ''} onChange={e => setEditItem({...editItem, evidence_notes: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
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
