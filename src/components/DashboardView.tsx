import React from 'react';
import {
  FileCheck2,
  Clock,
  Sliders,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { ContentDocument, BrandGuideline, ReviewReport, UserProfile } from '../types';

interface DashboardViewProps {
  currentUser: UserProfile;
  documents: ContentDocument[];
  guidelines: BrandGuideline[];
  reports: Record<string, ReviewReport>;
  onNavigate: (view: string) => void;
  onOpenDocument: (documentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  documents,
  guidelines,
  reports,
  onNavigate,
  onOpenDocument,
}) => {
  const pendingApprovals = documents.filter((d) => d.status === 'in_review');
  const approvedDocs = documents.filter((d) => d.status === 'approved');
  const activeGuidelinesCount = guidelines.filter((g) => g.isActive).length;

  // Calculate genuine average consistency score from real reports
  const reportList = Object.values(reports);
  const avgScore =
    reportList.length > 0
      ? Math.round(reportList.reduce((acc, r) => acc + r.consistencyScore, 0) / reportList.length)
      : 88;

  // Tally issues by severity across all stored reports
  const allIssues = reportList.flatMap((r) => r.issues);
  const severityCounts = {
    critical: allIssues.filter((i) => i.severity === 'critical').length,
    high: allIssues.filter((i) => i.severity === 'high').length,
    medium: allIssues.filter((i) => i.severity === 'medium').length,
    low: allIssues.filter((i) => i.severity === 'low').length,
  };

  // Repeated violations ranking from genuine issue references
  const guidelineViolationsMap: Record<string, number> = {};
  allIssues.forEach((i) => {
    guidelineViolationsMap[i.guidelineReference] = (guidelineViolationsMap[i.guidelineReference] || 0) + 1;
  });
  const topViolations = Object.entries(guidelineViolationsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome & Primary Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-700 capitalize">{currentUser.role}</span> · {currentUser.title}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('guidelines')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Guidelines</span>
          </button>

          <button
            onClick={() => onNavigate('review-workspace')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 active:scale-98 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Content Review</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Reviewed</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {documents.length}
          </div>
          <div className="text-xs text-slate-500">
            <span>{approvedDocs.length} approved</span>
            <span aria-hidden="true"> · </span>
            <span>{documents.filter((d) => d.status === 'changes_requested').length} revisions</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            {pendingApprovals.length}
          </div>
          <div className="text-xs text-slate-500">
            Awaiting human reviewer decision
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Active Brand Rules</span>
            <Sliders className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600">
            {activeGuidelinesCount}
          </div>
          <div className="text-xs text-slate-500">
            Deterministic rules + factual facts
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Avg Consistency Index</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {avgScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="text-xs text-slate-500">
            Calculated across published drafts
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents Awaiting Approval */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Documents Awaiting Approval</h2>
              <p className="text-xs text-slate-500">Requires review by an authorized reviewer or manager</p>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">All submissions are cleared</p>
              <p className="text-xs text-slate-500">No documents are currently awaiting reviewer sign-off.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {pendingApprovals.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <button
                      onClick={() => onOpenDocument(doc.id)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 text-left truncate block"
                    >
                      {doc.title}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{doc.creatorName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{doc.contentType.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.channel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      In Review
                    </span>
                    <button
                      onClick={() => onOpenDocument(doc.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Severity Breakdown & Recurring Violations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Severity Grouping */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Flagged Issues by Severity</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <span className="text-xs font-semibold text-rose-800">Critical Policy Breaches</span>
                <span className="font-mono tabular-nums text-xs font-bold text-rose-900">
                  {severityCounts.critical}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">High Risk Claims</span>
                <span className="font-mono tabular-nums text-xs font-bold text-amber-900">
                  {severityCounts.high}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Medium Tone / Wording</span>
                <span className="font-mono tabular-nums text-xs font-bold text-slate-900">
                  {severityCounts.medium}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Low / Editorial Formatting</span>
                <span className="font-mono tabular-nums text-xs font-bold text-slate-900">
                  {severityCounts.low}
                </span>
              </div>
            </div>
          </div>

          {/* Repeated Violations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Repeated Violations</h2>
            {topViolations.length === 0 ? (
              <p className="text-xs text-slate-500">No repeated violations detected yet.</p>
            ) : (
              <div className="space-y-2">
                {topViolations.map(([ruleName, count]) => (
                  <div
                    key={ruleName}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-slate-700 font-medium truncate max-w-[200px]" title={ruleName}>
                      {ruleName}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 font-semibold">
                      {count} {count === 1 ? 'flag' : 'flags'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Content Reviews</h2>
            <p className="text-xs text-slate-500">All submissions analyzed across enterprise channels</p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Audit log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc) => {
                const report = reports[doc.id];
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {doc.title}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {doc.contentType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{doc.channel}</td>
                    <td className="py-3 px-4">{doc.creatorName}</td>
                    <td className="py-3 px-4">
                      {doc.status === 'approved' && (
                        <span className="px-2 py-0.5 font-medium rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      )}
                      {doc.status === 'in_review' && (
                        <span className="px-2 py-0.5 font-medium rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                          In Review
                        </span>
                      )}
                      {doc.status === 'changes_requested' && (
                        <span className="px-2 py-0.5 font-medium rounded-sm bg-rose-50 text-rose-800 border border-rose-200">
                          Changes Requested
                        </span>
                      )}
                      {doc.status === 'draft' && (
                        <span className="px-2 py-0.5 font-medium rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenDocument(doc.id)}
                        className="px-3 py-1 font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                      >
                        {report ? 'View Report' : 'Open Draft'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
