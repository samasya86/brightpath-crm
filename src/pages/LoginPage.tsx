import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Location state for redirect after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSignUpSuccess(false);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setFormError('Please enter your full name for your staff profile.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName.trim());
        setSignUpSuccess(true);
        // Automatically sign in if session was returned or switch to sign in
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1200);
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Left Branding Showcase Column (Desktop) */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              BrightPath <span className="text-xs font-semibold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-800/60">CRM</span>
            </span>
            <p className="text-xs text-slate-400 font-medium">
              Coaching Academy Management System
            </p>
          </div>
        </div>

        {/* Center Feature Highlights */}
        <div className="my-12 lg:my-0 space-y-8 max-w-lg z-10">
          <div>
            <Badge variant="blue" size="sm" dot className="mb-3">
              Staff Portal • Version 2.0
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Empowering student admissions with real-time pipeline visibility.
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Manage prospective student enquiries, automate follow-up schedules, track conversion rates, and coordinate academy counsellors with strict database-level security.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Row Level Security (RLS)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-2xl font-bold text-indigo-400">Zero</p>
              <p className="text-xs text-slate-400 mt-0.5">Enquiry Drop-offs</p>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center gap-2 text-xs text-slate-500 z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Role-Based Access Control verified with Supabase PostgreSQL</span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-900/40">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl p-8 space-y-6">
          {/* Header & Mode Switcher */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? 'Create Staff Account' : 'Sign in to BrightPath'}
            </h2>
            <p className="text-xs text-slate-500">
              {isSignUp
                ? 'Register your profile to access admissions workflows'
                : 'Enter your academy credentials to access your dashboard'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setFormError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Staff Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setFormError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New Staff Registration
            </button>
          </div>

          {/* Feedback Banners */}
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {signUpSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Staff account registered successfully! Redirecting to workspace...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Staff Email Address"
              type="email"
              placeholder="name@brightpath.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              {isSignUp ? 'Register Staff Profile' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Role Explainer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              New accounts automatically receive the <strong>Counsellor</strong> role. Administrators can promote accounts to <strong>Manager</strong> or <strong>Admin</strong> via the Supabase SQL Editor.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
