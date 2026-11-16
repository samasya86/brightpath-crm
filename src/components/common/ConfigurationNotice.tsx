import React, { useState } from 'react';
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { supabaseConfigStatus, testSupabaseConnection } from '../../lib/supabaseClient';

export interface ConfigurationNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigurationNotice: React.FC<ConfigurationNoticeProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);

  const envTemplateText = `# BrightPath CRM — Local Environment
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(envTemplateText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRunPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Database Configuration"
      description="Backend connection status, diagnostic probes, and environment setup."
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open Supabase Console
            </Button>
          </a>
        </>
      }
    >
      <div className="space-y-6">
        {/* Connection Diagnostics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Project URL
              </span>
              <Badge
                size="sm"
                variant={supabaseConfigStatus.urlConfigured ? 'green' : 'amber'}
                dot
              >
                {supabaseConfigStatus.urlConfigured ? 'Connected' : 'Missing'}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-700 truncate">
              {supabaseConfigStatus.urlConfigured && supabaseConfigStatus.urlValue
                ? supabaseConfigStatus.urlValue
                : 'Not configured in .env'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Anon Client Key
              </span>
              <Badge
                size="sm"
                variant={supabaseConfigStatus.keyConfigured ? 'green' : 'amber'}
                dot
              >
                {supabaseConfigStatus.keyConfigured ? 'Supplied' : 'Missing'}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-700 truncate">
              {supabaseConfigStatus.keyConfigured ? '••••••••••••••••••••' : 'Not configured in .env'}
            </p>
          </div>
        </div>

        {/* Live Connectivity Probe */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Connectivity Probe
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Send a real-time HTTP handshake ping to verify your Supabase project.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              isLoading={isTesting}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleRunPing}
            >
              Test Ping
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                testResult.ok
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.ok ? 'Connection Verified' : 'Check Required'}</p>
                <p className="mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* 3-Step Setup Instructions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Setup Walkthrough
          </h4>

          <ol className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Sign in to your <strong className="text-slate-800">Supabase Dashboard</strong> and open your project.
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Navigate to <strong className="text-slate-800">Project Settings → API</strong> to find your <code>Project URL</code> and <code>anon / public</code> key.
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span>
                Create a file named <strong className="text-slate-800">.env</strong> in your project root and paste your credentials.
              </span>
            </li>
          </ol>
        </div>

        {/* Copyable .env Template */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Template for .env
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
            {envTemplateText}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
