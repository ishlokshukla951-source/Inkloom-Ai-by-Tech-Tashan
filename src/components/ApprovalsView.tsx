import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Send,
  UserCheck,
  ShieldCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  ContentDocument,
  UserProfile,
  ApprovalRecord,
  ReviewComment,
  ReviewStatus,
} from '../types';

interface ApprovalsViewProps {
  currentUser: UserProfile;
  documents: ContentDocument[];
  approvals: ApprovalRecord[];
  comments: ReviewComment[];
  onSubmitDecision: (
    documentId: string,
    decision: 'approved' | 'changes_requested' | 'rejected',
    notes: string
  ) => void;
  onAddComment: (documentId: string, content: string) => void;
  onOpenDocument: (documentId: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  currentUser,
  documents,
  approvals,
  comments,
  onSubmitDecision,
  onAddComment,
  onOpenDocument,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_review' | 'changes_requested' | 'approved'>('in_review');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.find((d) => d.status === 'in_review')?.id || documents[0]?.id || null
  );
  const [decisionNotes, setDecisionNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [decisionType, setDecisionType] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');

  const filteredDocs = documents.filter((d) => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || filteredDocs[0];
  const docComments = comments.filter((c) => c.documentId === selectedDoc?.id);
  const docApprovals = approvals.filter((a) => a.documentId === selectedDoc?.id);

  const canApprove =
    currentUser.role === 'administrator' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'reviewer';

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!canApprove) {
      alert('Only Reviewers, Managers, or Administrators have authorization to register decisions.');
      return;
    }

    onSubmitDecision(selectedDoc.id, decisionType, decisionNotes || 'Standard review completed.');
    setDecisionNotes('');
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !newComment.trim()) return;

    onAddComment(selectedDoc.id, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Review & Approval Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop authorization gate · Role-based permissions enforced
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          {(['in_review', 'changes_requested', 'approved', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Submissions Queue ({filteredDocs.length})
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No submissions in this status category.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">
                        {doc.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                          doc.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'in_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{doc.creatorName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{doc.contentType.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Submission Details, Content & Decision Panel */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDoc ? (
            <>
              {/* Document Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>Submitted by {selectedDoc.creatorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Target: {selectedDoc.channel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Revisions: {selectedDoc.revisionsCount}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedDoc.title}</h2>
                  </div>

                  <button
                    onClick={() => onOpenDocument(selectedDoc.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                  >
                    Open Full Review Report
                  </button>
                </div>

                {/* Content Excerpt */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-sans">
                  {selectedDoc.currentText}
                </div>
              </div>

              {/* Reviewer Authorization Form */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Reviewer Action & Formal Sign-Off</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Acting as: <strong className="text-slate-800 capitalize">{currentUser.role}</strong>
                  </span>
                </div>

                {!canApprove ? (
                  <div className="p-4 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200">
                    Your current role is <strong className="capitalize">{currentUser.role}</strong>. Only users with the <strong>Reviewer</strong>, <strong>Manager</strong>, or <strong>Administrator</strong> role can register sign-offs. You can switch roles from the top-right profile switcher.
                  </div>
                ) : (
                  <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Select Decision
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setDecisionType('approved')}
                          className={`p-2.5 rounded-lg border text-center transition-all font-semibold flex items-center justify-center gap-1.5 ${
                            decisionType === 'approved'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Approve Content</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDecisionType('changes_requested')}
                          className={`p-2.5 rounded-lg border text-center transition-all font-semibold flex items-center justify-center gap-1.5 ${
                            decisionType === 'changes_requested'
                              ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Request Changes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDecisionType('rejected')}
                          className={`p-2.5 rounded-lg border text-center transition-all font-semibold flex items-center justify-center gap-1.5 ${
                            decisionType === 'rejected'
                              ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Reject Submission</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Reviewer Decision Notes / Guidance
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Document your review rationale (e.g. verified 100% guarantee replacement and audited customer statistics)..."
                        className="w-full p-2.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Register Decision in Audit Trail</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Prior Decisions List */}
                {docApprovals.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700">Audit History of Decisions</h4>
                    <div className="space-y-2">
                      {docApprovals.map((app) => (
                        <div
                          key={app.id}
                          className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">
                              {app.reviewerName} ({app.reviewerRole})
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {new Date(app.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-600 italic">"{app.notes}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Collaborative Comments Thread */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Reviewer Collaboration & Feedback</span>
                </h3>

                <div className="space-y-3">
                  {docComments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No comments posted yet.</p>
                  ) : (
                    docComments.map((cm) => (
                      <div key={cm.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">
                            {cm.userName}{' '}
                            <span className="font-normal text-slate-500 capitalize">({cm.userRole})</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {new Date(cm.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{cm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handlePostComment} className="flex gap-2 text-xs pt-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment or question for the reviewer..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Select a submission from the left queue to inspect and review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
