import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  Sliders,
  RotateCcw,
  Send,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  X,
  Flag,
  Copy,
  ChevronDown,
} from 'lucide-react';
import {
  ContentDocument,
  ReviewReport,
  ReviewIssue,
  UserProfile,
  IssueSeverity,
  GuidelineCategory,
} from '../types';

interface ReviewResultsViewProps {
  document: ContentDocument;
  report: ReviewReport;
  currentUser: UserProfile;
  onApplySuggestion: (issueId: string) => void;
  onDismissIssue: (issueId: string, reason: string) => void;
  onRestoreOriginal: () => void;
  onSubmitForApproval: (reviewerId?: string) => void;
  onNavigateToWorkspace: () => void;
  teamMembers: UserProfile[];
}

export const ReviewResultsView: React.FC<ReviewResultsViewProps> = ({
  document,
  report,
  currentUser,
  onApplySuggestion,
  onDismissIssue,
  onRestoreOriginal,
  onSubmitForApproval,
  onNavigateToWorkspace,
  teamMembers,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | IssueSeverity>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    report.issues[0]?.id || null
  );
  const [activeViewMode, setActiveViewMode] = useState<'annotated' | 'diff' | 'clean'>('annotated');
  const [dismissReasonModal, setDismissReasonModal] = useState<string | null>(null);
  const [dismissReasonInput, setDismissReasonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState(
    teamMembers.find((m) => m.role === 'reviewer')?.id || teamMembers[1].id
  );

  const openIssues = report.issues.filter((i) => i.status === 'open');
  const acceptedIssues = report.issues.filter((i) => i.status === 'accepted');
  const dismissedIssues = report.issues.filter((i) => i.status === 'dismissed');

  const filteredIssues = report.issues.filter((issue) => {
    if (severityFilter === 'all') return true;
    return issue.severity === severityFilter;
  });

  const criticalCount = report.issues.filter((i) => i.severity === 'critical' && i.status === 'open').length;
  const highCount = report.issues.filter((i) => i.severity === 'high' && i.status === 'open').length;

  const reviewStatusBadge =
    criticalCount > 0
      ? { text: 'Critical Review Required', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
      : highCount > 0
      ? { text: 'Changes Recommended', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
      : openIssues.length === 0
      ? { text: 'Ready for Human Approval', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
      : { text: 'Minor Items to Verify', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };

  const handleCopy = () => {
    navigator.clipboard.writeText(document.currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDismiss = () => {
    if (dismissReasonModal && dismissReasonInput.trim()) {
      onDismissIssue(dismissReasonModal, dismissReasonInput.trim());
      setDismissReasonModal(null);
      setDismissReasonInput('');
    }
  };

  // Render annotated text with interactive highlights
  const renderAnnotatedText = () => {
    const text = document.currentText;
    const issuesWithSpans = report.issues
      .filter((i) => i.status === 'open' && i.evidence && text.includes(i.evidence))
      .sort((a, b) => (text.indexOf(a.evidence) > text.indexOf(b.evidence) ? 1 : -1));

    if (issuesWithSpans.length === 0) {
      return <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">{text}</div>;
    }

    // Split text around matched evidences
    let lastIndex = 0;
    const segments: React.ReactNode[] = [];

    issuesWithSpans.forEach((issue, idx) => {
      const matchIndex = text.indexOf(issue.evidence, lastIndex);
      if (matchIndex === -1) return;

      // Plain text before match
      if (matchIndex > lastIndex) {
        segments.push(
          <span key={`plain-${idx}`}>{text.substring(lastIndex, matchIndex)}</span>
        );
      }

      // Highlighted span
      const isSelected = selectedIssueId === issue.id;
      const severityColor =
        issue.severity === 'critical'
          ? 'bg-rose-100 text-rose-900 border-b-2 border-rose-600'
          : issue.severity === 'high'
          ? 'bg-amber-100 text-amber-900 border-b-2 border-amber-500'
          : 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-400';

      segments.push(
        <button
          key={`issue-${issue.id}-${idx}`}
          type="button"
          onClick={() => setSelectedIssueId(issue.id)}
          className={`cursor-pointer px-1 py-0.5 rounded-xs transition-all ${severityColor} ${
            isSelected ? 'ring-2 ring-indigo-600 font-semibold' : 'hover:opacity-80'
          }`}
          title={`${issue.guidelineReference} (${issue.severity})`}
        >
          {issue.evidence}
        </button>
      );

      lastIndex = matchIndex + issue.evidence.length;
    });

    if (lastIndex < text.length) {
      segments.push(<span key="tail">{text.substring(lastIndex)}</span>);
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
        {segments}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">Review Report #{report.id.slice(-6)}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{document.contentType.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>{document.channel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Engine: {report.engineMode}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {document.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied Text!' : 'Copy Content'}</span>
            </button>

            <button
              onClick={onRestoreOriginal}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Original</span>
            </button>

            {document.status !== 'approved' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedReviewerId}
                  onChange={(e) => setSelectedReviewerId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none"
                  title="Assign designated reviewer"
                >
                  {teamMembers
                    .filter((m) => m.role === 'reviewer' || m.role === 'administrator')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        Assign to: {m.name} ({m.role})
                      </option>
                    ))}
                </select>

                <button
                  onClick={() => onSubmitForApproval(selectedReviewerId)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Summary Banner */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-md border ${reviewStatusBadge.bg}`}
            >
              {reviewStatusBadge.text}
            </span>
            <p className="text-xs text-slate-600 max-w-xl">{report.summary}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Score:</span>
              <span className="font-bold text-slate-900">{report.consistencyScore}/100</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Total Findings:</span>
              <span className="font-bold text-slate-900">{report.issues.length}</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold">{acceptedIssues.length} accepted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Content Viewer & Diff */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* View Mode Segmented Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-md text-xs">
              <button
                onClick={() => setActiveViewMode('annotated')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeViewMode === 'annotated'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annotated Document
              </button>
              <button
                onClick={() => setActiveViewMode('diff')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeViewMode === 'diff'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Before & After Diff
              </button>
              <button
                onClick={() => setActiveViewMode('clean')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeViewMode === 'clean'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clean Preview
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono tabular-nums">
              Revision #{document.revisionsCount}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 min-h-[440px] max-h-[640px] overflow-y-auto">
            {activeViewMode === 'annotated' && renderAnnotatedText()}

            {activeViewMode === 'diff' && (
              <div className="space-y-6 text-xs">
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Original Submitted Text
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">
                    {document.originalText}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-indigo-700 uppercase tracking-wider mb-2">
                    Current Working Revision (Suggestions Applied)
                  </h4>
                  <div className="p-4 bg-indigo-50/40 rounded-lg border border-indigo-200 text-slate-900 whitespace-pre-wrap leading-relaxed font-sans">
                    {document.currentText}
                  </div>
                </div>
              </div>
            )}

            {activeViewMode === 'clean' && (
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-900">
                {document.currentText}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Issues & Suggestions Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Detected Issues ({filteredIssues.length})</span>
              <span className="text-slate-500">Click highlighted text or cards</span>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium ${
                    severityFilter === sev
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              const isAccepted = issue.status === 'accepted';
              const isDismissed = issue.status === 'dismissed';

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${isAccepted ? 'opacity-70 bg-slate-50/50' : ''}`}
                >
                  {/* Issue Meta */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          issue.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : issue.severity === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-slate-500 capitalize">{issue.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {issue.source === 'rule_engine' ? 'Deterministic Rule' : 'Gemini AI'}
                      </span>
                    </div>

                    {isAccepted && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        Applied
                      </span>
                    )}

                    {isDismissed && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Dismissed
                      </span>
                    )}
                  </div>

                  {/* Flagged Excerpt */}
                  <div className="mb-2 text-xs">
                    <span className="text-slate-500">Flagged excerpt: </span>
                    <span className="font-semibold text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded">
                      "{issue.evidence}"
                    </span>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {issue.explanation}
                  </p>

                  {/* Guideline reference */}
                  <div className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Guideline:</span>
                    <span>{issue.guidelineReference}</span>
                  </div>

                  {/* Proposed Correction */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 mb-3 text-xs">
                    <span className="block font-semibold text-emerald-900 mb-0.5">
                      Recommended Alternative:
                    </span>
                    <span className="text-emerald-800 font-medium">"{issue.suggestion}"</span>
                  </div>

                  {/* Issue Action Controls */}
                  {issue.status === 'open' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDismissReasonModal(issue.id);
                        }}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      >
                        Dismiss
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplySuggestion(issue.id);
                        }}
                        className="px-3 py-1 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-2xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Suggestion</span>
                      </button>
                    </div>
                  )}

                  {isDismissed && issue.dismissalReason && (
                    <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                      Rationale: "{issue.dismissalReason}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dismiss Reason Modal */}
      {dismissReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Dismiss Governance Finding</h3>
            <p className="text-xs text-slate-600">
              Please document why this finding does not require correction. This will be preserved in the compliance audit trail.
            </p>
            <textarea
              rows={3}
              value={dismissReasonInput}
              onChange={(e) => setDismissReasonInput(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600"
              placeholder="e.g. Approved by legal counsel in contract appendix B; exception permitted."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDismissReasonModal(null);
                  setDismissReasonInput('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDismiss}
                disabled={!dismissReasonInput.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
