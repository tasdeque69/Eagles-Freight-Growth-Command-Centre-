import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { dataService } from './lib/dataService';
import { Profile } from './types';

// Page Imports
import TodayDashboard from './pages/TodayDashboard';
import ProspectTracker from './pages/ProspectTracker';
import CustomerTouchTracker from './pages/CustomerTouchTracker';
import ShipmentFileStudy from './pages/ShipmentFileStudy';
import RouteCards from './pages/RouteCards';
import FreightJournal from './pages/FreightJournal';
import KPIs from './pages/KPIs';
import WeeklyReview from './pages/WeeklyReview';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Growth from './pages/Growth';

import { getSupabaseSchemaSQL } from './lib/supabase';

// Layout Component
import Navigation from './components/Navigation';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkAuth = async () => {
    try {
      const user = await dataService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        const userProfile = await dataService.getProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      } else {
        setIsAuthenticated(false);
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error checking auth state:', err);
      if (err.message === 'DATABASE_SCHEMA_MISSING') {
        setSchemaMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (schemaMissing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b14] px-4 text-center">
        <div className="bg-gray-900/80 border border-red-500/30 p-8 rounded-2xl max-w-lg w-full shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <span className="text-red-500">⚠️</span> Database Schema Missing
          </h2>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            Your Supabase connection is successful, but the required tables do not exist.
            <br/><br/>
            Please copy the SQL schema script below and run it in your Supabase SQL Editor to create the necessary tables.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleCopySchema}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
              {copied ? '✅ SQL Copied to Clipboard!' : '📋 Copy SQL Schema'}
            </button>
            <button 
              onClick={() => {
                dataService.logout().then(() => window.location.reload());
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              Sign Out & Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b14] text-xs font-mono text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Synchronizing Eagles Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              profile ? <Navigate to="/" replace /> : <Navigate to="/onboarding" replace />
            ) : (
              <Login />
            )
          } 
        />

        {/* ONBOARDING ROUTE */}
        <Route 
          path="/onboarding" 
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : profile ? (
              <Navigate to="/" replace />
            ) : (
              <Onboarding />
            )
          } 
        />

        {/* PROTECTED ROUTES */}
        <Route 
          path="/*" 
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : !profile ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <LayoutWrapper profile={profile}>
                <Routes>
                  <Route path="/" element={<TodayDashboard />} />
                  <Route path="/prospects" element={<ProspectTracker />} />
                  <Route path="/touches" element={<CustomerTouchTracker />} />
                  <Route path="/shipments" element={<ShipmentFileStudy />} />
                  <Route path="/routes" element={<RouteCards />} />
                  <Route path="/journal" element={<FreightJournal />} />
                  <Route path="/kpis" element={<KPIs />} />
                  <Route path="/weekly-review" element={<WeeklyReview />} />
                  <Route path="/growth" element={<Growth />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </LayoutWrapper>
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

// Layout wrapper to inject the persistent sidebar and responsive layout offsets
function LayoutWrapper({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b14] text-zinc-100 flex flex-col md:flex-row">
      {/* PERSISTENT SIDEBAR */}
      <Navigation userName={profile.full_name} userRole={profile.role} />

      {/* MAIN APPLICATION VIEWPORT */}
      <main className="flex-1 md:pl-64 min-w-0 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
