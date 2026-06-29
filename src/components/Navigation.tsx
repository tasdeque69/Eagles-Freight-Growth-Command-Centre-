import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  FileText, 
  Map, 
  BookOpen, 
  BarChart2, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { dataService } from '../lib/dataService';

interface NavigationProps {
  userName: string;
  userRole: string;
}

export default function Navigation({ userName, userRole }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMoreMobile, setShowMoreMobile] = useState(false);

  const handleLogout = async () => {
    try {
      await dataService.logout();
      navigate('/login');
      window.location.reload();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const navItems = [
    { name: 'Today', path: '/', icon: Home, mobile: true },
    { name: 'Prospects', path: '/prospects', icon: Users, mobile: true },
    { name: 'Touches', path: '/touches', icon: MessageSquare, mobile: true },
    { name: 'Shipments', path: '/shipments', icon: FileText, mobile: false },
    { name: 'Route Cards', path: '/routes', icon: Map, mobile: false },
    { name: 'Journal', path: '/journal', icon: BookOpen, mobile: false },
    { name: 'KPIs', path: '/kpis', icon: BarChart2, mobile: false },
    { name: 'Weekly Review', path: '/weekly-review', icon: Calendar, mobile: false },
    { name: 'Growth', path: '/growth', icon: TrendingUp, mobile: false },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, mobile: false },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside id="desktop-sidebar" className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0f1422] border-r border-gray-800/80 z-20">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo / Header */}
          <div className="flex items-center px-6 mb-6">
            <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20 mr-3">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-sm font-display font-bold text-white tracking-wide uppercase leading-tight">EAGLES FREIGHT</h1>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Growth Center</span>
            </div>
          </div>

          {/* User profile brief */}
          <div className="px-6 py-4 mx-4 mb-4 bg-gray-900/40 border border-gray-800/50 rounded-xl">
            <div className="text-xs font-semibold text-gray-200 truncate">{userName || 'Executive User'}</div>
            <div className="text-[10px] text-gray-500 truncate mt-0.5">{userRole || 'BD Executive'}</div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 space-y-1 bg-[#0f1422]">
            {navItems.map((item) => {
              const ActiveIcon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  id={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`group flex items-center px-4 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 pl-3.5 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                  }`}
                >
                  <ActiveIcon className={`mr-3 h-4 h-4 shrink-0 transition-colors ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="flex-shrink-0 flex border-t border-gray-800/60 p-4 bg-gray-950/20">
          <button
            onClick={handleLogout}
            id="btn-desktop-logout"
            className="flex items-center w-full px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
          >
            <LogOut className="mr-3 h-4 h-4 text-red-400" />
            Logout Command
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c101d] border-t border-gray-800/80 flex justify-around items-center z-40 px-2 pb-safe">
        {navItems.filter(item => item.mobile).map((item) => {
          const ActiveIcon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              id={`mobile-nav-${item.name.toLowerCase()}`}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer ${
                active ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <ActiveIcon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* More tab to toggle panel */}
        <button
          onClick={() => setShowMoreMobile(!showMoreMobile)}
          id="mobile-nav-more"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer ${
            showMoreMobile ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          {showMoreMobile ? <X className="w-5 h-5 text-blue-400" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] mt-1 font-medium tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE MORE MENU BOTTOM SHEET */}
      {showMoreMobile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden" onClick={() => setShowMoreMobile(false)}>
          <div 
            className="absolute bottom-16 left-0 right-0 bg-[#0e1322] border-t border-gray-800 rounded-t-2xl p-5 shadow-2xl overflow-y-auto max-h-[70vh] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Freight Menu</h3>
                <p className="text-xs font-semibold text-gray-200 mt-0.5">{userName || 'Executive User'}</p>
              </div>
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-2.5 py-0.5 font-mono">
                BD Control
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {navItems.filter(item => !item.mobile).map((item) => {
                const ActiveIcon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setShowMoreMobile(false)}
                    id={`mobile-more-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    className={`flex items-center p-3 rounded-xl border transition ${
                      active 
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-medium' 
                        : 'bg-gray-900/40 border-gray-800/40 text-gray-300 hover:bg-gray-800/40'
                    }`}
                  >
                    <ActiveIcon className="w-4 h-4 mr-2.5 text-blue-500" />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowMoreMobile(false);
                  handleLogout();
                }}
                id="btn-mobile-logout"
                className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout Command Center
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
