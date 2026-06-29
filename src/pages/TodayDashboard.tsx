import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, getLocalDateString } from '../lib/dataService';
import { DailyKPIData, WeeklyKPIData, Profile } from '../types';
import { 
  Plus, 
  Users, 
  MessageSquare, 
  Quote, 
  FileText, 
  Map, 
  BookOpen, 
  Globe,
  CheckCircle2, 
  Circle,
  TrendingUp,
  Activity,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { 
  AddProspectModal, 
  AddTouchModal, 
  AddShipmentFileModal, 
  AddRouteCardModal, 
  AddJournalModal,
  AddAgentTouchModal
} from '../components/Modals';

export default function TodayDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyData, setDailyData] = useState<DailyKPIData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyKPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Modals state
  const [activeModal, setActiveModal] = useState<'prospect' | 'touch' | 'shipment' | 'route' | 'journal' | 'agent_touch' | null>(null);

  const loadAllData = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const p = await dataService.getProfile(user.id);
      if (!p) {
        navigate('/onboarding');
        return;
      }
      setProfile(p);

      const todayStr = getLocalDateString();
      const [daily, weekly] = await Promise.all([
        dataService.getDailyKPIDetails(user.id, todayStr),
        dataService.getWeeklyKPIDetails(user.id, todayStr)
      ]);

      setDailyData(daily);
      setWeeklyData(weekly);
    } catch (err: any) {
      setError(err.message || 'Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-xs font-mono text-gray-400">
        Syncing Command Center with Supabase...
      </div>
    );
  }

  // Calculate day status: standard working week in freight forwarding for this executive is Sunday to Thursday
  const getWorkingDayStatus = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const isWorkingDay = day >= 0 && day <= 4; // Sunday to Thursday
    return {
      dayName: weekDays[day],
      isWorkingDay,
      label: isWorkingDay ? 'Active BD Cycle (Sunday - Thursday)' : 'Off Cycle'
    };
  };

  const dayStatus = getWorkingDayStatus();
  const formattedToday = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const kpisList = [
    { 
      key: 'prospects', 
      title: '5 Prospects Researched', 
      count: dailyData?.prospectsCount || 0, 
      target: 5, 
      icon: Users,
      desc: 'Add new companies with contact info',
      completed: dailyData?.kpis.prospects || false
    },
    { 
      key: 'touches', 
      title: '3 Customer Touches', 
      count: dailyData?.touchesCount || 0, 
      target: 3, 
      icon: MessageSquare,
      desc: 'Log calls, meetings, follow-ups',
      completed: dailyData?.kpis.touches || false
    },
    { 
      key: 'trialQuotes', 
      title: '1 Trial Quote Asked', 
      count: dailyData?.trialQuotesCount || 0, 
      target: 1, 
      icon: Quote,
      desc: 'Log touch with trial quote asked flag',
      completed: dailyData?.kpis.trialQuotes || false
    },
    { 
      key: 'shipmentFiles', 
      title: '1 Shipment File Studied', 
      count: dailyData?.shipmentFilesCount || 0, 
      target: 1, 
      icon: FileText,
      desc: 'Analyze shipment learnings, operational gaps',
      completed: dailyData?.kpis.shipmentFiles || false
    },
    { 
      key: 'routeCards', 
      title: '1 Route Card Learned', 
      count: dailyData?.routeCardsCount || 0, 
      target: 1, 
      icon: Map,
      desc: 'Create port schedules, solutions card',
      completed: dailyData?.kpis.routeCards || false
    },
    { 
      key: 'journal', 
      title: '1 Journal Completed', 
      count: dailyData?.journalEntryCount || 0, 
      target: 1, 
      icon: BookOpen,
      desc: 'Log daily learning & targets',
      completed: dailyData?.kpis.journal || false
    }
  ];

  const quickAdds = [
    { name: 'Prospect', type: 'prospect', color: 'bg-blue-600/10 text-blue-400 border-blue-500/20' },
    { name: 'Customer Touch', type: 'touch', color: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' },
    { name: 'Shipment Study', type: 'shipment', color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Route Card', type: 'route', color: 'bg-amber-600/10 text-amber-400 border-amber-500/20' },
    { name: 'Freight Journal', type: 'journal', color: 'bg-purple-600/10 text-purple-400 border-purple-500/20' },
    { name: 'Agent Touch', type: 'agent_touch', color: 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20' }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">Today's Cockpit</h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>{formattedToday}</span>
            <span className="text-gray-600">•</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
              dayStatus.isWorkingDay 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 font-medium' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}>
              {dayStatus.label}
            </span>
          </p>
        </div>

        {/* PROFILE CHIP */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 flex items-center gap-3 w-fit shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center font-mono text-xs text-blue-400 border border-blue-500/30">
            {profile?.full_name ? profile.full_name[0].toUpperCase() : 'E'}
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-gray-200">{profile?.full_name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{profile?.company_name}</p>
          </div>
        </div>
      </header>

      {/* QUICK ACTIONS ROW */}
      <section>
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Quick Add Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickAdds.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveModal(item.type as any)}
              id={`btn-quick-add-${item.type}`}
              className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ${item.color}`}
            >
              <div className="truncate">
                <span className="block text-[10px] opacity-70 font-mono uppercase">Log New</span>
                <span className="text-xs font-semibold">{item.name}</span>
              </div>
              <Plus className="w-4 h-4 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI COMPLETION RING CARD */}
        <div className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center glow-accent relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/5 rounded-full blur-xl pointer-events-none"></div>

          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-6 w-full text-left">Daily KPI Score</h3>
          
          <div className="relative flex items-center justify-center mb-6">
            {/* SVG Circle Indicator */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-gray-800/60"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-blue-500 transition-all duration-500 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - (dailyData?.score || 0) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span id="daily-score-text" className="text-3xl font-display font-bold text-white leading-none">
                {dailyData?.score || 0}%
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase mt-1">
                Completed
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Target <strong>100%</strong> daily by securing {6 - Object.values(dailyData?.kpis || {}).filter(Boolean).length} more routines before local end of day.
          </p>
        </div>

        {/* SIX DYNAMIC KPI ROUTINES LIST */}
        <div className="lg:col-span-2 bg-gray-900/30 border border-gray-800/80 rounded-2xl p-6 glow-accent">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Routines Checklist</h3>
            <span className="text-[10px] font-mono text-blue-400">Real-time status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kpisList.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={kpi.key}
                  id={`kpi-card-${kpi.key}`}
                  className={`flex items-start p-3.5 rounded-xl border transition ${
                    kpi.completed 
                      ? 'bg-blue-600/5 border-blue-500/30 glow-accent' 
                      : 'bg-gray-950/20 border-gray-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg border mr-3 shrink-0 ${
                    kpi.completed 
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                      : 'bg-gray-900 border-gray-800 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-gray-200 truncate">{kpi.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{kpi.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800/50">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((kpi.count / kpi.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                        {kpi.count} / {kpi.target}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {kpi.completed ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-gray-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WEEKLY MINI PREVIEW */}
      <section className="bg-gray-900/10 border border-gray-800/80 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Weekly Dashboard Preview</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Tracking progress cycle Sunday to Thursday</p>
          </div>
          <button 
            onClick={() => navigate('/kpis')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
          >
            Full Analytics <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Prospects', value: weeklyData?.prospectsCount || 0, target: 25 },
            { label: 'Touches', value: weeklyData?.touchesCount || 0, target: 15 },
            { label: 'Trial Quotes', value: weeklyData?.trialQuotesCount || 0, target: 5 },
            { label: 'Shipment Files', value: weeklyData?.shipmentFilesCount || 0, target: 5 },
            { label: 'Route Cards', value: weeklyData?.routeCardsCount || 0, target: 5 },
            { label: 'Agent Touches', value: weeklyData?.agentTouchesCount || 0, target: 10 },
            { label: 'Weekly Review', value: weeklyData?.hasProgressUpdate ? 1 : 0, target: 1 }
          ].map((item) => (
            <div key={item.label} className="bg-gray-950/40 border border-gray-800/50 rounded-xl p-3 text-center">
              <span className="block text-[10px] text-gray-500 truncate">{item.label}</span>
              <span className="block text-base font-display font-bold text-gray-200 mt-1">{item.value} <span className="text-xs text-gray-600 font-normal">/ {item.target}</span></span>
              <div className="mt-2 bg-gray-900 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.value >= item.target ? 'bg-blue-500' : 'bg-gray-700'}`}
                  style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ALL WORKING QUICK-ADD MODALS */}
      {profile && (
        <>
          <AddProspectModal
            userId={profile.id}
            isOpen={activeModal === 'prospect'}
            onClose={() => setActiveModal(null)}
            onSave={loadAllData}
          />
          <AddTouchModal
            userId={profile.id}
            isOpen={activeModal === 'touch'}
            onClose={() => setActiveModal(null)}
            onSave={loadAllData}
          />
          <AddShipmentFileModal
            userId={profile.id}
            isOpen={activeModal === 'shipment'}
            onClose={() => setActiveModal(null)}
            onSave={loadAllData}
          />
          <AddRouteCardModal
            userId={profile.id}
            isOpen={activeModal === 'route'}
            onClose={() => setActiveModal(null)}
            onSave={loadAllData}
          />
          <AddJournalModal
            userId={profile.id}
            isOpen={activeModal === 'journal'}
            onClose={() => setActiveModal(null)}
            onSave={loadAllData}
          />
          <AddAgentTouchModal
            userId={profile.id}
            isOpen={activeModal === 'agent_touch'}
            onClose={() => setActiveModal(null)}
            onSave={loadAllData}
          />
        </>
      )}
    </div>
  );
}
