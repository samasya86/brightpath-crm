import React from 'react';
import { Shield, User, Building, Database } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System & Staff Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your profile preferences and view academy configuration
        </p>
      </div>

      {/* User Profile Card */}
      <Card title="User Identity & Role">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center">
              SR
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Sunita Rao</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="blue" size="sm" dot>
                  Counsellor Role
                </Badge>
                <span className="text-xs text-slate-400">
                  sunita.rao@brightpath.edu
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Display Full Name" defaultValue="Sunita Rao" />
            <Input label="Email Address" defaultValue="sunita.rao@brightpath.edu" disabled />
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Academy Settings Card */}
      <Card title="Academy Operational Defaults">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Academy Legal Name" defaultValue="BrightPath Coaching Academy" disabled />
            <Input label="Operating Timezone" defaultValue="Asia/Kolkata (IST +05:30)" disabled />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
            <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              Role permissions are enforced strictly at the database boundary via PostgreSQL Row Level Security (RLS). 
              Only Administrators can elevate roles via the Supabase SQL Editor.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
