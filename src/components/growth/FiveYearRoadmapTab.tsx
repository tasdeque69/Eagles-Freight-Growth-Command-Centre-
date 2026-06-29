import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiveYearRoadmap } from '../../types';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function FiveYearRoadmapTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<FiveYearRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<FiveYearRoadmap>>({});
  
  const phases = [
    'Year 1: Freight Foundation Builder',
    'Year 2: Route and Segment Specialist',
    'Year 3: Network and Conversion Builder',
    'Year 4: Data-Backed Freight Advisor',
    'Year 5: Strategic Freight Growth Lead'
  ];

  const fetchRoadmap = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('five_year_roadmap')
        .select('*')
        .eq('user_id', userId)
        .order('roadmap_year', { ascending: true });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      console.error("fetchRoadmap error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('five_year_roadmap').update({
          roadmap_year: editItem.roadmap_year,
          phase_name: editItem.phase_name,
          year_start_date: editItem.year_start_date,
          year_end_date: editItem.year_end_date,
          annual_focus: editItem.annual_focus,
          annual_success_definition: editItem.annual_success_definition,
          status: editItem.status
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('five_year_roadmap').insert({
          user_id: userId,
          roadmap_year: editItem.roadmap_year || 'Year 1',
          phase_name: editItem.phase_name || phases[0],
          year_start_date: editItem.year_start_date || new Date().toISOString().split('T')[0],
          year_end_date: editItem.year_end_date || new Date().toISOString().split('T')[0],
          annual_focus: editItem.annual_focus || '',
          annual_success_definition: editItem.annual_success_definition || '',
          status: editItem.status || 'Not Started'
        });
        if (error) throw error;
      }
      setIsEditing(false);
      fetchRoadmap();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: FiveYearRoadmap) => {
    const tableName = 'five_year_roadmap';
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
      await fetchRoadmap();
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
              onClick={() => { setEditItem({ status: 'Not Started', phase_name: phases[0], roadmap_year: 'Year 1' }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Phase Goal
            </button>
          </div>
          <div className="space-y-4">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No roadmap records found. Start building your 5-year plan.</p>
            ) : (
              data.map(item => (
                <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded mb-2 inline-block">{item.roadmap_year}: {item.phase_name}</span>
                    <h3 className="text-lg font-bold text-white mb-1">{item.annual_focus}</h3>
                    <p className="text-sm text-gray-400">{item.annual_success_definition}</p>
                    <div className="mt-2 text-xs font-medium text-gray-500">Status: <span className="text-gray-300">{item.status}</span></div>
                    <div className="mt-1 text-xs text-gray-500">Dates: {item.year_start_date} - {item.year_end_date}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleDelete(item)} className="p-2 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Roadmap Goal' : 'New Roadmap Goal'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Roadmap Year (e.g. Year 1)</label>
              <input required type="text" value={editItem.roadmap_year || ''} onChange={e => setEditItem({...editItem, roadmap_year: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phase Name</label>
              <select required value={editItem.phase_name || ''} onChange={e => setEditItem({...editItem, phase_name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="">Select a Phase</option>
                {phases.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Start Date</label>
              <input required type="date" value={editItem.year_start_date || ''} onChange={e => setEditItem({...editItem, year_start_date: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
              <input required type="date" value={editItem.year_end_date || ''} onChange={e => setEditItem({...editItem, year_end_date: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Annual Focus</label>
              <input required type="text" value={editItem.annual_focus || ''} onChange={e => setEditItem({...editItem, annual_focus: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Success Definition</label>
              <textarea required rows={3} value={editItem.annual_success_definition || ''} onChange={e => setEditItem({...editItem, annual_success_definition: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select required value={editItem.status || ''} onChange={e => setEditItem({...editItem, status: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
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
