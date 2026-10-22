import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, Building2, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import { Organisation, BrandGuideline } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrg: Organisation;
  onSaveOrg: (org: Organisation) => void;
  onAddGuideline: (guideline: Omit<BrandGuideline, 'id' | 'orgId' | 'lastUpdated'>) => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentOrg,
  onSaveOrg,
  onAddGuideline,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [industry, setIndustry] = useState(currentOrg.industry);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(currentOrg.channels);
  const [brandVoice, setBrandVoice] = useState('Authoritative & Grounded');
  const [customVoice, setCustomVoice] = useState('');

  // Initial rule drafts
  const [prohibitedPhrase, setProhibitedPhrase] = useState('100% guarantee');
  const [prohibitedReplacement, setProhibitedReplacement] = useState('proven track record');
  const [preferredWord, setPreferredWord] = useState('users');
  const [preferredReplacement, setPreferredReplacement] = useState('collaborators');
  const [mandatoryDisclaimer, setMandatoryDisclaimer] = useState('Past performance does not guarantee future results.');

  if (!isOpen) return null;

  const channelOptions = [
    'Blog & Editorial',
    'Press Releases',
    'LinkedIn & Social Media',
    'Executive Memos',
    'Email Newsletters',
    'Product Documentation',
    'Ad Copy',
  ];

  const voiceOptions = [
    { title: 'Authoritative & Grounded', desc: 'Precise, objective, and backed by verifiable technical rigor.' },
    { title: 'Modern & Collaborative', desc: 'Warm, approachable, and encouraging human-centered partnership.' },
    { title: 'Bold & Pioneering', desc: 'Confident, forward-looking, and energetic without resorting to empty hype.' },
    { title: 'Technical & Academic', desc: 'Rigorous, formal, and deeply contextualized for specialized practitioners.' },
    { title: 'Custom Definition', desc: 'Specify bespoke adjectives and tonal boundary rules.' },
  ];

  const handleNext = () => {
    if (step === 1) {
      onSaveOrg({
        ...currentOrg,
        name: orgName,
        industry,
        channels: selectedChannels,
      });
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save created rules
      if (prohibitedPhrase) {
        onAddGuideline({
          category: 'claim',
          name: `Prohibit: "${prohibitedPhrase}"`,
          description: `Avoid ${prohibitedPhrase} in public brand communications.`,
          ruleType: 'prohibited_phrase',
          pattern: prohibitedPhrase,
          replacement: prohibitedReplacement,
          severity: 'critical',
          isActive: true,
          examples: [`Avoid stating: ${prohibitedPhrase}`],
          explanation: 'Restricted by organizational marketing and compliance policy.',
        });
      }
      if (preferredWord && preferredReplacement) {
        onAddGuideline({
          category: 'terminology',
          name: `Prefer: "${preferredReplacement}" over "${preferredWord}"`,
          description: `Use ${preferredReplacement} to reflect brand identity.`,
          ruleType: 'preferred_phrase',
          pattern: preferredWord,
          replacement: preferredReplacement,
          severity: 'medium',
          isActive: true,
          examples: [`Use ${preferredReplacement}`],
          explanation: 'Standardized terminology guideline.',
        });
      }
      onComplete();
      onClose();
    }
  };

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Step {step} of 4
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {step === 1 && 'Organization & Brand Identity'}
              {step === 2 && 'Brand Voice & Writing Tone'}
              {step === 3 && 'Prohibited & Preferred Phrasing'}
              {step === 4 && 'Review & Finalize Governance Profile'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization & Brand Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="e.g. Acme Cloud Dynamics"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry & Domain
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="e.g. Cloud Infrastructure & Enterprise Security"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Primary Publishing Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {channelOptions.map((ch) => {
                    const checked = selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-3 py-2 text-xs rounded-md border text-left flex items-center justify-between transition-colors ${
                          checked
                            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{ch}</span>
                        {checked && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose the baseline writing tone that Inkloom AI semantic analysis will evaluate drafts against:
              </p>
              <div className="space-y-2">
                {voiceOptions.map((v) => (
                  <button
                    key={v.title}
                    type="button"
                    onClick={() => setBrandVoice(v.title)}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      brandVoice === v.title
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-900">{v.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{v.desc}</div>
                  </button>
                ))}
              </div>

              {brandVoice === 'Custom Definition' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Describe your custom tone requirements:
                  </label>
                  <textarea
                    rows={2}
                    value={customVoice}
                    onChange={(e) => setCustomVoice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. Sophisticated, restrained, highly empirical, avoids dramatic adjectives."
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                Deterministic rules run continuously without external AI dependencies. Configure your initial high-priority words below:
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Prohibited Marketing Phrase
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Disallowed phrase:</label>
                    <input
                      type="text"
                      value={prohibitedPhrase}
                      onChange={(e) => setProhibitedPhrase(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Recommended correction:</label>
                    <input
                      type="text"
                      value={prohibitedReplacement}
                      onChange={(e) => setProhibitedReplacement(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  2. Preferred Terminology
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Discouraged term:</label>
                    <input
                      type="text"
                      value={preferredWord}
                      onChange={(e) => setPreferredWord(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Approved replacement:</label>
                    <input
                      type="text"
                      value={preferredReplacement}
                      onChange={(e) => setPreferredReplacement(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  3. Mandatory Disclaimer Snippet
                </h4>
                <input
                  type="text"
                  value={mandatoryDisclaimer}
                  onChange={(e) => setMandatoryDisclaimer(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Organization:</span>
                  <span className="font-semibold text-slate-900">{orgName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Industry:</span>
                  <span className="font-semibold text-slate-900">{industry}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Brand Voice:</span>
                  <span className="font-semibold text-slate-900">{brandVoice}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Channels:</span>
                  <span className="font-semibold text-slate-900">{selectedChannels.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Rules Seeded:</span>
                  <span className="font-semibold text-emerald-700">Prohibited phrase, Preferred term, Disclaimer</span>
                </div>
              </div>

              <p className="text-slate-500">
                You can add more rules, verified facts, and invited team members at any time from the Brand Guidelines manager.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Skip Setup
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
          >
            <span>{step === 4 ? 'Enter Dashboard' : 'Continue'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
