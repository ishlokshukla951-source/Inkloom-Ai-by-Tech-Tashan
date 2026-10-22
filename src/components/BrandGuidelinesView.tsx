import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lock,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  BrandGuideline,
  ApprovedFact,
  BrandAsset,
  GuidelineCategory,
  IssueSeverity,
  RuleType,
} from '../types';

interface BrandGuidelinesViewProps {
  guidelines: BrandGuideline[];
  approvedFacts: ApprovedFact[];
  brandAssets: BrandAsset[];
  onAddGuideline: (g: Omit<BrandGuideline, 'id' | 'orgId' | 'lastUpdated'>) => void;
  onToggleGuideline: (id: string) => void;
  onAddFact: (f: Omit<ApprovedFact, 'id' | 'orgId' | 'verifiedAt' | 'verifiedBy'>) => void;
}

export const BrandGuidelinesView: React.FC<BrandGuidelinesViewProps> = ({
  guidelines,
  approvedFacts,
  brandAssets,
  onAddGuideline,
  onToggleGuideline,
  onAddFact,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'facts' | 'assets'>('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GuidelineCategory>('all');
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddFactOpen, setIsAddFactOpen] = useState(false);

  // New Rule Form State
  const [newCategory, setNewCategory] = useState<GuidelineCategory>('terminology');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRuleType, setNewRuleType] = useState<RuleType>('prohibited_phrase');
  const [newPattern, setNewPattern] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [newSeverity, setNewSeverity] = useState<IssueSeverity>('medium');
  const [newExplanation, setNewExplanation] = useState('');

  // New Fact Form State
  const [factTopic, setFactTopic] = useState('');
  const [factClaimKey, setFactClaimKey] = useState('');
  const [factStatement, setFactStatement] = useState('');
  const [factSource, setFactSource] = useState('');

  const filteredGuidelines = guidelines.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPattern.trim()) return;

    onAddGuideline({
      category: newCategory,
      name: newName,
      description: newDesc || `Enforce brand policy on "${newPattern}".`,
      ruleType: newRuleType,
      pattern: newPattern,
      replacement: newReplacement || undefined,
      severity: newSeverity,
      isActive: true,
      examples: [`Example containing "${newPattern}"`],
      explanation: newExplanation || `Violates official brand standards.`,
    });

    setIsAddRuleOpen(false);
    setNewName('');
    setNewDesc('');
    setNewPattern('');
    setNewReplacement('');
    setNewExplanation('');
  };

  const handleCreateFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factTopic.trim() || !factStatement.trim()) return;

    onAddFact({
      topic: factTopic,
      claimKey: factClaimKey,
      verifiedStatement: factStatement,
      sourceDoc: factSource || 'Internal Legal Verification',
    });

    setIsAddFactOpen(false);
    setFactTopic('');
    setFactClaimKey('');
    setFactStatement('');
    setFactSource('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Brand Guidelines & Policy Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative corporate rules, prohibited claims, disclosures, and verified facts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'rules' && (
            <button
              onClick={() => setIsAddRuleOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand Rule</span>
            </button>
          )}

          {activeTab === 'facts' && (
            <button
              onClick={() => setIsAddFactOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Verified Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm">
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            activeTab === 'rules' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Governance Rules ({guidelines.length})</span>
          {activeTab === 'rules' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            activeTab === 'facts' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Verified Facts ({approvedFacts.length})</span>
          {activeTab === 'facts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 px-2 font-medium transition-colors relative ${
            activeTab === 'assets' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Brand Assets ({brandAssets.length})</span>
          {activeTab === 'assets' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search rule name or pattern..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(['all', 'claim', 'terminology', 'disclaimer', 'tone', 'accessibility'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-md capitalize transition-colors font-medium ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Guidelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuidelines.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-xl border p-5 space-y-3 transition-all ${
                  rule.isActive ? 'border-slate-200/90 shadow-2xs' : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`font-bold uppercase ${
                          rule.severity === 'critical'
                            ? 'text-rose-700'
                            : rule.severity === 'high'
                            ? 'text-amber-700'
                            : 'text-indigo-700'
                        }`}
                      >
                        {rule.severity}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 capitalize">{rule.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {rule.ruleType.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                  </div>

                  {/* Toggle Active Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleGuideline(rule.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.isActive ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                    title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        rule.isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Pattern:</span>
                    <span className="font-mono text-rose-900 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      "{rule.pattern}"
                    </span>
                  </div>
                  {rule.replacement && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">Preferred:</span>
                      <span className="font-mono text-emerald-900 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        "{rule.replacement}"
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-mono tabular-nums">
                  <span>Last updated: {new Date(rule.lastUpdated).toLocaleDateString()}</span>
                  <span>{rule.isActive ? 'Active in Scanner' : 'Paused'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facts Tab */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            Verified organisational facts form the bedrock of factual assurance. Whenever authors draft content mentioning customer scale, SLA commitments, or certifications, our engine flags discrepancies against this audited source of truth.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approvedFacts.map((fact) => (
              <div
                key={fact.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    {fact.topic}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Audited Statement:</div>
                  <p className="text-sm font-semibold text-slate-900">{fact.verifiedStatement}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="truncate">
                    <span className="font-semibold">Detects outdated:</span> {fact.claimKey}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold">Source:</span> {fact.sourceDoc}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono tabular-nums pt-2 border-t border-slate-100">
                  Verified {new Date(fact.verifiedAt).toLocaleDateString()} by {fact.verifiedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brandAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{asset.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 rounded">
                  {asset.category}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-500">Specifications:</p>
                <p className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                  {asset.specification}
                </p>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Approved Usage:</span> {asset.approvedUsage}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateRule}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-900">Add Brand Governance Rule</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prohibit Unqualified AI Claims"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="claim">Claim / Guarantee</option>
                  <option value="terminology">Terminology</option>
                  <option value="disclaimer">Disclaimer</option>
                  <option value="tone">Tone & Voice</option>
                  <option value="accessibility">Accessibility</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Type</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="prohibited_phrase">Prohibited Phrase</option>
                  <option value="preferred_phrase">Preferred Phrase</option>
                  <option value="mandatory_disclaimer">Mandatory Disclaimer</option>
                  <option value="unsupported_claim">Unsupported Claim</option>
                  <option value="voice_tone">Voice & Tone</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pattern to Flag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100% guarantee"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Alternative</label>
                <input
                  type="text"
                  placeholder="e.g. proven track record"
                  value={newReplacement}
                  onChange={(e) => setNewReplacement(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Policy Explanation</label>
              <textarea
                rows={2}
                placeholder="Explain why this conflicts with organizational standards..."
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs"
              >
                Save Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Fact Modal */}
      {isAddFactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateFact}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-900">Register Verified Corporate Fact</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic / Dimension</label>
              <input
                type="text"
                required
                placeholder="e.g. Total Enterprise Customers"
                value={factTopic}
                onChange={(e) => setFactTopic(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Outdated / Common Conflicting Keywords (separated by |)
              </label>
              <input
                type="text"
                placeholder="e.g. 500 customers|500 enterprise clients"
                value={factClaimKey}
                onChange={(e) => setFactClaimKey(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Verified Statement</label>
              <input
                type="text"
                required
                placeholder="e.g. Over 1,400 enterprise organizations worldwide"
                value={factStatement}
                onChange={(e) => setFactStatement(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Source Document / Legal Citation
              </label>
              <input
                type="text"
                placeholder="e.g. Q3 2026 Audited Operating Report"
                value={factSource}
                onChange={(e) => setFactSource(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddFactOpen(false)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs"
              >
                Save Verified Fact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
