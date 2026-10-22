/**
 * Inkloom AI — Deterministic Brand Governance Rule Engine
 * High-precision, zero-hallucination text scanner with regex, exact token matching,
 * disclaimer verification, and evidence span tracking.
 */

import { BrandGuideline, ApprovedFact, ReviewIssue, IssueSeverity } from '../types';

export interface RuleEngineResult {
  issues: ReviewIssue[];
  consistencyScore: number;
  matchedRulesCount: number;
}

/**
 * Escapes characters for safe regex pattern creation
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Executes deterministic rules against content text
 */
export function runDeterministicRuleEngine(
  text: string,
  guidelines: BrandGuideline[],
  approvedFacts: ApprovedFact[] = []
): RuleEngineResult {
  const issues: ReviewIssue[] = [];
  const normalizedText = text;

  // 1. Process active Brand Guidelines
  for (const guideline of guidelines) {
    if (!guideline.isActive) continue;

    try {
      if (guideline.ruleType === 'prohibited_phrase') {
        const pattern = new RegExp(`\\b(${escapeRegex(guideline.pattern)})\\b`, 'gi');
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(normalizedText)) !== null) {
          const evidence = match[0];
          const startIndex = match.index;
          const endIndex = startIndex + evidence.length;

          issues.push({
            id: `det-${guideline.id}-${startIndex}`,
            category: guideline.category,
            severity: guideline.severity,
            source: 'rule_engine',
            evidence,
            startIndex,
            endIndex,
            explanation: guideline.explanation || `The phrase "${evidence}" is prohibited by official brand guidelines.`,
            guidelineReference: guideline.name,
            suggestion: guideline.replacement || 'Remove or replace with neutral approved terminology.',
            confidence: 1.0, // Deterministic exact match has 100% confidence
            requiresHumanReview: guideline.severity === 'critical' || guideline.severity === 'high',
            status: 'open',
          });
        }
      } else if (guideline.ruleType === 'preferred_phrase') {
        const pattern = new RegExp(`\\b(${escapeRegex(guideline.pattern)})\\b`, 'gi');
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(normalizedText)) !== null) {
          const evidence = match[0];
          const startIndex = match.index;
          const endIndex = startIndex + evidence.length;

          // Check if it's already using the replacement
          if (guideline.replacement && evidence.toLowerCase() === guideline.replacement.toLowerCase()) {
            continue;
          }

          issues.push({
            id: `det-${guideline.id}-${startIndex}`,
            category: guideline.category,
            severity: guideline.severity,
            source: 'rule_engine',
            evidence,
            startIndex,
            endIndex,
            explanation: guideline.explanation || `Preferred brand terminology is "${guideline.replacement}" instead of "${evidence}".`,
            guidelineReference: guideline.name,
            suggestion: guideline.replacement || 'Use preferred phrasing.',
            confidence: 1.0,
            requiresHumanReview: false,
            status: 'open',
          });
        }
      } else if (guideline.ruleType === 'mandatory_disclaimer') {
        // If content discusses topics that require disclaimer, verify disclaimer exists
        const triggerPattern = new RegExp(`(${escapeRegex(guideline.pattern)})`, 'i');
        if (triggerPattern.test(normalizedText)) {
          const disclaimerExpected = guideline.replacement || guideline.pattern;
          const disclaimerFound = normalizedText.toLowerCase().includes(disclaimerExpected.toLowerCase());

          if (!disclaimerFound) {
            issues.push({
              id: `det-disclaimer-${guideline.id}`,
              category: 'disclaimer',
              severity: guideline.severity,
              source: 'rule_engine',
              evidence: `Section discussing: "${guideline.pattern}"`,
              explanation: guideline.explanation || `Content mentions ${guideline.pattern} but omits the mandatory disclaimer.`,
              guidelineReference: guideline.name,
              suggestion: `Add disclaimer: "${disclaimerExpected}"`,
              confidence: 1.0,
              requiresHumanReview: true,
              status: 'open',
            });
          }
        }
      } else if (guideline.ruleType === 'unsupported_claim' || guideline.ruleType === 'voice_tone') {
        const pattern = new RegExp(`\\b(${escapeRegex(guideline.pattern)})\\b`, 'gi');
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(normalizedText)) !== null) {
          const evidence = match[0];
          const startIndex = match.index;
          const endIndex = startIndex + evidence.length;

          issues.push({
            id: `det-${guideline.id}-${startIndex}`,
            category: guideline.category,
            severity: guideline.severity,
            source: 'rule_engine',
            evidence,
            startIndex,
            endIndex,
            explanation: guideline.explanation,
            guidelineReference: guideline.name,
            suggestion: guideline.replacement || 'Reframe claim with substantiated evidence or approved tone.',
            confidence: 0.95,
            requiresHumanReview: true,
            status: 'open',
          });
        }
      }
    } catch {
      // Regex evaluation failure protection
      continue;
    }
  }

  // 2. Check against Approved Organisational Facts
  for (const fact of approvedFacts) {
    if (!fact.claimKey) continue;
    // Check if outdated claim patterns are mentioned
    const outdatedKeywords = fact.claimKey.split('|');
    for (const kw of outdatedKeywords) {
      if (!kw.trim()) continue;
      const kwPattern = new RegExp(`\\b(${escapeRegex(kw.trim())})\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = kwPattern.exec(normalizedText)) !== null) {
        const evidence = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + evidence.length;

        // If the statement in text does not match verified statement
        if (!normalizedText.includes(fact.verifiedStatement)) {
          issues.push({
            id: `det-fact-${fact.id}-${startIndex}`,
            category: 'outdated_fact',
            severity: 'high',
            source: 'rule_engine',
            evidence,
            startIndex,
            endIndex,
            explanation: `Reference to "${evidence}" conflicts with verified organisational fact: "${fact.verifiedStatement}". (Source: ${fact.sourceDoc})`,
            guidelineReference: `Verified Fact: ${fact.topic}`,
            suggestion: fact.verifiedStatement,
            confidence: 1.0,
            requiresHumanReview: true,
            status: 'open',
          });
        }
      }
    }
  }

  // 3. Accessibility & Editorial Formatting Deterministic Checks
  // A. Non-descriptive links ("click here", "here", "read more")
  const badLinkPattern = /\b(click here|click this link|read more here|hit this link)\b/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = badLinkPattern.exec(normalizedText)) !== null) {
    const evidence = linkMatch[0];
    const startIndex = linkMatch.index;
    const endIndex = startIndex + evidence.length;

    issues.push({
      id: `det-a11y-${startIndex}`,
      category: 'accessibility',
      severity: 'medium',
      source: 'rule_engine',
      evidence,
      startIndex,
      endIndex,
      explanation: 'Non-descriptive anchor text degrades screen reader navigation and accessibility.',
      guidelineReference: 'WCAG 2.2 AA Link Context',
      suggestion: 'Replace with descriptive destination (e.g., "Review our Brand Guidelines" or "Explore the Governance Documentation").',
      confidence: 1.0,
      requiresHumanReview: false,
      status: 'open',
    });
  }

  // B. ALL-CAPS shouting blocks (>25 characters uppercase)
  const allCapsPattern = /\b([A-Z\s]{25,})\b/g;
  let capsMatch: RegExpExecArray | null;
  while ((capsMatch = allCapsPattern.exec(normalizedText)) !== null) {
    const evidence = capsMatch[0].trim();
    if (evidence.length >= 25 && !evidence.includes('HTTP')) {
      const startIndex = capsMatch.index;
      const endIndex = startIndex + evidence.length;

      issues.push({
        id: `det-caps-${startIndex}`,
        category: 'tone',
        severity: 'low',
        source: 'rule_engine',
        evidence,
        startIndex,
        endIndex,
        explanation: 'Extended uppercase text diminishes readability and violates brand typography rules.',
        guidelineReference: 'Brand Typography & Tone Hierarchy',
        suggestion: evidence.charAt(0) + evidence.slice(1).toLowerCase(),
        confidence: 0.95,
        requiresHumanReview: false,
        status: 'open',
      });
    }
  }

  // 4. Calculate Deterministic Consistency Score (0 - 100)
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 8;
        break;
      case 'low':
        score -= 4;
        break;
      case 'informational':
        score -= 1;
        break;
    }
  }

  return {
    issues,
    consistencyScore: Math.max(0, Math.min(100, score)),
    matchedRulesCount: issues.length,
  };
}

/**
 * Applies a suggested correction to text, preserving other spans safely
 */
export function applySuggestionToContent(
  text: string,
  issue: ReviewIssue
): { updatedText: string; applied: boolean } {
  // If it's a disclaimer missing issue, append to document
  if (issue.category === 'disclaimer' && (issue.startIndex === undefined || issue.endIndex === undefined)) {
    const cleanSuggestion = issue.suggestion.replace(/^Add disclaimer:\s*"?|"?$/g, '').trim();
    const updatedText = `${text.trimEnd()}\n\n---\n*Disclaimer: ${cleanSuggestion}*`;
    return { updatedText, applied: true };
  }

  if (issue.startIndex !== undefined && issue.endIndex !== undefined && issue.startIndex >= 0 && issue.endIndex <= text.length) {
    const before = text.slice(0, issue.startIndex);
    const after = text.slice(issue.endIndex);
    const updatedText = before + issue.suggestion + after;
    return { updatedText, applied: true };
  }

  // Fallback string replacement if indices shifted
  if (issue.evidence && text.includes(issue.evidence)) {
    const updatedText = text.replace(issue.evidence, issue.suggestion);
    return { updatedText, applied: true };
  }

  return { updatedText: text, applied: false };
}
