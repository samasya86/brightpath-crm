import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Percent,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Demo KPI metrics for Phase 1 visual preview
  const demoKpis = [
    {
      title: 'Total Enquiries',
      value: '24',
      change: '+12% this month',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'New Leads',
      value: '8',
      change: 'Needs first contact',
      icon: UserPlus,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Converted Admissions',
      value: '6',
      change: 'Enrolled students',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Overdue Follow-ups',
      value: '3',
      change: 'Action required now',
      icon: AlertCircle,
      iconBg: 'bg-rose-50 text-rose-600',
      urgent: true,
    },
    {
      title: 'Conversion Rate',
      value: '25.0%',
      change: 'Goal: >20%',
      icon: Percent,
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="blue" size="sm">Phase 1 Layout Active</Badge>
            <span className="text-xs text-slate-300">BrightPath Coaching Academy</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, Counsellor!
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Here is your daily admissions briefing. You have 3 urgent follow-ups scheduled for today.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsDemoModalOpen(true)}
          className="shrink-0"
        >
          Quick Action
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {demoKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold ${kpi.urgent ? 'text-rose-600' : 'text-slate-900'}`}>
                  {kpi.value}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                {kpi.change}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Analytics & Pipeline Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card
          title="Lead Pipeline by Stage"
          subtitle="Distribution of current enquiries"
          headerAction={
            <Link
              to="/leads"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-3">
            {[
              { stage: 'New', count: 8, color: 'bg-blue-500', pct: '33%' },
              { stage: 'Contacted', count: 5, color: 'bg-amber-500', pct: '21%' },
              { stage: 'Qualified', count: 4, color: 'bg-purple-500', pct: '17%' },
              { stage: 'Converted', count: 6, color: 'bg-emerald-500', pct: '25%' },
              { stage: 'Lost', count: 1, color: 'bg-rose-500', pct: '4%' },
            ].map((item) => (
              <div key={item.stage}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700">{item.stage}</span>
                  <span className="text-slate-500">{item.count} ({item.pct})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: item.pct }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Source Breakdown */}
        <Card
          title="Top Acquisition Channels"
          subtitle="Where student enquiries come from"
        >
          <div className="space-y-3">
            {[
              { source: 'Website Enquiries', count: 11, pct: '46%' },
              { source: 'Walk-ins (Campus)', count: 6, pct: '25%' },
              { source: 'Referrals (Alumni)', count: 4, pct: '17%' },
              { source: 'Phone / Messaging', count: 3, pct: '12%' },
            ].map((item) => (
              <div key={item.source} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-800">{item.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{item.count}</span>
                  <Badge size="sm" variant="slate">{item.pct}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Urgent Follow-ups */}
        <Card
          title="Immediate Follow-ups"
          subtitle="Scheduled callbacks for today"
          headerAction={
            <Link
              to="/followups"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All follow-ups <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-3">
            {[
              { name: 'Aarav Sharma', course: 'JEE Advanced Batch', time: '10:30 AM', status: 'overdue' },
              { name: 'Priya Patel', course: 'NEET FastTrack', time: '02:00 PM', status: 'pending' },
              { name: 'Rahul Verma', course: 'Foundation Grade 10', time: '04:30 PM', status: 'pending' },
            ].map((fu) => (
              <div key={fu.name} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors bg-white flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{fu.name}</p>
                  <p className="text-xs text-slate-500">{fu.course} • {fu.time}</p>
                </div>
                <Badge
                  size="sm"
                  variant={fu.status === 'overdue' ? 'rose' : 'amber'}
                  dot
                >
                  {fu.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Demo Modal test */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Phase 1 Shell Component Test"
        description="This modal tests keyboard trapping, backdrop blurring, and responsive dialog controls."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDemoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsDemoModalOpen(false)}>
              Understood
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          You are viewing the working UI primitives for BrightPath CRM Phase 1. 
          When we connect Supabase in Phase 2 & 5, this will trigger the real Lead Creation Form with full PostgreSQL persistence!
        </p>
      </Modal>
    </div>
  );
};
