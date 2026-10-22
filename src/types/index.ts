/**
 * Inkloom AI — Core Data Contracts & Schema Types
 */

export type UserRole = 'administrator' | 'manager' | 'reviewer' | 'creator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title: string;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  industry: string;
  channels: string[];
  createdAt: string;
  plan: 'enterprise' | 'growth' | 'team';
}

export type GuidelineCategory =
  | 'tone'
  | 'terminology'
  | 'claim'
  | 'disclaimer'
  | 'accessibility'
  | 'outdated_fact';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type RuleType =
  | 'prohibited_phrase'
  | 'preferred_phrase'
  | 'mandatory_disclaimer'
  | 'unsupported_claim'
  | 'voice_tone'
  | 'outdated_fact';

export interface BrandGuideline {
  id: string;
  orgId: string;
  category: GuidelineCategory;
  name: string;
  description: string;
  ruleType: RuleType;
  pattern: string; // regex or keyword
  replacement?: string;
  severity: IssueSeverity;
  isActive: boolean;
  examples: string[];
  explanation: string;
  lastUpdated: string;
}

export interface ApprovedFact {
  id: string;
  orgId: string;
  topic: string;
  claimKey: string;
  verifiedStatement: string;
  sourceDoc: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface BrandAsset {
  id: string;
  orgId: string;
  name: string;
  category: 'logo' | 'color_palette' | 'typography' | 'imagery';
  specification: string;
  approvedUsage: string;
  status: 'active' | 'deprecated';
}

export type ReviewStatus = 'draft' | 'in_review' | 'changes_requested' | 'resubmitted' | 'approved' | 'rejected';

export interface ReviewIssue {
  id: string;
  reviewId?: string;
  category: GuidelineCategory;
  severity: IssueSeverity;
  source: 'rule_engine' | 'ai_semantic';
  evidence: string;
  startIndex?: number;
  endIndex?: number;
  explanation: string;
  guidelineReference: string;
  suggestion: string;
  confidence: number | null;
  requiresHumanReview: boolean;
  status: 'open' | 'accepted' | 'dismissed' | 'flagged';
  dismissalReason?: string;
}

export interface ContentDocument {
  id: string;
  orgId: string;
  title: string;
  contentType: 'blog_post' | 'social_media' | 'press_release' | 'ad_copy' | 'email_newsletter' | 'product_doc';
  channel: string;
  originalText: string;
  currentText: string;
  status: ReviewStatus;
  createdBy: string;
  creatorName: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  createdAt: string;
  updatedAt: string;
  revisionsCount: number;
}

export interface ContentRevision {
  id: string;
  documentId: string;
  revisionNumber: number;
  text: string;
  changedBy: string;
  changedByName: string;
  changeSummary: string;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  documentId: string;
  status: 'completed' | 'failed';
  summary: string;
  consistencyScore: number; // 0-100 calculated deterministically
  issues: ReviewIssue[];
  timestamp: string;
  executionDurationMs: number;
  engineMode: 'hybrid' | 'deterministic_only';
  applicableGuidelinesCount: number;
}

export interface ApprovalRecord {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  decision: 'approved' | 'changes_requested' | 'rejected';
  notes: string;
  timestamp: string;
}

export interface ReviewComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  orgId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
