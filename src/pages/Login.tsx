import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { ShieldCheck, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in on load
  useEffect(() => {
    dataService.getCurrentUser().then((user) => {
      if (user) {
        // Check if user has profile
        dataService.getProfile(user.id).then((profile) => {
          if (profile) {
            navigate('/');
          } else {
            navigate('/onboarding');
          }
        }).catch(err => {
          console.error("Profile check error:", err);
          navigate('/onboarding');
        });
      }
    }).catch(err => {
      console.error("Auth check error:", err);
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await dataService.login(email, password);
        const profile = await dataService.getProfile(user.id);
        if (profile) {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      } else {
        const user = await dataService.signUp(email, password);
        navigate('/onboarding');
      }
      // Force trigger App level state refresh
      window.location.reload();
    } catch (err: any) {
      if (isLogin && email.trim().toLowerCase() === 'bde.demo@eaglesfreightdemo.com') {
        setError(`Demo user must be created in Supabase Auth first. (Detail: ${err.message || 'Unknown'})`);
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoLogin = () => {
    setEmail('bde.demo@eaglesfreightdemo.com');
    setPassword('EaglesDemo@2026!');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-[#0c111e]/90 border border-gray-800/80 p-8 rounded-2xl shadow-2xl relative z-10 glow-accent">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600/10 p-3.5 rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase">
            EAGLES FREIGHT
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1.5 uppercase tracking-widest">
            Growth Command Center
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-medium mb-1.5">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                placeholder="e.g. hellxtremo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-1.5">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              id="btn-auth-submit"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLogin ? 'Access Command Center' : 'Create New Account'}
            </button>
          </div>
        </form>

        {isLogin && (
          <div className="pt-4 border-t border-gray-800/40 space-y-2">
            <button
              type="button"
              onClick={handleUseDemoLogin}
              id="btn-demo-login"
              className="w-full bg-[#111827] hover:bg-[#1f2937] text-gray-300 hover:text-white border border-gray-800 rounded-lg py-2.5 px-4 transition text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              Use Demo Login
            </button>
            <p className="text-[10px] text-gray-500 text-center">
              Development demo account only. Do not use real company data.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            id="btn-auth-toggle"
            className="text-xs text-blue-400 hover:text-blue-300 transition font-medium cursor-pointer"
          >
            {isLogin ? 'New to Eagles? Create a credentials profile' : 'Already have access? Log in here'}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-gray-950/30 border border-gray-800/40 rounded-xl p-4 mt-6 text-[11px] text-gray-500 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>System Notice:</strong> Logged-in sessions are securely separated using standard Postgres Row Level Security. Demo accounts can sign up immediately!
          </div>
        </div>
      </div>
    </div>
  );
}
