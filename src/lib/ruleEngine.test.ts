import test from 'node:test';
import assert from 'node:assert/strict';
import { runDeterministicRuleEngine, applySuggestionToContent } from './ruleEngine';
import { BrandGuideline, ApprovedFact, ReviewIssue } from '../types';

const sampleGuidelines: BrandGuideline[] = [
  {
    id: 'g-1',
    orgId: 'org-test',
    category: 'terminology',
    name: 'Prohibited Absolutist Claims',
    description: 'Avoid 100% guarantee promises',
    ruleType: 'prohibited_phrase',
    pattern: '100% guarantee',
    replacement: 'proven track record',
    severity: 'critical',
    isActive: true,
    examples: ['100% guarantee of success'],
    explanation: 'Absolute guarantees expose the company to regulatory and liability risks.',
    lastUpdated: '2026-10-22',
  },
  {
    id: 'g-2',
    orgId: 'org-test',
    category: 'terminology',
    name: 'Preferred Member Terminology',
    description: 'Use collaborators instead of users',
    ruleType: 'preferred_phrase',
    pattern: 'users',
    replacement: 'collaborators',
    severity: 'medium',
    isActive: true,
    examples: ['our users love the tool'],
    explanation: 'We refer to our community as collaborators to reflect partnership.',
    lastUpdated: '2026-10-22',
  },
  {
    id: 'g-3',
    orgId: 'org-test',
    category: 'disclaimer',
    name: 'Financial Return Disclaimer',
    description: 'Must include earnings disclaimer when discussing returns',
    ruleType: 'mandatory_disclaimer',
    pattern: 'ROI',
    replacement: 'Results vary based on institutional adoption.',
    severity: 'high',
    isActive: true,
    examples: ['expect 400% ROI'],
    explanation: 'Financial returns must include our mandatory disclaimer.',
    lastUpdated: '2026-10-22',
  },
];

const sampleFacts: ApprovedFact[] = [
  {
    id: 'f-1',
    orgId: 'org-test',
    topic: 'Customer Base Count',
    claimKey: '500 enterprise customers|500 clients',
    verifiedStatement: 'Over 1,400 enterprise organizations worldwide',
    sourceDoc: 'Q3 2026 Investor Release',
    verifiedAt: '2026-09-30',
    verifiedBy: 'Corporate Relations',
  },
];

test('detects prohibited phrases and calculates exact spans', () => {
  const text = 'Our platform provides a 100% guarantee for all enterprise deployments.';
  const result = runDeterministicRuleEngine(text, sampleGuidelines, sampleFacts);

  assert.equal(result.issues.length, 1);
  const issue = result.issues[0];
  assert.equal(issue.severity, 'critical');
  assert.equal(issue.evidence, '100% guarantee');
  assert.equal(issue.startIndex, 24);
  assert.equal(issue.endIndex, 38);
  assert.equal(issue.suggestion, 'proven track record');
  assert.ok(result.consistencyScore < 80);
});

test('detects preferred terminology usage', () => {
  const text = 'More than 20,000 active users rely on our systems daily.';
  const result = runDeterministicRuleEngine(text, sampleGuidelines, sampleFacts);

  const termIssue = result.issues.find((i) => i.category === 'terminology');
  assert.ok(termIssue);
  assert.equal(termIssue?.evidence, 'users');
  assert.equal(termIssue?.suggestion, 'collaborators');
});

test('detects missing mandatory disclaimer when trigger keyword is present', () => {
  const text = 'Our clients achieve up to 350% ROI within the first 90 days.';
  const result = runDeterministicRuleEngine(text, sampleGuidelines, sampleFacts);

  const disclaimerIssue = result.issues.find((i) => i.category === 'disclaimer');
  assert.ok(disclaimerIssue);
  assert.equal(disclaimerIssue?.severity, 'high');
});

test('detects outdated organizational facts', () => {
  const text = 'Trusted by 500 enterprise customers across four continents.';
  const result = runDeterministicRuleEngine(text, sampleGuidelines, sampleFacts);

  const factIssue = result.issues.find((i) => i.category === 'outdated_fact');
  assert.ok(factIssue);
  assert.equal(factIssue?.suggestion, 'Over 1,400 enterprise organizations worldwide');
});

test('detects accessibility non-descriptive links', () => {
  const text = 'To learn more about our certifications, click here to download.';
  const result = runDeterministicRuleEngine(text, sampleGuidelines, sampleFacts);

  const a11yIssue = result.issues.find((i) => i.category === 'accessibility');
  assert.ok(a11yIssue);
  assert.equal(a11yIssue?.evidence.toLowerCase(), 'click here');
});

test('applies suggested corrections safely to content', () => {
  const text = 'Our platform provides a 100% guarantee for all enterprise deployments.';
  const issue: ReviewIssue = {
    id: 'test-issue-1',
    category: 'terminology',
    severity: 'critical',
    source: 'rule_engine',
    evidence: '100% guarantee',
    startIndex: 24,
    endIndex: 38,
    explanation: 'Absolute guarantee',
    guidelineReference: 'Prohibited Absolutist Claims',
    suggestion: 'proven track record',
    confidence: 1.0,
    requiresHumanReview: true,
    status: 'open',
  };

  const { updatedText, applied } = applySuggestionToContent(text, issue);
  assert.equal(applied, true);
  assert.equal(updatedText, 'Our platform provides a proven track record for all enterprise deployments.');
});
