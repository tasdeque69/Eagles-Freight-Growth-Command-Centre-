import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, getWeekStartAndEnd, getLocalDateString } from '../lib/dataService';
import { WeeklyReview, WeeklyKPIData } from '../types';
import { 
  Plus, 
  Calendar, 
  X, 
  Save, 
  AlertCircle,
  Loader2,
  FileText,
  TrendingUp,
  Award,
  Sparkles,
  ClipboardList,
  Check
} from 'lucide-react';

export default function WeeklyReviewPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New review form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState(() => {
    const { start } = getWeekStartAndEnd(new Date());
    return start;
  });
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyKPIData | null>(null);
  const [bestLearning, setBestLearning] = useState('');
  const [biggestWeakness, setBiggestWeakness] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const loadReviews = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      const data = await dataService.getWeeklyReviews(user.id);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync weekly reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // When selectedWeekDate changes, load metrics for that week
  useEffect(() => {
    if (!userId || !selectedWeekDate) return;
    
    const fetchWeekMetrics = async () => {
      try {
        const metrics = await dataService.getWeeklyKPIDetails(userId, selectedWeekDate);
        setWeeklyMetrics(metrics);
      } catch (err) {
        console.error('Failed to load metrics for week:', err);
      }
    };
    fetchWeekMetrics();
  }, [userId, selectedWeekDate]);

  const handleGenerateReview = () => {
    if (!weeklyMetrics) return;
    
    // Generate a highly structured, professional executive reflection
    const text = `WEEKLY FREIGHT BD PERFORMANCE ASSESSMENT
Sprint Commencing: ${weeklyMetrics.weekStartDate}

1. METRIC PIPELINE AUDIT
- Lead Generation: ${weeklyMetrics.prospectsCount} / 25 target leads identified.
- Communication Velocity: ${weeklyMetrics.touchesCount} / 15 client communications logged.
- Commercial Conversion: ${weeklyMetrics.trialQuotesCount} / 5 trial quotes requested.
- Study File Audits: ${weeklyMetrics.shipmentFilesCount} / 5 actual operational files completed.
- Carrier Profiles: ${weeklyMetrics.routeCardsCount} / 5 shipping route cards designed.
- Partner Alignment: ${weeklyMetrics.agentTouchesCount} / 10 overseas agent alignments completed.

2. COMMERCIAL INSIGHTS & LEARNING RECAP
${bestLearning ? `- Key Lesson: ${bestLearning}` : '- Key Lesson: No reflections submitted.'}

3. OPERATIONAL BOTTLENECKS
${biggestWeakness ? `- Core Issue: ${biggestWeakness}` : '- Core Issue: No specific blocker reported.'}

4. NEXT WEEK STRATEGIC BLUEPRINT
${nextWeekFocus ? `- High-Priority Focus: ${nextWeekFocus}` : '- High-Priority Focus: Maintain baseline prospecting velocity.'}

Report prepared via Eagles BD Command Center. Live database synchronized.`;
    
    setGeneratedText(text);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!weeklyMetrics) return;
    if (!bestLearning || !biggestWeakness || !nextWeekFocus) {
      setFormError('Please fill in reflections, bottlenecks, and next week\'s focus.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const reviewPayload = {
        week_start_date: weeklyMetrics.weekStartDate,
        prospects_count: weeklyMetrics.prospectsCount,
        touches_count: weeklyMetrics.touchesCount,
        trial_quotes_count: weeklyMetrics.trialQuotesCount,
        shipment_files_count: weeklyMetrics.shipmentFilesCount,
        route_cards_count: weeklyMetrics.routeCardsCount,
        agent_touches_count: weeklyMetrics.agentTouchesCount,
        best_learning: bestLearning,
        biggest_weakness: biggestWeakness,
        next_week_focus: nextWeekFocus,
        generated_text: generatedText || 'Review completed successfully.',
      };

      await dataService.saveWeeklyReview(userId, reviewPayload);
      loadReviews();
      setIsFormOpen(false);
      
      // Reset form fields
      setBestLearning('');
      setBiggestWeakness('');
      setNextWeekFocus('');
      setGeneratedText('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit review');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Weekly Review Board</h2>
          <p className="text-xs text-gray-400 mt-1">Audit weekly conversions, compile lessons, and commit sprint reports.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            id="btn-add-review-page"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Start Weekly Review
          </button>
        )}
      </header>

      {/* NEW REVIEW FORM PANEL */}
      {isFormOpen && (
        <section className="bg-gray-900/30 border border-blue-500/20 rounded-2xl p-6 relative glow-accent">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-base font-display font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" /> Commit Weekly Review & Assessment
          </h3>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Select Sprint Start Date (Sunday) *</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500" 
                  value={selectedWeekDate} 
                  onChange={e => setSelectedWeekDate(e.target.value)} 
                />
              </div>

              {weeklyMetrics && (
                <div className="md:col-span-2 bg-gray-950/40 border border-gray-800/80 rounded-xl p-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
                  <div>
                    <span className="text-gray-500 block">Leads</span>
                    <span className="font-bold text-white block mt-0.5">{weeklyMetrics.prospectsCount} / 25</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Touches</span>
                    <span className="font-bold text-white block mt-0.5">{weeklyMetrics.touchesCount} / 15</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Quotes</span>
                    <span className="font-bold text-white block mt-0.5">{weeklyMetrics.trialQuotesCount} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Files</span>
                    <span className="font-bold text-white block mt-0.5">{weeklyMetrics.shipmentFilesCount} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Routes</span>
                    <span className="font-bold text-white block mt-0.5">{weeklyMetrics.routeCardsCount} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Agents</span>
                    <span className="font-bold text-white block mt-0.5">{weeklyMetrics.agentTouchesCount} / 10</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">1. Highlight/Lesson: Best learning or major win this week? *</label>
                <textarea 
                  required
                  placeholder="e.g. Learned that Lufthansa Cargo consolidates high-value goods on Tuesdays, which secures better pricing."
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" 
                  value={bestLearning} 
                  onChange={e => setBestLearning(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">2. Bottleneck: Biggest operational weakness or mistake found? *</label>
                <textarea 
                  required
                  placeholder="e.g. Missed the carrier cut-off for the Rotterdam file because clearance documents were delayed."
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" 
                  value={biggestWeakness} 
                  onChange={e => setBiggestWeakness(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">3. Future Plan: Core tactical focus for next week? *</label>
                <textarea 
                  required
                  placeholder="e.g. Schedule pre-clearance with local agents 48 hours prior to vessel departure."
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 h-16 resize-none" 
                  value={nextWeekFocus} 
                  onChange={e => setNextWeekFocus(e.target.value)} 
                />
              </div>
            </div>

            <div className="border-t border-gray-800/40 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={handleGenerateReview}
                  className="bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 px-3.5 py-1.5 rounded font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Synthesis Sprint Report Text
                </button>
              </div>

              {generatedText && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 uppercase block">Compiled Sprint Summary</span>
                  <pre className="bg-slate-950 border border-gray-850 rounded-xl p-4 font-mono text-gray-400 whitespace-pre-wrap max-h-56 overflow-y-auto scrollbar-thin">
                    {generatedText}
                  </pre>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={formLoading} 
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Submit Review Log
            </button>
          </form>
        </section>
      )}

      {/* REVIEWS HISTORY LIST */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Historical Sprint Reviews</h3>
        {loading ? (
          <div className="text-xs font-mono text-gray-500 text-center py-6">Syncing previous assessments...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-10 text-center">
            <p className="text-xs text-gray-400">No committed weekly sprint reviews found in logs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div 
                key={r.id} 
                id={`review-card-${r.id}`}
                className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-5 space-y-4 hover:border-gray-700 transition"
              >
                {/* Top header line */}
                <div className="flex justify-between items-center border-b border-gray-800/40 pb-3 text-xs">
                  <span className="font-mono text-gray-400 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" /> Sprint Week Commenced: {r.week_start_date}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Committed to Database
                  </span>
                </div>

                {/* Grid performance summary */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-gray-950/20 border border-gray-800/30 rounded-xl p-3 text-center text-[10px] font-mono">
                  <div>
                    <span className="text-gray-500 block">Leads</span>
                    <span className={`font-bold block mt-0.5 ${r.prospects_count >= 25 ? 'text-emerald-400' : 'text-white'}`}>{r.prospects_count} / 25</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Touches</span>
                    <span className={`font-bold block mt-0.5 ${r.touches_count >= 15 ? 'text-emerald-400' : 'text-white'}`}>{r.touches_count} / 15</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Quotes</span>
                    <span className={`font-bold block mt-0.5 ${r.trial_quotes_count >= 5 ? 'text-emerald-400' : 'text-white'}`}>{r.trial_quotes_count} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Files</span>
                    <span className={`font-bold block mt-0.5 ${r.shipment_files_count >= 5 ? 'text-emerald-400' : 'text-white'}`}>{r.shipment_files_count} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Routes</span>
                    <span className={`font-bold block mt-0.5 ${r.route_cards_count >= 5 ? 'text-emerald-400' : 'text-white'}`}>{r.route_cards_count} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Agents</span>
                    <span className={`font-bold block mt-0.5 ${r.agent_touches_count >= 10 ? 'text-emerald-400' : 'text-white'}`}>{r.agent_touches_count} / 10</span>
                  </div>
                </div>

                {/* reflections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-gray-950/10 border border-gray-800/30 p-3.5 rounded-xl">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase block">Best Learning & Reflections</span>
                    <p className="text-gray-300 mt-1 leading-relaxed italic">"{r.best_learning}"</p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl">
                    <span className="text-[10px] text-red-400 font-semibold uppercase block">Observed Bottlenecks</span>
                    <p className="text-gray-300 mt-1 leading-relaxed italic">"{r.biggest_weakness}"</p>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl">
                    <span className="text-[10px] text-blue-400 font-semibold uppercase block">Tactical Next-Week Focus</span>
                    <p className="text-gray-200 mt-1 leading-relaxed font-semibold">"{r.next_week_focus}"</p>
                  </div>
                </div>

                {/* Show review summary text */}
                {r.generated_text && (
                  <details className="text-xs">
                    <summary className="text-gray-500 hover:text-gray-400 cursor-pointer font-semibold py-1.5 inline-flex items-center gap-1 outline-none">
                      View Compiled Sprint Audit Report Text
                    </summary>
                    <pre className="mt-2 bg-slate-950 border border-gray-850 rounded-xl p-3.5 font-mono text-[10px] text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin">
                      {r.generated_text}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
