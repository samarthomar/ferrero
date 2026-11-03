import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const pageTitles = {
  '/': 'Executive Dashboard',
  '/scenarios': 'What-If Scenario Simulator',
  '/advisor': 'AI Pricing Advisor',
  '/weather': 'Weather Intelligence & Crop Monitoring',
  '/market': 'Market Intelligence & Signals'
};

export default function DashboardLayout() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Dashboard';
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <div className="min-h-screen w-full bg-ferrero-cream-light font-sans text-ferrero-dark flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-[260px] w-full max-w-full overflow-hidden">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 transition-all">
          <div>
            <h2 className="text-2xl font-bold text-ferrero-brown tracking-tight">{currentTitle}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-sm font-medium text-ferrero-brown-medium bg-ferrero-cream px-4 py-1.5 rounded-full shadow-inner border border-ferrero-brown/10 whitespace-nowrap">
              {currentDate}
            </div>
            
            <button className="relative p-2 text-ferrero-brown hover:bg-ferrero-cream rounded-full transition-colors group">
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white shadow-sm"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:py-8 lg:pl-8 lg:pr-12 overflow-x-hidden">
          <div className="w-full max-w-[1600px] mx-auto min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
