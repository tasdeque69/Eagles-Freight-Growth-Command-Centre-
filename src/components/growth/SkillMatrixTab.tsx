import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SkillMatrix } from '../../types';
import { Loader2, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function SkillMatrixTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<SkillMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<SkillMatrix>>({});

  const fetchSkills = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('skill_matrix')
        .select('*')
        .eq('user_id', userId)
        .order('skill_category', { ascending: true });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      console.error("fetchSkills error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('skill_matrix').update({
          skill_category: editItem.skill_category,
          skill_name: editItem.skill_name,
          maturity_level: editItem.maturity_level,
          evidence_link: editItem.evidence_link,
          improvement_note: editItem.improvement_note,
          next_action: editItem.next_action,
          last_reviewed: editItem.last_reviewed
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('skill_matrix').insert({
          user_id: userId,
          skill_category: editItem.skill_category || 'General',
          skill_name: editItem.skill_name || '',
          maturity_level: editItem.maturity_level || 1,
          evidence_link: editItem.evidence_link || '',
          improvement_note: editItem.improvement_note || '',
          next_action: editItem.next_action || '',
          last_reviewed: editItem.last_reviewed || new Date().toISOString().split('T')[0]
        });
        if (error) throw error;
      }
      setIsEditing(false);
      fetchSkills();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: SkillMatrix) => {
    const tableName = 'skill_matrix';
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
      fetchSkills();
      onUpdate();
    } catch (err: any) {
      console.error("handleDelete error", err);
      setError(err.message || "Failed to delete record");
      setLoading(false);
    }
  };

  const renderStars = (level: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`w-4 h-4 ${star <= level ? 'fill-blue-500 text-blue-500' : 'text-gray-700'}`} />
        ))}
      </div>
    );
  };

  // Group by category
  const groupedData: Record<string, SkillMatrix[]> = data.reduce((acc: Record<string, SkillMatrix[]>, curr) => {
    const cat = curr.skill_category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-6 h-6" /></div>;

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{error}</div>}
      
      {!isEditing ? (
        <>
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => { setEditItem({ maturity_level: 1, last_reviewed: new Date().toISOString().split('T')[0] }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
          <div className="space-y-6">
            {Object.keys(groupedData).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No skills tracked yet.</p>
            ) : (
              Object.entries(groupedData).map(([category, skills]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map(item => (
                      <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 relative group">
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="text-gray-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 pr-10">{item.skill_name}</h3>
                        <div className="mb-3">
                          {renderStars(item.maturity_level)}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          <span className="font-semibold text-gray-500">Next Action:</span> {item.next_action}
                        </div>
                        <div className="text-[10px] text-gray-600">Last reviewed: {item.last_reviewed}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg max-w-2xl">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Skill' : 'New Skill'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category (e.g. Sales, Operations, Tech)</label>
              <input required type="text" value={editItem.skill_category || ''} onChange={e => setEditItem({...editItem, skill_category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Skill Name</label>
              <input required type="text" value={editItem.skill_name || ''} onChange={e => setEditItem({...editItem, skill_name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Maturity Level (1-5)</label>
              <select required value={editItem.maturity_level || 1} onChange={e => setEditItem({...editItem, maturity_level: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {['Novice', 'Advanced Beginner', 'Competent', 'Proficient', 'Expert'][n-1]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Last Reviewed Date</label>
              <input required type="date" value={editItem.last_reviewed || ''} onChange={e => setEditItem({...editItem, last_reviewed: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Evidence Link (URL)</label>
              <input type="text" value={editItem.evidence_link || ''} onChange={e => setEditItem({...editItem, evidence_link: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="https://" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Improvement Note</label>
              <textarea rows={2} value={editItem.improvement_note || ''} onChange={e => setEditItem({...editItem, improvement_note: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"></textarea>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Next Action to Level Up</label>
              <input required type="text" value={editItem.next_action || ''} onChange={e => setEditItem({...editItem, next_action: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
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
