import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { dataService } from '../lib/dataService';
import { Target, TrendingUp, BookOpen, Award, Compass, Search, Briefcase, Zap, Loader2 } from 'lucide-react';

import FiveYearRoadmapTab from '../components/growth/FiveYearRoadmapTab';
import AnnualGoalsTab from '../components/growth/AnnualGoalsTab';
import QuarterlySprintsTab from '../components/growth/QuarterlySprintsTab';
import SkillMatrixTab from '../components/growth/SkillMatrixTab';
import MarketIntelligenceTab from '../components/growth/MarketIntelligenceTab';
import AIPromptLibraryTab from '../components/growth/AIPromptLibraryTab';
import GrowthPortfolioTab from '../components/growth/GrowthPortfolioTab';

export default function Growth() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [counts, setCounts] = useState({
    roadmap: 0,
    goals: 0,
    sprints: 0,
    skills: 0,
    market: 0,
    prompts: 0,
    portfolio: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await dataService.getCurrentUser();
      if (user) {
        setUserId(user.id);
        fetchCounts(user.id);
      }
    };
    init();
  }, []);

  const fetchCounts = async (uid: string) => {
    if (!supabase) return;
    try {
      const [
        { count: c1 }, { count: c2 }, { count: c3 }, { count: c4 }, { count: c5 }, { count: c6 }, { count: c7 }
      ] = await Promise.all([
        supabase.from('five_year_roadmap').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('annual_goals').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('quarterly_sprints').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('skill_matrix').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('market_intelligence').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('ai_prompt_library').select('*', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('growth_portfolio').select('*', { count: 'exact', head: true }).eq('user_id', uid)
      ]);

      setCounts({
        roadmap: c1 || 0,
        goals: c2 || 0,
        sprints: c3 || 0,
        skills: c4 || 0,
        market: c5 || 0,
        prompts: c6 || 0,
        portfolio: c7 || 0,
      });
    } catch (err) {
      console.error("Error fetching growth counts:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'roadmap', name: '5-Year Roadmap', icon: Compass },
    { id: 'goals', name: 'Annual Goals', icon: Target },
    { id: 'sprints', name: 'Quarterly Sprints', icon: Zap },
    { id: 'skills', name: 'Skill Matrix', icon: Award },
    { id: 'market', name: 'Market Intelligence', icon: Search },
    { id: 'prompts', name: 'AI Prompt Library', icon: BookOpen },
    { id: 'portfolio', name: 'Growth Portfolio', icon: Briefcase },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500 w-7 h-7" />
            Growth Center
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Your 5-Year strategic freight growth system.</p>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {[
          { label: 'Roadmap', value: counts.roadmap },
          { label: 'Annual Goals', value: counts.goals },
          { label: 'Sprints', value: counts.sprints },
          { label: 'Skills', value: counts.skills },
          { label: 'Market Intel', value: counts.market },
          { label: 'AI Prompts', value: counts.prompts },
          { label: 'Portfolio', value: counts.portfolio },
        ].map(item => (
          <div key={item.label} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold text-white mb-1">{loading ? '-' : item.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 mb-6 overflow-x-auto">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                  ${active 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900/20 rounded-xl">
        {!userId ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {activeTab === 'roadmap' && <FiveYearRoadmapTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
            {activeTab === 'goals' && <AnnualGoalsTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
            {activeTab === 'sprints' && <QuarterlySprintsTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
            {activeTab === 'skills' && <SkillMatrixTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
            {activeTab === 'market' && <MarketIntelligenceTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
            {activeTab === 'prompts' && <AIPromptLibraryTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
            {activeTab === 'portfolio' && <GrowthPortfolioTab userId={userId} onUpdate={() => fetchCounts(userId)} />}
          </>
        )}
      </div>
    </div>
  );
}
