import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export const Layout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  // Route metadata mapping
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
      subtitle: 'Coaching Institute Management System',
    };
  };

  const meta = getRouteMeta(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar currentRole="counsellor" />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentRole="counsellor"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
          role="counsellor"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
