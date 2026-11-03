import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Brain, Globe, Settings, LogOut, CloudRain } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/scenarios', label: 'Scenarios', icon: FlaskConical },
  { path: '/advisor', label: 'AI Advisor', icon: Brain },
  { path: '/weather', label: 'Weather Intel', icon: CloudRain },
  { path: '/market', label: 'Market Intel', icon: Globe },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-[260px] h-screen fixed left-0 top-0 bg-gradient-to-b from-ferrero-dark to-ferrero-brown text-ferrero-cream flex-col shadow-xl z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="text-3xl drop-shadow-md">🌰</div>
        <div>
          <h1 className="text-xl font-bold text-ferrero-gold tracking-wide uppercase">Ferrero</h1>
          <p className="text-[10px] uppercase tracking-wider text-ferrero-cream-light opacity-80">Pricing Intel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-white/12 text-ferrero-gold border border-ferrero-gold/40 font-medium shadow-md'
                  : 'text-ferrero-cream border border-white/10 bg-black/10 hover:bg-white/8 hover:text-ferrero-cream-light'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="px-3 pb-4 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-ferrero-cream/70 hover:bg-white/5 hover:text-white transition-all text-sm w-full text-left">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-ferrero-cream/70 hover:bg-white/5 hover:text-white transition-all text-sm w-full text-left">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ferrero-gold text-ferrero-dark flex items-center justify-center font-bold shadow-inner">
            JD
          </div>
          <div>
            <div className="text-sm font-semibold text-white">John Doe</div>
            <div className="text-xs text-ferrero-gold">Pricing Dir.</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
