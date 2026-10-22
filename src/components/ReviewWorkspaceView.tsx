import React, { useState } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FolderOpen,
} from 'lucide-react';
import { ContentDocument, Organisation } from '../types';

interface ReviewWorkspaceViewProps {
  currentOrg: Organisation;
  onSaveDraft: (doc: {
    title: string;
    contentType: ContentDocument['contentType'];
    channel: string;
    text: string;
  }) => ContentDocument;
  onRunAnalysis: (
    documentId: string,
    onProgress?: (stage: number, stageName: string) => void
  ) => Promise<any>;
  onNavigateToResults: (documentId: string) => void;
}

export const ReviewWorkspaceView: React.FC<ReviewWorkspaceViewProps> = ({
  currentOrg,
  onSaveDraft,
  onRunAnalysis,
  onNavigateToResults,
}) => {
  const [title, setTitle] = useState('Acme Cloud Q4 Product Launch Memo');
  const [contentType, setContentType] = useState<ContentDocument['contentType']>('press_release');
  const [channel, setChannel] = useState(currentOrg.channels[0] || 'Newswire');
  const [content, setContent] = useState(
    `Acme Cloud Dynamics is thrilled to announce our next-generation cloud migration architecture. As the unrivaled market leader in infrastructure resilience, we offer a 100% guarantee against data corruption for every organization that switches to our platform.\n\nWith our revolutionary AI engine, enterprises experience zero risk transitions with zero downtime. Trusted by over 500 enterprise customers across North America, our platform helps active users cut cloud spend by up to 45% while achieving 350% ROI within three quarters.\n\nTeams can start immediately on our cheap tier. For more details on compliance, click here to access our technical whitepaper.`
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageDescription, setStageDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'guideline_context'>('editor');
  const [saveMessage, setSaveMessage] = useState(false);

  const contentTypes: { value: ContentDocument['contentType']; label: string }[] = [
    { value: 'press_release', label: 'Press Release' },
    { value: 'blog_post', label: 'Blog & Thought Leadership' },
    { value: 'social_media', label: 'Social Media / LinkedIn' },
    { value: 'ad_copy', label: 'Digital Ad Copy' },
    { value: 'email_newsletter', label: 'Customer Newsletter' },
    { value: 'product_doc', label: 'Product Documentation' },
  ];

  const loadPreset = (type: 'violations' | 'compliant' | 'unsupported_claim') => {
    if (type === 'violations') {
      setTitle('Q4 Enterprise Cloud Acceleration Press Release');
      setContentType('press_release');
      setChannel('Newswire & Investor Relations');
      setContent(
        `Acme Cloud Dynamics is thrilled to announce our next-generation cloud migration architecture. As the unrivaled market leader in infrastructure resilience, we offer a 100% guarantee against data corruption for every organization that switches to our platform.\n\nWith our revolutionary AI engine, enterprises experience zero risk transitions with zero downtime. Trusted by over 500 enterprise customers across North America, our platform helps active users cut cloud spend by up to 45% while achieving 350% ROI within three quarters.\n\nTeams can start immediately on our cheap tier. For more details on compliance, click here to access our technical whitepaper.`
      );
    } else if (type === 'compliant') {
      setTitle('Engineering Benchmark: Multi-Cloud Resilience');
      setContentType('blog_post');
      setChannel('Acme Official Engineering Blog');
      setContent(
        `Today we publish audited performance benchmarks from our engineering testing laboratories. Across 1,400 enterprise organizations utilizing our transparent governance pipeline, uptime held steady at our contractual 99.95% enterprise availability SLA.\n\nBy leveraging automated policy enforcement, engineering teams maintain verified compliance without interrupting deployment cadence.\n\nExplore our complete audit documentation in our Trust and Assurance Center.`
      );
    } else {
      setTitle('Executive Social Post: Enterprise Speed');
      setContentType('social_media');
      setChannel('LinkedIn Corporate');
      setContent(
        `Our new cloud migration engine is 10x faster than any competitor on the planet. WE GUARANTEE COMPLETE SATISFACTION FOR EVERY SINGLE CUSTOMER WHO SIGNS UP TODAY.\n\nWhy settle for outdated legacy systems when our revolutionary AI can eliminate all maintenance forever? Click here to join.`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB governance limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    const savedDoc = onSaveDraft({
      title: title || 'Untitled Draft',
      contentType,
      channel,
      text: content,
    });

    setIsAnalyzing(true);
    setCurrentStage(1);
    setStageDescription('Validating submitted content...');

    try {
      await onRunAnalysis(
        savedDoc.id,
        (stage, desc) => {
          setCurrentStage(stage);
          setStageDescription(desc);
        },
        savedDoc
      );

      // Brief delay to let the user see the completed state
      setTimeout(() => {
        setIsAnalyzing(false);
        onNavigateToResults(savedDoc.id);
      }, 350);
    } catch (err: any) {
      console.error(err);
      setIsAnalyzing(false);
      setStageDescription('Analysis completed with deterministic fallback.');
      setTimeout(() => {
        onNavigateToResults(savedDoc.id);
      }, 300);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Content Review Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-flight brand governance scanner · Scans against {currentOrg.name} policies
          </p>
        </div>

        {/* Demo Presets Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Demo Presets:</span>
          <button
            onClick={() => loadPreset('violations')}
            className="px-2.5 py-1 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
          >
            Launch Memo (Violations)
          </button>
          <button
            onClick={() => loadPreset('compliant')}
            className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
          >
            Compliant Blog
          </button>
          <button
            onClick={() => loadPreset('unsupported_claim')}
            className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
          >
            Hyperbolic Social
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Top Controls Grid */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
              placeholder="e.g. Q4 Cloud Acceleration Launch Memo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Content Format
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              {contentTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Publishing Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              {currentOrg.channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 space-y-3">
          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 text-sm leading-relaxed border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-sans text-slate-900 resize-y"
            placeholder="Paste your draft article, marketing copy, press release, or document here..."
          />

          {/* Meta & File Upload Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="font-mono tabular-nums">{wordCount} words</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{charCount} characters</span>
              <span aria-hidden="true">·</span>
              <span>Target: {channel}</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded border border-slate-200 transition-colors flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Text/MD File</span>
                <input
                  type="file"
                  accept=".txt,.md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  onSaveDraft({ title, contentType, channel, text: content });
                  setSaveMessage(true);
                  setTimeout(() => setSaveMessage(false), 2000);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveMessage ? 'Draft Saved!' : 'Save Draft'}</span>
              </button>

              <button
                onClick={handleAnalyze}
                disabled={!content.trim() || isAnalyzing}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-98 transition-all rounded shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyse Content</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Stage Progress Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Running Brand Governance Pipeline
              </h3>
              <p className="text-xs text-slate-500 font-medium">{stageDescription}</p>
            </div>

            {/* Stages checklist */}
            <div className="space-y-3 text-xs">
              {[
                '1. Validating submitted content & parameters',
                '2. Checking deterministic rules & terminology regex',
                '3. Analysing semantic context & brand consistency',
                '4. Preparing explanations & suggestions',
                '5. Compiling final review report & audit records',
              ].map((stepText, idx) => {
                const stageNum = idx + 1;
                const isDone = currentStage > stageNum;
                const isCurrent = currentStage === stageNum;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-md ${
                      isCurrent
                        ? 'bg-indigo-50 font-semibold text-indigo-900'
                        : isDone
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <RotateCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
