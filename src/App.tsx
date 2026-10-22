/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useInkloomStore } from './lib/store';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { ReviewWorkspaceView } from './components/ReviewWorkspaceView';
import { ReviewResultsView } from './components/ReviewResultsView';
import { BrandGuidelinesView } from './components/BrandGuidelinesView';
import { ApprovalsView } from './components/ApprovalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AuditTrailView } from './components/AuditTrailView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { BrandAssetStudioView } from './components/BrandAssetStudioView';
import { ThreeBrandSceneView } from './components/ThreeBrandSceneView';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const store = useInkloomStore();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string>(
    store.documents[0]?.id || 'doc-001'
  );
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const pendingApprovalsCount = store.documents.filter(
    (d) => d.status === 'in_review'
  ).length;

  const handleNavigate = (view: string) => {
    if (view === 'monolith-3d') {
      setIsChatOpen(false);
    }
    setCurrentView(view);
  };

  const handleOpenDocument = (documentId: string) => {
    setSelectedDocId(documentId);
    // If a report already exists, open results; else open in results or workspace
    setCurrentView('review-results');
  };

  const handleNavigateToResults = (documentId: string) => {
    setSelectedDocId(documentId);
    setCurrentView('review-results');
  };

  const selectedDocument =
    store.documents.find((d) => d.id === selectedDocId) || store.documents[0];

  // If report doesn't exist yet for selected doc, create a fallback on-the-fly report
  const selectedReport = store.reports[selectedDocId] || {
    id: `rep-initial-${selectedDocId}`,
    documentId: selectedDocId,
    status: 'completed',
    summary:
      'Deterministic pre-flight evaluation loaded. Identified potential policy discrepancies across claims and customer facts.',
    consistencyScore: 78,
    issues: [
      {
        id: 'det-bg-1-100guarantee',
        category: 'claim',
        severity: 'critical',
        source: 'rule_engine',
        evidence: '100% guarantee',
        explanation: 'Absolute guarantees breach legal warranties and SEC marketing compliance standards.',
        guidelineReference: 'Prohibit Absolutist Guarantees',
        suggestion: 'proven track record',
        confidence: 1.0,
        requiresHumanReview: true,
        status: 'open',
      },
      {
        id: 'det-bg-2-zerorisk',
        category: 'claim',
        severity: 'high',
        source: 'rule_engine',
        evidence: 'zero risk',
        explanation: 'Cloud infrastructure inherently involves operational risk factors.',
        guidelineReference: 'Prohibit "Zero Risk" Terminology',
        suggestion: 'managed risk framework',
        confidence: 1.0,
        requiresHumanReview: true,
        status: 'open',
      },
      {
        id: 'det-bg-3-users',
        category: 'terminology',
        severity: 'medium',
        source: 'rule_engine',
        evidence: 'users',
        explanation: 'Our brand identity emphasizes human partnership and collaboration over transactional usage.',
        guidelineReference: 'Preferred Customer Collaboration Term',
        suggestion: 'collaborators',
        confidence: 1.0,
        requiresHumanReview: false,
        status: 'open',
      },
      {
        id: 'det-fact-af-1-500cust',
        category: 'outdated_fact',
        severity: 'high',
        source: 'rule_engine',
        evidence: '500 enterprise customers',
        explanation: 'Reference to 500 customers conflicts with verified organizational fact: "Over 1,400 enterprise organizations worldwide" (Q3 2026 Report).',
        guidelineReference: 'Verified Fact: Customer Scale',
        suggestion: 'Over 1,400 enterprise organizations worldwide',
        confidence: 1.0,
        requiresHumanReview: true,
        status: 'open',
      },
      {
        id: 'det-bg-5-roi',
        category: 'disclaimer',
        severity: 'high',
        source: 'rule_engine',
        evidence: '350% ROI',
        explanation: 'Promotional performance claims require factual qualification under advertising truth standards.',
        guidelineReference: 'Mandatory ROI Performance Disclaimer',
        suggestion: 'Past deployment performance does not guarantee future operational yield. Figures based on audited customer case studies.',
        confidence: 1.0,
        requiresHumanReview: true,
        status: 'open',
      },
    ],
    timestamp: new Date().toISOString(),
    executionDurationMs: 340,
    engineMode: 'hybrid',
    applicableGuidelinesCount: store.guidelines.filter((g) => g.isActive).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={store.currentUser}
        teamMembers={store.teamMembers}
        onSwitchUser={store.switchUser}
        org={store.org}
        pendingApprovalsCount={pendingApprovalsCount}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onEnterApp={() => setCurrentView('dashboard')}
            onOpenDemoReview={() => {
              setSelectedDocId('doc-001');
              setCurrentView('review-results');
            }}
            onStartOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={store.currentUser}
            documents={store.documents}
            guidelines={store.guidelines}
            reports={store.reports}
            onNavigate={setCurrentView}
            onOpenDocument={handleOpenDocument}
          />
        )}

        {currentView === 'review-workspace' && (
          <ReviewWorkspaceView
            currentOrg={store.org}
            onSaveDraft={store.createDocument}
            onRunAnalysis={store.runAnalysis}
            onNavigateToResults={handleNavigateToResults}
          />
        )}

        {currentView === 'review-results' && selectedDocument && (
          <ReviewResultsView
            document={selectedDocument}
            report={selectedReport}
            currentUser={store.currentUser}
            onApplySuggestion={(issueId) =>
              store.applySuggestion(selectedDocument.id, issueId)
            }
            onDismissIssue={(issueId, reason) =>
              store.dismissIssue(selectedDocument.id, issueId, reason)
            }
            onRestoreOriginal={() =>
              store.restoreOriginal(selectedDocument.id)
            }
            onSubmitForApproval={(reviewerId) => {
              store.submitForApproval(selectedDocument.id, reviewerId);
              setCurrentView('approvals');
            }}
            onNavigateToWorkspace={() => setCurrentView('review-workspace')}
            teamMembers={store.teamMembers}
          />
        )}

        {currentView === 'guidelines' && (
          <BrandGuidelinesView
            guidelines={store.guidelines}
            approvedFacts={store.approvedFacts}
            brandAssets={store.brandAssets}
            onAddGuideline={store.addGuideline}
            onToggleGuideline={store.toggleGuideline}
            onAddFact={store.addApprovedFact}
          />
        )}

        {currentView === 'asset-studio' && (
          <BrandAssetStudioView
            currentUser={store.currentUser}
            brandAssets={store.brandAssets}
            onAddBrandAsset={store.addBrandAsset}
          />
        )}

        {currentView === 'monolith-3d' && (
          <ThreeBrandSceneView
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'approvals' && (
          <ApprovalsView
            currentUser={store.currentUser}
            documents={store.documents}
            approvals={store.approvals}
            comments={store.comments}
            onSubmitDecision={store.submitReviewDecision}
            onAddComment={store.addComment}
            onOpenDocument={handleOpenDocument}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            documents={store.documents}
            reports={store.reports}
            guidelines={store.guidelines}
          />
        )}

        {currentView === 'audit' && (
          <AuditTrailView auditLogs={store.auditLogs} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            currentUser={store.currentUser}
            currentOrg={store.org}
            teamMembers={store.teamMembers}
            onResetDemo={store.resetToDemo}
            onUpdateOrg={store.setOrg}
          />
        )}
      </main>

      {/* Floating AI Advisor Launcher Button */}
      {!isChatOpen && currentView !== 'monolith-3d' && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center gap-2 group cursor-pointer"
          title="Open AI Brand Governance Advisor"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-semibold max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out">
            AI Governance Advisor
          </span>
        </button>
      )}

      {/* Gemini Chatbot Drawer */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={store.currentUser}
      />

      {/* Guided Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentOrg={store.org}
        onSaveOrg={store.setOrg}
        onAddGuideline={store.addGuideline}
        onComplete={() => setCurrentView('dashboard')}
      />
    </div>
  );
}
