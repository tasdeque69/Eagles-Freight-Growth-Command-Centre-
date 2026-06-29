import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, getLocalDateString } from '../lib/dataService';
import { DailyKPIData, WeeklyKPIData } from '../types';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Quote, 
  FileText, 
  Map, 
  Calendar,
  Globe,
  Award,
  ChevronRight
} from 'lucide-react';

export default function KPIs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailyKPI, setDailyKPI] = useState<DailyKPIData | null>(null);
  const [weeklyKPI, setWeeklyKPI] = useState<WeeklyKPIData | null>(null);
  const [trend, setTrend] = useState<{ date: string; score: number }[]>([]);

  const loadKPIDetails = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const todayStr = getLocalDateString();
      const [daily, weekly, scoreTrend] = await Promise.all([
        dataService.getDailyKPIDetails(user.id, todayStr),
        dataService.getWeeklyKPIDetails(user.id, todayStr),
        dataService.getDailyScoreTrend(user.id)
      ]);
      setDailyKPI(daily);
      setWeeklyKPI(weekly);
      setTrend(scoreTrend);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKPIDetails();
  }, []);

  if (loading) {
    return (
      <div className="text-xs font-mono text-zinc-500 text-center py-10">
        Analyzing business development routines...
      </div>
    );
  }

  // Quotas configuration
  const weeklyQuotas = [
    { label: 'Prospects Researched', current: weeklyKPI?.prospectsCount || 0, target: 25, icon: Users, color: 'text-teal-400' },
    { label: 'Customer Touches Logged', current: weeklyKPI?.touchesCount || 0, target: 15, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Trial Quotations Secured', current: weeklyKPI?.trialQuotesCount || 0, target: 5, icon: Quote, color: 'text-emerald-400' },
    { label: 'Shipment Files Studied', current: weeklyKPI?.shipmentFilesCount || 0, target: 5, icon: FileText, color: 'text-indigo-400' },
    { label: 'Route Cards Learnt', current: weeklyKPI?.routeCardsCount || 0, target: 5, icon: Map, color: 'text-amber-400' },
    { label: 'Agent Contacts (China/Europe)', current: weeklyKPI?.agentTouchesCount || 0, target: 10, icon: Globe, color: 'text-cyan-400' }
  ];

  // SVG dimensions for score trend chart
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 25;

  // Make sure trend has elements to plot, otherwise fallback to mock values
  const displayTrend = trend.length > 0 ? trend : [
    { date: 'Sun', score: 40 },
    { date: 'Mon', score: 60 },
    { date: 'Tue', score: 80 },
    { date: 'Wed', score: 50 },
    { date: 'Thu', score: 100 }
  ];

  const points = displayTrend.map((t, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (displayTrend.length - 1 || 1);
    const y = chartHeight - padding - (t.score * (chartHeight - padding * 2)) / 100;
    return { x, y, label: t.date, score: t.score };
  });

  const svgPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-5">
        <h2 className="text-xl font-display font-semibold text-white tracking-tight">Routines & Quotas</h2>
        <p className="text-xs text-gray-400 mt-1">Review critical daily performance routines and weekly BD pipelines.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SCORE TREND LINE CHART */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-850 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              5-Day BD Command Score Trend
            </h3>
            <p className="text-[10px] text-zinc-500 mb-6">Historical index of completed daily routines.</p>
          </div>

          {/* SVG Sparkline */}
          <div className="w-full overflow-x-auto">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full min-w-[350px] overflow-visible"
            >
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((level) => {
                const y = chartHeight - padding - (level * (chartHeight - padding * 2)) / 100;
                return (
                  <g key={level} className="opacity-20">
                    <line 
                      x1={padding} 
                      y1={y} 
                      x2={chartWidth - padding} 
                      y2={y} 
                      className="stroke-zinc-700" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x={padding - 5} 
                      y={y + 3} 
                      className="fill-zinc-500 font-mono text-[8px]" 
                      textAnchor="end"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Path and Area */}
              {points.length > 0 && (
                <>
                  <path 
                    d={svgPath} 
                    fill="none" 
                    className="stroke-teal-400" 
                    strokeWidth="2" 
                  />
                  {/* Glowing data points */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="4" 
                        className="fill-zinc-950 stroke-teal-400" 
                        strokeWidth="2" 
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 8} 
                        className="fill-white font-mono text-[9px] font-semibold" 
                        textAnchor="middle"
                      >
                        {p.score}%
                      </text>
                      <text 
                        x={p.x} 
                        y={chartHeight - 6} 
                        className="fill-zinc-400 font-mono text-[8px]" 
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* SUMMARY INSIGHT BOX */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">BD Consistency Index</h3>
            <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 text-center mt-2">
              <Award className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <span className="block text-2xl font-bold text-white font-display">
                {dailyKPI?.score || 0}%
              </span>
              <span className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5 block">Today's Routine Secure</span>
            </div>
          </div>

          <div className="text-xs text-zinc-400 leading-relaxed space-y-2 mt-4 bg-zinc-950/20 border border-zinc-850 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block">Phase 1 Directives</span>
            <p>Routines are evaluated strictly on a daily index. Maintain high consistency to feed active weekly pipeline volumes.</p>
          </div>
        </div>

      </div>

      {/* WEEKLY QUOTAS TRACKER */}
      <section className="bg-zinc-900/10 border border-zinc-850 rounded-xl p-6">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">Weekly BD Quotas progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeklyQuotas.map((quota) => {
            const Icon = quota.icon;
            const pct = Math.min((quota.current / quota.target) * 100, 100);
            return (
              <div key={quota.label} className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-4.5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-zinc-950 rounded border border-zinc-800">
                      <Icon className={`w-4 h-4 ${quota.color}`} />
                    </div>
                    <span className="font-semibold text-zinc-200 truncate pr-2">{quota.label}</span>
                  </div>
                  <span className="font-mono text-zinc-400 whitespace-nowrap">
                    {quota.current} <span className="text-zinc-600">/ {quota.target}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span>{Math.round(pct)}% Complete</span>
                    <span>Target: {quota.target}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
