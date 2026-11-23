import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';

export const SettingsPage: React.FC = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await authService.updateProfileName(user.id, fullName.trim());
      await refreshProfile();
      setSaveSuccess(true);
      showToast('success', 'Profile Updated', 'Your staff profile name has been updated.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile name';
      setSaveError(msg);
      showToast('error', 'Update Failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Staff Member';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

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
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={role === 'admin' ? 'purple' : role === 'manager' ? 'blue' : 'green'}
                  size="sm"
                  dot
                  className="capitalize"
                >
                  {role} Role
                </Badge>
                <span className="text-xs text-slate-400">
                  {user?.email || 'staff@brightpath.edu'}
                </span>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {saveError && (
            <p className="text-xs text-rose-600 font-medium">{saveError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Managed via Supabase Authentication"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Profile
            </Button>
          </div>
        </form>
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
