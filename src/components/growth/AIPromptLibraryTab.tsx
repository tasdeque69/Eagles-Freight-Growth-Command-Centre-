import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AIPromptLibrary } from '../../types';
import { Loader2, Plus, Edit2, Trash2, ShieldAlert, Copy } from 'lucide-react';
import { dataService } from '../../lib/dataService';

export default function AIPromptLibraryTab({ userId, onUpdate }: { userId: string, onUpdate: () => void }) {
  const [data, setData] = useState<AIPromptLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<AIPromptLibrary>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPrompts = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('ai_prompt_library')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true });
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      if (editItem.id) {
        const { error } = await supabase.from('ai_prompt_library').update({
          prompt_title: editItem.prompt_title,
          category: editItem.category,
          tool_recommended: editItem.tool_recommended,
          prompt_text: editItem.prompt_text,
          input_needed: editItem.input_needed,
          output_expected: editItem.output_expected,
          privacy_level: editItem.privacy_level,
          last_used: editItem.last_used,
          effectiveness_rating: editItem.effectiveness_rating,
          notes: editItem.notes
        }).eq('id', editItem.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ai_prompt_library').insert({
          user_id: userId,
          prompt_title: editItem.prompt_title,
          category: editItem.category,
          tool_recommended: editItem.tool_recommended,
          prompt_text: editItem.prompt_text,
          input_needed: editItem.input_needed,
          output_expected: editItem.output_expected,
          privacy_level: editItem.privacy_level || 'Safe (Generic)',
          last_used: editItem.last_used || new Date().toISOString().split('T')[0],
          effectiveness_rating: editItem.effectiveness_rating || 3,
          notes: editItem.notes || ''
        });
        if (error) throw error;
      }
      setIsEditing(false);
      await fetchPrompts();
      onUpdate();
    } catch (err: any) {
      console.error("handleSave error", err);
      setError(err.message);
    }
  };

  const handleDelete = async (item: AIPromptLibrary) => {
    const tableName = 'ai_prompt_library';
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
      await fetchPrompts();
      onUpdate();
    } catch (err: any) {
      console.error("handleDelete error", err);
      setError(err.message || "Failed to delete record");
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-6 h-6" /></div>;

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{error}</div>}
      
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center mb-6 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-yellow-500 mb-1">AI Privacy Warning</h4>
                <p className="text-xs text-yellow-200/70 leading-relaxed">
                  Do not paste real customer data, rates, shipment details, or confidential company data into free AI tools. Always use sanitized/anonymized placeholders.
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setEditItem({ privacy_level: 'Safe (Generic)' }); setIsEditing(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Prompt
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.length === 0 ? (
              <p className="text-gray-500 text-center py-8 col-span-full">No AI prompts found.</p>
            ) : (
              data.map(item => (
                <div key={item.id} className="bg-gray-800/40 border border-gray-700 rounded-lg flex flex-col">
                  <div className="p-4 border-b border-gray-700/50 flex justify-between items-start bg-gray-900/30 rounded-t-lg">
                    <div>
                      <span className="text-[10px] font-semibold text-purple-400 bg-purple-400/10 px-2 py-1 rounded inline-block mb-1">{item.category}</span>
                      <h3 className="text-sm font-bold text-white">{item.prompt_title}</h3>
                      <div className="text-[10px] text-gray-500 mt-1">Tool: {item.tool_recommended} • Privacy: {item.privacy_level}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => copyToClipboard(item.prompt_text, item.id)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition" title="Copy prompt">
                        {copiedId === item.id ? <span className="text-xs text-green-400 font-medium">Copied</span> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDelete(item)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="bg-black/30 p-3 rounded-lg border border-gray-800 font-mono text-xs text-gray-300 mb-4 whitespace-pre-wrap flex-grow">
                      {item.prompt_text}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-400">
                      <div><span className="font-semibold text-gray-500 block uppercase mb-0.5">Input Needed</span>{item.input_needed}</div>
                      <div><span className="font-semibold text-gray-500 block uppercase mb-0.5">Expected Output</span>{item.output_expected}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="bg-gray-800/40 border border-gray-700 p-6 rounded-lg max-w-3xl">
          <h3 className="text-lg font-bold text-white mb-4">{editItem.id ? 'Edit Prompt' : 'New AI Prompt'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
              <input required type="text" value={editItem.prompt_title || ''} onChange={e => setEditItem({...editItem, prompt_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category (e.g. Email Drafting, Data Analysis)</label>
              <input required type="text" value={editItem.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Recommended Tool (e.g. ChatGPT, Gemini)</label>
              <input required type="text" value={editItem.tool_recommended || ''} onChange={e => setEditItem({...editItem, tool_recommended: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Prompt Text</label>
              <textarea required rows={5} value={editItem.prompt_text || ''} onChange={e => setEditItem({...editItem, prompt_text: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white font-mono focus:border-blue-500 outline-none placeholder-gray-600" placeholder="Act as a senior freight forwarder..."></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Variables Needed</label>
              <input required type="text" value={editItem.input_needed || ''} onChange={e => setEditItem({...editItem, input_needed: e.target.value})} placeholder="e.g. [Origin], [Destination], [Problem]" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Expected Output</label>
              <input required type="text" value={editItem.output_expected || ''} onChange={e => setEditItem({...editItem, output_expected: e.target.value})} placeholder="e.g. 3 bullet points on how to handle delay" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Privacy Warning Level</label>
              <select required value={editItem.privacy_level || ''} onChange={e => setEditItem({...editItem, privacy_level: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Safe (Generic)">Safe (Generic)</option>
                <option value="Caution (Sanitize Data)">Caution (Sanitize Data)</option>
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
