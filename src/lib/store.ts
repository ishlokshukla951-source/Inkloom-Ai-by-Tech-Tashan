/**
 * Inkloom AI — State Management & Persistent Repository
 * Handles organization data, guidelines, reviews, approvals, and audit trails.
 */

import { useState, useEffect } from 'react';
import {
  Organisation,
  UserProfile,
  BrandGuideline,
  ApprovedFact,
  BrandAsset,
  ContentDocument,
  ContentRevision,
  ReviewReport,
  ReviewIssue,
  ApprovalRecord,
  ReviewComment,
  AuditLogEntry,
} from '../types';
import {
  CURRENT_ORG,
  TEAM_MEMBERS,
  INITIAL_GUIDELINES,
  INITIAL_APPROVED_FACTS,
  INITIAL_BRAND_ASSETS,
  SAMPLE_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_APPROVALS,
  INITIAL_COMMENTS,
  INITIAL_REPORTS,
} from './mockData';
import { runDeterministicRuleEngine, applySuggestionToContent } from './ruleEngine';

const STORAGE_KEY_PREFIX = 'inkloom_store_v1_';

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return defaultValue;
}

function saveStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useInkloomStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadStored('current_user', TEAM_MEMBERS[0])
  );
  const [org, setOrg] = useState<Organisation>(() =>
    loadStored('org', CURRENT_ORG)
  );
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>(() =>
    loadStored('guidelines', INITIAL_GUIDELINES)
  );
  const [approvedFacts, setApprovedFacts] = useState<ApprovedFact[]>(() =>
    loadStored('approved_facts', INITIAL_APPROVED_FACTS)
  );
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>(() =>
    loadStored('brand_assets', INITIAL_BRAND_ASSETS)
  );
  const [documents, setDocuments] = useState<ContentDocument[]>(() =>
    loadStored('documents', SAMPLE_DOCUMENTS)
  );
  const [reports, setReports] = useState<Record<string, ReviewReport>>(() =>
    loadStored('reports', INITIAL_REPORTS)
  );
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(() =>
    loadStored('approvals', INITIAL_APPROVALS)
  );
  const [comments, setComments] = useState<ReviewComment[]>(() =>
    loadStored('comments', INITIAL_COMMENTS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadStored('audit_logs', INITIAL_AUDIT_LOGS)
  );

  // Sync to localStorage
  useEffect(() => saveStored('current_user', currentUser), [currentUser]);
  useEffect(() => saveStored('org', org), [org]);
  useEffect(() => saveStored('guidelines', guidelines), [guidelines]);
  useEffect(() => saveStored('approved_facts', approvedFacts), [approvedFacts]);
  useEffect(() => saveStored('brand_assets', brandAssets), [brandAssets]);
  useEffect(() => saveStored('documents', documents), [documents]);
  useEffect(() => saveStored('reports', reports), [reports]);
  useEffect(() => saveStored('approvals', approvals), [approvals]);
  useEffect(() => saveStored('comments', comments), [comments]);
  useEffect(() => saveStored('audit_logs', auditLogs), [auditLogs]);

  // Log an immutable audit entry
  const logAudit = (action: string, targetType: string, targetId: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orgId: org.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Switch active user
  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    logAudit('USER_SESSION_SWITCHED', 'user_profile', user.id, `Switched active session to ${user.name} (${user.role})`);
  };

  // Guideline operations
  const addGuideline = (newGuideline: Omit<BrandGuideline, 'id' | 'orgId' | 'lastUpdated'>) => {
    const created: BrandGuideline = {
      ...newGuideline,
      id: `bg-${Date.now()}`,
      orgId: org.id,
      lastUpdated: new Date().toISOString(),
    };
    setGuidelines((prev) => [created, ...prev]);
    logAudit('GUIDELINE_CREATED', 'brand_guideline', created.id, `Created guideline "${created.name}" with severity ${created.severity.toUpperCase()}`);
    return created;
  };

  const updateGuideline = (id: string, updates: Partial<BrandGuideline>) => {
    setGuidelines((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, lastUpdated: new Date().toISOString() } : g))
    );
    logAudit('GUIDELINE_UPDATED', 'brand_guideline', id, `Updated guideline settings`);
  };

  const toggleGuideline = (id: string) => {
    setGuidelines((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newState = !g.isActive;
          logAudit(
            newState ? 'GUIDELINE_ACTIVATED' : 'GUIDELINE_DEACTIVATED',
            'brand_guideline',
            id,
            `${newState ? 'Activated' : 'Deactivated'} guideline "${g.name}"`
          );
          return { ...g, isActive: newState, lastUpdated: new Date().toISOString() };
        }
        return g;
      })
    );
  };

  // Approved Fact operations
  const addApprovedFact = (fact: Omit<ApprovedFact, 'id' | 'orgId' | 'verifiedAt' | 'verifiedBy'>) => {
    const created: ApprovedFact = {
      ...fact,
      id: `af-${Date.now()}`,
      orgId: org.id,
      verifiedAt: new Date().toISOString(),
      verifiedBy: currentUser.name,
    };
    setApprovedFacts((prev) => [created, ...prev]);
    logAudit('APPROVED_FACT_ADDED', 'approved_fact', created.id, `Added verified fact for topic "${created.topic}"`);
    return created;
  };

  // Brand Asset operations
  const addBrandAsset = (asset: Omit<BrandAsset, 'id' | 'orgId'>) => {
    const created: BrandAsset = {
      ...asset,
      id: `ba-${Date.now()}`,
      orgId: org.id,
    };
    setBrandAssets((prev) => [created, ...prev]);
    logAudit('BRAND_ASSET_ADDED', 'brand_asset', created.id, `Added brand visual asset "${created.name}"`);
    return created;
  };

  // Document operations
  const createDocument = (doc: {
    title: string;
    contentType: ContentDocument['contentType'];
    channel: string;
    text: string;
  }): ContentDocument => {
    const newDoc: ContentDocument = {
      id: `doc-${Date.now()}`,
      orgId: org.id,
      title: doc.title || 'Untitled Document',
      contentType: doc.contentType,
      channel: doc.channel,
      originalText: doc.text,
      currentText: doc.text,
      status: 'draft',
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionsCount: 1,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logAudit('DOCUMENT_CREATED', 'content_document', newDoc.id, `Created draft "${newDoc.title}" for channel ${newDoc.channel}`);
    return newDoc;
  };

  const updateDocumentText = (documentId: string, text: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === documentId ? { ...d, currentText: text, updatedAt: new Date().toISOString() } : d))
    );
  };

  // Execute Analysis Pipeline
  const runAnalysis = async (
    documentId: string,
    onProgress?: (stage: number, stageName: string) => void,
    overrideDoc?: ContentDocument
  ): Promise<ReviewReport> => {
    const doc = overrideDoc || documents.find((d) => d.id === documentId);
    if (!doc) throw new Error('Document not found');

    const startTime = Date.now();

    // Stage 1: Validating submitted content
    onProgress?.(1, 'Validating submitted content format & structure...');
    await new Promise((r) => setTimeout(r, 200));

    // Stage 2: Checking deterministic rules
    onProgress?.(2, 'Executing deterministic regex and terminology scan...');
    const deterministicResult = runDeterministicRuleEngine(doc.currentText, guidelines, approvedFacts);
    await new Promise((r) => setTimeout(r, 250));

    // Stage 3: Semantic AI analysis
    onProgress?.(3, 'Evaluating semantic tone, unverified puffery, and brand voice...');
    let semanticIssues: ReviewIssue[] = [];
    let engineMode: 'hybrid' | 'deterministic_only' = 'deterministic_only';

    try {
      const response = await fetch('/api/v1/reviews/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          title: doc.title,
          contentType: doc.contentType,
          channel: doc.channel,
          text: doc.currentText,
          brandVoice: 'Authoritative, grounded, precision-engineered, trustworthy',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.semanticIssues)) {
          semanticIssues = data.semanticIssues;
          engineMode = 'hybrid';
        }
      }
    } catch {
      // Graceful fallback to deterministic rule engine
      engineMode = 'deterministic_only';
    }

    // Stage 4: Preparing explanations and suggestions
    onProgress?.(4, 'Synthesizing explanations and generating structured suggestions...');
    await new Promise((r) => setTimeout(r, 200));

    // Combine issues with duplicate evidence deduplication
    const allIssues = [...deterministicResult.issues];
    for (const semIssue of semanticIssues) {
      const exists = allIssues.some(
        (i) => i.evidence.toLowerCase() === semIssue.evidence.toLowerCase() || i.suggestion === semIssue.suggestion
      );
      if (!exists) {
        allIssues.push(semIssue);
      }
    }

    // Stage 5: Final review report
    onProgress?.(5, 'Compiling audit report and consistency indices...');
    await new Promise((r) => setTimeout(r, 150));

    const report: ReviewReport = {
      id: `rep-${Date.now()}`,
      documentId,
      status: 'completed',
      summary:
        allIssues.length === 0
          ? 'Content is completely compliant with all verified brand guidelines and factual registers.'
          : `Identified ${allIssues.length} potential brand governance discrepancies across tone, terminology, and claim substantiation. Human review advised before final publishing.`,
      consistencyScore: deterministicResult.consistencyScore,
      issues: allIssues,
      timestamp: new Date().toISOString(),
      executionDurationMs: Date.now() - startTime,
      engineMode,
      applicableGuidelinesCount: guidelines.filter((g) => g.isActive).length,
    };

    setReports((prev) => ({ ...prev, [documentId]: report }));

    // Update document status if still draft
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === documentId) {
          const nextStatus = allIssues.length > 0 ? 'changes_requested' : 'in_review';
          return { ...d, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return d;
      })
    );

    logAudit(
      'REVIEW_PIPELINE_EXECUTED',
      'content_document',
      documentId,
      `Ran governance analysis: ${allIssues.length} issues identified (${engineMode} mode, score: ${report.consistencyScore}/100)`
    );

    return report;
  };

  // Apply suggestion
  const applySuggestion = (documentId: string, issueId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    const report = reports[documentId];
    if (!doc || !report) return;

    const issue = report.issues.find((i) => i.id === issueId);
    if (!issue) return;

    const { updatedText, applied } = applySuggestionToContent(doc.currentText, issue);
    if (!applied) return;

    // Update document
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              currentText: updatedText,
              revisionsCount: d.revisionsCount + 1,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    // Mark issue as accepted
    setReports((prev) => ({
      ...prev,
      [documentId]: {
        ...report,
        issues: report.issues.map((i) => (i.id === issueId ? { ...i, status: 'accepted' as const } : i)),
      },
    }));

    logAudit(
      'SUGGESTION_APPLIED',
      'content_document',
      documentId,
      `Applied suggestion: "${issue.suggestion}" replacing "${issue.evidence}"`
    );
  };

  // Dismiss issue with reason
  const dismissIssue = (documentId: string, issueId: string, reason: string) => {
    const report = reports[documentId];
    if (!report) return;

    setReports((prev) => ({
      ...prev,
      [documentId]: {
        ...report,
        issues: report.issues.map((i) =>
          i.id === issueId ? { ...i, status: 'dismissed' as const, dismissalReason: reason } : i
        ),
      },
    }));

    logAudit(
      'ISSUE_DISMISSED',
      'review_issue',
      issueId,
      `Dismissed issue with rationale: "${reason}" by ${currentUser.name}`
    );
  };

  // Restore original document text
  const restoreOriginal = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return;

    setDocuments((prev) =>
      prev.map((d) => (d.id === documentId ? { ...d, currentText: d.originalText, updatedAt: new Date().toISOString() } : d))
    );

    logAudit('DOCUMENT_RESTORED_TO_ORIGINAL', 'content_document', documentId, `Restored content to original submission`);
  };

  // Submit for approval
  const submitForApproval = (documentId: string, reviewerId?: string) => {
    const reviewer = TEAM_MEMBERS.find((u) => u.id === reviewerId) || TEAM_MEMBERS[1]; // default Marcus
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              status: 'in_review',
              assignedReviewerId: reviewer.id,
              assignedReviewerName: reviewer.name,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    logAudit(
      'DOCUMENT_SUBMITTED_FOR_REVIEW',
      'content_document',
      documentId,
      `Submitted for review, assigned to ${reviewer.name} (${reviewer.role})`
    );
  };

  // Reviewer Decision (Approval, Changes Requested, Rejected)
  const submitReviewDecision = (
    documentId: string,
    decision: 'approved' | 'changes_requested' | 'rejected',
    notes: string
  ) => {
    // Only reviewers, managers, or admins can approve
    if (currentUser.role === 'creator') {
      throw new Error('Creators do not possess approval authorization.');
    }

    const record: ApprovalRecord = {
      id: `app-${Date.now()}`,
      documentId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.role,
      decision,
      notes,
      timestamp: new Date().toISOString(),
    };

    setApprovals((prev) => [record, ...prev]);

    const newStatus =
      decision === 'approved'
        ? 'approved'
        : decision === 'changes_requested'
        ? 'changes_requested'
        : 'rejected';

    setDocuments((prev) =>
      prev.map((d) => (d.id === documentId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d))
    );

    logAudit(
      decision === 'approved' ? 'CONTENT_APPROVED' : 'REVIEW_DECISION_RECORDED',
      'content_document',
      documentId,
      `Reviewer decision "${decision.toUpperCase()}" registered by ${currentUser.name}: ${notes}`
    );

    return record;
  };

  // Comments
  const addComment = (documentId: string, content: string) => {
    const comment: ReviewComment = {
      id: `cm-${Date.now()}`,
      documentId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, comment]);
    logAudit('COMMENT_POSTED', 'content_document', documentId, `Comment posted by ${currentUser.name}`);
    return comment;
  };

  // Reset to initial demo state
  const resetToDemo = () => {
    setCurrentUser(TEAM_MEMBERS[0]);
    setOrg(CURRENT_ORG);
    setGuidelines(INITIAL_GUIDELINES);
    setApprovedFacts(INITIAL_APPROVED_FACTS);
    setBrandAssets(INITIAL_BRAND_ASSETS);
    setDocuments(SAMPLE_DOCUMENTS);
    setReports(INITIAL_REPORTS);
    setApprovals(INITIAL_APPROVALS);
    setComments(INITIAL_COMMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return {
    currentUser,
    switchUser,
    teamMembers: TEAM_MEMBERS,
    org,
    setOrg,
    guidelines,
    addGuideline,
    updateGuideline,
    toggleGuideline,
    approvedFacts,
    addApprovedFact,
    brandAssets,
    addBrandAsset,
    documents,
    createDocument,
    updateDocumentText,
    reports,
    runAnalysis,
    applySuggestion,
    dismissIssue,
    restoreOriginal,
    submitForApproval,
    submitReviewDecision,
    approvals,
    comments,
    addComment,
    auditLogs,
    resetToDemo,
  };
}
