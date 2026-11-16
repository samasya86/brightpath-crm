import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface HeaderProps {
  onOpenMobileNav: () => void;
  title: string;
  subtitle?: string;
  role?: 'admin' | 'manager' | 'counsellor';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileNav,
  title,
  subtitle,
  role = 'counsellor',
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Titles */}
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block leading-none mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <Badge
          variant={role === 'admin' ? 'purple' : role === 'manager' ? 'blue' : 'green'}
          size="md"
          dot
          className="capitalize hidden sm:inline-flex"
        >
          {role}
        </Badge>

        {/* Notifications Icon (Placeholder for Phase 8) */}
        <button
          type="button"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-50">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">
              BrightPath Staff
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">
              Phase 1 Prototype
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
