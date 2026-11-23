import React from 'react';
import { Download, Info, Loader2, BarChart3 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { useMetrics } from '../hooks/useMetrics';
import { useToast } from '../hooks/useToast';

export const ReportsPage: React.FC = () => {
  const { kpis, statusDistribution, sourceDistribution, isLoading, error } = useMetrics();
  const { showToast } = useToast();

  const handleExportCsv = () => {
    // Generate CSV content from live metrics
    let csv = 'Report: BrightPath CRM Admissions Pipeline Summary\n\n';
    csv += 'Summary KPIs\n';
    csv += `Total Accessible Leads,${kpis.totalLeads}\n`;
    csv += `New Leads,${kpis.newLeads}\n`;
    csv += `Converted Admissions,${kpis.convertedLeads}\n`;
    csv += `Overdue Follow-ups,${kpis.overdueFollowups}\n`;
    csv += `Conversion Rate,${kpis.conversionRate}%\n\n`;

    csv += 'Pipeline by Stage\n';
    csv += 'Stage,Count,Share Percentage\n';
    for (const item of statusDistribution) {
      csv += `${item.stage},${item.count},${item.percentage}%\n`;
    }

    csv += '\nAcquisition Channels Yield\n';
    csv += 'Channel,Total Enquiries,Converted Admissions,Conversion Yield\n';
    for (const item of sourceDistribution) {
      csv += `${item.source},${item.count},${item.convertedCount},${item.yieldPercentage}%\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brightpath-crm-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Report Exported', 'Admissions CSV summary downloaded successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Admissions & Pipeline Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit conversion performance and lead acquisition channels
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCsv}
          disabled={isLoading || kpis.totalLeads === 0}
        >
          Export CSV Summary
        </Button>
      </div>

      {/* KPI Reconciliation Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <p className="font-semibold">Metric Definition & Reconciliation Standard</p>
          <p className="text-indigo-700/90 mt-0.5">
            Conversion Rate is strictly calculated as <code>(Converted Admissions / Total Accessible Enquiries) * 100</code>.
            All numbers reconcile directly with the underlying PostgreSQL database records under active Row Level Security (RLS).
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton rows={5} />
          <CardSkeleton rows={5} />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {error}
        </div>
      ) : kpis.totalLeads === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No student enquiries recorded yet.</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Add enquiries in the Leads tab to view stage breakdowns and channel conversion yields.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown Table */}
          <Card
            title="Funnel Conversion by Stage"
            subtitle={`${kpis.totalLeads} total enquiries accounted for`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Enquiries</th>
                    <th className="py-2.5 px-3 text-right">Share of Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {statusDistribution.map((row) => (
                    <tr key={row.stage} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {row.stage}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{row.count}</td>
                      <td className="py-3 px-3 text-slate-600 text-right">{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Source Breakdown Table */}
          <Card
            title="Acquisition Channel Yield"
            subtitle="Enquiries and converted students by acquisition source"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Enquiries</th>
                    <th className="py-2.5 px-3">Converted</th>
                    <th className="py-2.5 px-3 text-right">Yield %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sourceDistribution.map((row) => (
                    <tr key={row.source} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{row.source}</td>
                      <td className="py-3 px-3 text-slate-700">{row.count}</td>
                      <td className="py-3 px-3 text-emerald-600 font-bold">{row.convertedCount}</td>
                      <td className="py-3 px-3 text-indigo-600 font-bold text-right">
                        {row.yieldPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
