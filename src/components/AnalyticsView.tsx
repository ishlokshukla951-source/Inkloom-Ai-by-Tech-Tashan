import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Sliders,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ReviewReport, ContentDocument, BrandGuideline } from '../types';

interface AnalyticsViewProps {
  documents: ContentDocument[];
  reports: Record<string, ReviewReport>;
  guidelines: BrandGuideline[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  documents,
  reports,
  guidelines,
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');

  const reportList = Object.values(reports);
  const allIssues = reportList.flatMap((r) => r.issues);

  // Category counts
  const categoryCounts: Record<string, number> = {
    claim: 0,
    terminology: 0,
    disclaimer: 0,
    tone: 0,
    accessibility: 0,
    outdated_fact: 0,
  };
  allIssues.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  const categoryChartData = [
    { name: 'Claims & Guarantees', count: categoryCounts.claim, fill: '#4F46E5' },
    { name: 'Terminology', count: categoryCounts.terminology, fill: '#6366F1' },
    { name: 'Mandatory Disclaimers', count: categoryCounts.disclaimer, fill: '#EC4899' },
    { name: 'Tone & Voice', count: categoryCounts.tone, fill: '#F59E0B' },
    { name: 'Outdated Facts', count: categoryCounts.outdated_fact, fill: '#EF4444' },
    { name: 'Accessibility', count: categoryCounts.accessibility, fill: '#10B981' },
  ].filter((d) => d.count > 0);

  // Severity counts
  const severityData = [
    { name: 'Critical', value: allIssues.filter((i) => i.severity === 'critical').length, color: '#E11D48' },
    { name: 'High', value: allIssues.filter((i) => i.severity === 'high').length, color: '#F59E0B' },
    { name: 'Medium', value: allIssues.filter((i) => i.severity === 'medium').length, color: '#4F46E5' },
    { name: 'Low', value: allIssues.filter((i) => i.severity === 'low').length, color: '#64748B' },
  ].filter((d) => d.value > 0);

  // Reviews over time
  const timelineData = [
    { date: 'Oct 16', reviews: 1, avgScore: 92 },
    { date: 'Oct 18', reviews: 2, avgScore: 84 },
    { date: 'Oct 20', reviews: 4, avgScore: 89 },
    { date: 'Oct 21', reviews: 3, avgScore: 78 },
    { date: 'Oct 22', reviews: documents.length, avgScore: 86 },
  ];

  // Most violated guidelines
  const guidelineViolationsMap: Record<string, number> = {};
  allIssues.forEach((i) => {
    guidelineViolationsMap[i.guidelineReference] = (guidelineViolationsMap[i.guidelineReference] || 0) + 1;
  });
  const sortedViolations = Object.entries(guidelineViolationsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Brand Governance Analytics & Insights
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited aggregate metrics across all organizational reviews, rules, and outcomes
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          {(['30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded font-medium uppercase transition-colors ${
                timeRange === r
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* AI Executive Summary Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Executive Governance Synthesis</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
          Across {documents.length} analyzed documents, the primary governance vulnerability stems from{' '}
          <strong>unsubstantiated claims and absolutist guarantees</strong> (e.g. "100% guarantee" and "zero risk").{' '}
          Outdated corporate statistics (specifically customer counts) represent the second highest recurrent breach.
          Enforcing deterministic pre-flight checks has reduced unapproved promotional statements by 74% prior to executive sign-off.
        </p>
      </div>

      {/* Charts Row 1: Volume Timeline & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Review Timeline */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Review Cadence & Quality Trend</h2>
              <p className="text-xs text-slate-500">Historical document submissions and consistency index</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Reviews Scanned
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Consistency Index
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#10B981"
                  fill="#D1FAE5"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  stroke="#4F46E5"
                  fill="#EEF2FF"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Severity Distribution</h2>
            <p className="text-xs text-slate-500">Findings categorized by operational risk</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            {severityData.length === 0 ? (
              <p className="text-xs text-slate-400">No issues flagged in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {item.value} ({Math.round((item.value / (allIssues.length || 1)) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Issues by Category & Recurring Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issue Categories Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Issues by Policy Category</h2>
            <p className="text-xs text-slate-500">Frequency of flags across brand governance domains</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Recurrent Violations Ranking */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Most Frequently Violated Guidelines</h2>
            <p className="text-xs text-slate-500">Identifies where team training or policy clarity is required</p>
          </div>

          <div className="space-y-3">
            {sortedViolations.length === 0 ? (
              <p className="text-xs text-slate-500">No violations recorded.</p>
            ) : (
              sortedViolations.map(([ruleName, count], idx) => (
                <div key={ruleName} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[220px]" title={ruleName}>
                      {idx + 1}. {ruleName}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {count} {count === 1 ? 'violation' : 'violations'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Recurring in marketing releases and executive drafts.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
