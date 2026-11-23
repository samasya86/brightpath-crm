import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ConfigurationNotice } from '../common/ConfigurationNotice';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const Layout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const location = useLocation();

  const getRouteMeta = (pathname: string): { title: string; subtitle: string } => {
    if (pathname === '/') {
      return {
        title: 'Executive Dashboard',
        subtitle: 'Key metrics, conversion trends, and urgent action items',
      };
    }
    if (pathname.startsWith('/leads/') && pathname !== '/leads') {
      return {
        title: 'Lead Profile & Timeline',
        subtitle: 'Enquiry details, interaction notes, and scheduled follow-ups',
      };
    }
    if (pathname === '/leads') {
      return {
        title: 'Enquiry & Lead Pipeline',
        subtitle: 'Filter, search, assign, and track admission prospects',
      };
    }
    if (pathname === '/followups') {
      return {
        title: 'Follow-ups & Schedules',
        subtitle: 'Upcoming student interactions and overdue action queue',
      };
    }
    if (pathname === '/reports') {
      return {
        title: 'Admissions & Conversion Reports',
        subtitle: 'Source breakdowns and conversion funnel summaries',
      };
    }
    if (pathname === '/settings') {
      return {
        title: 'System Settings',
        subtitle: 'Profile preferences and configuration',
      };
    }
    return {
      title: 'BrightPath CRM',
      subtitle: 'Coaching Academy Management System',
    };
  };

  const meta = getRouteMeta(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Subtle Top Configuration Alert Strip */}
        {!isSupabaseConfigured && (
          <div
            onClick={() => setIsConfigModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer select-none shadow-xs"
          >
            <div className="flex items-center gap-2 max-w-4xl mx-auto truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="truncate">
                Supabase database keys not detected in <code>.env</code>. Running in UI preview mode.
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider shrink-0 underline ml-2">
              Setup Guide <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}

        <Header
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Configuration Modal */}
      <ConfigurationNotice
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
};
