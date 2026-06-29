import { useState } from 'react';
import { isSupabaseConfigured, getSupabaseSchemaSQL } from '../lib/supabase';
import { Terminal, Database, Check, Copy, AlertTriangle, X, Settings } from 'lucide-react';

export default function SupabaseSetupBanner() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // If Supabase is fully configured, do not show any banner
  if (isSupabaseConfigured) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div id="supabase-status-banner" className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200 flex justify-between items-center gap-4 glow-accent-amber">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Demo / Local Mode active.</strong> Real cloud saves are offline because Supabase credentials are not set in your Secrets. Using offline-safe local storage.
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded px-2.5 py-1 font-medium whitespace-nowrap transition cursor-pointer"
        >
          View Supabase Setup Guide & SQL
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1525] border border-gray-800 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-display font-semibold text-white">Supabase Connection Guide</h2>
            </div>

            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              To connect your <strong>Eagles Freight Growth Command Center</strong> to your live Supabase cloud database, configure these two variables inside the <strong>Secrets panel</strong> of AI Studio:
            </p>

            <div className="bg-black/40 border border-gray-800 rounded-lg p-4 mb-6">
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-gray-500"># Click 'Secrets' in AI Studio UI and set:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-blue-400">VITE_SUPABASE_URL</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-green-400">"https://your-project-id.supabase.co"</span>
                  </div>
                </div>
                <div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-blue-400">VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-green-400">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-500" />
                Step 1: Paste this SQL in your Supabase SQL Editor
              </span>
              <button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy SQL Script'}
              </button>
            </div>

            <div className="bg-slate-950 border border-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto text-xs font-mono text-gray-400 whitespace-pre scrollbar-thin">
              {getSupabaseSchemaSQL()}
            </div>

            <div className="mt-6 border-t border-gray-800/60 pt-4 flex justify-between items-center text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Fully typed & compliant with Phase 1.
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Got it, run in local mode for now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
