import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Users2,
  Lock,
  ArrowRight,
  CheckCircle2,
  History,
  Sliders,
  ChevronRight,
} from 'lucide-react';

// Resilient fallback SVG data URI if remote network fails completely
const INKLOOM_HERO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="60%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#312e81" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g1)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="80" y="60" width="1040" height="555" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <rect x="80" y="60" width="1040" height="52" rx="16" fill="rgba(15,23,42,0.4)"/>
  <circle cx="120" cy="86" r="6" fill="#ef4444" />
  <circle cx="140" cy="86" r="6" fill="#f59e0b" />
  <circle cx="160" cy="86" r="6" fill="#10b981" />
  <text x="600" y="92" fill="#e0e7ff" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle" letter-spacing="1.5">INKLOOM AI · BRAND GOVERNANCE STRATEGY WORKSHOP</text>
  <g transform="translate(130, 160)">
    <rect x="0" y="0" width="280" height="380" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
    <text x="30" y="45" fill="#818cf8" font-family="system-ui" font-size="12" font-weight="700" letter-spacing="1">STEP 01</text>
    <text x="30" y="75" fill="#ffffff" font-family="system-ui" font-size="18" font-weight="700">Rule Registry</text>
    <rect x="30" y="110" width="220" height="10" rx="5" fill="rgba(255,255,255,0.3)"/>
    <rect x="30" y="130" width="180" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
    <rect x="30" y="150" width="200" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
    <rect x="30" y="290" width="220" height="50" rx="8" fill="#4f46e5"/>
    <text x="140" y="322" fill="#ffffff" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">7 Active Guidelines</text>
  </g>
  <g transform="translate(460, 160)">
    <rect x="0" y="0" width="280" height="380" rx="12" fill="rgba(255,255,255,0.14)" stroke="#6366f1" stroke-width="2"/>
    <text x="30" y="45" fill="#34d399" font-family="system-ui" font-size="12" font-weight="700" letter-spacing="1">STEP 02 · ACTIVE</text>
    <text x="30" y="75" fill="#ffffff" font-family="system-ui" font-size="18" font-weight="700">Dual-Engine Audit</text>
    <circle cx="140" cy="180" r="50" fill="rgba(16,185,129,0.2)"/>
    <path d="M 124 180 L 136 192 L 160 168" stroke="#34d399" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="140" y="260" fill="#a7f3d0" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">99.2% Target Score</text>
    <rect x="30" y="290" width="220" height="50" rx="8" fill="#059669"/>
    <text x="140" y="322" fill="#ffffff" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">Deterministic + AI</text>
  </g>
  <g transform="translate(790, 160)">
    <rect x="0" y="0" width="280" height="380" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
    <text x="30" y="45" fill="#c084fc" font-family="system-ui" font-size="12" font-weight="700" letter-spacing="1">STEP 03</text>
    <text x="30" y="75" fill="#ffffff" font-family="system-ui" font-size="18" font-weight="700">Executive Sign-Off</text>
    <rect x="30" y="110" width="220" height="10" rx="5" fill="rgba(255,255,255,0.3)"/>
    <rect x="30" y="130" width="160" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
    <rect x="30" y="150" width="190" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
    <rect x="30" y="290" width="220" height="50" rx="8" fill="#7c3aed"/>
    <text x="140" y="322" fill="#ffffff" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">Cryptographic Audit</text>
  </g>
</svg>
`)}`;

const HERO_IMAGE_CANDIDATES = [
  '/images/brand-governance-workshop.jpg',
  '/images/hero_brand_governance_studio_1792686990064.jpg',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  INKLOOM_HERO_SVG,
];

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDemoReview: () => void;
  onStartOnboarding: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenDemoReview,
  onStartOnboarding,
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);

  const handleHeroImageError = () => {
    if (candidateIndex < HERO_IMAGE_CANDIDATES.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    }
  };
  const workflowSteps = [
    {
      num: '01',
      title: 'Define Brand Rules & Factual Baselines',
      description:
        'Establish approved terminology, prohibited phrases, required disclaimers, and verified organizational facts in a single authoritative registry.',
    },
    {
      num: '02',
      title: 'Execute Automated Dual-Engine Review',
      description:
        'Every draft passes through deterministic regex rule scanning and contextual Gemini semantic analysis to pinpoint inconsistencies before publishing.',
    },
    {
      num: '03',
      title: 'Collaborate, Revise & Authorize',
      description:
        'Creators apply proposed corrections in one click. Reviewers audit evidence, leave contextual feedback, and formally authorize publication.',
    },
  ];

  const features = [
    {
      title: 'Deterministic Rule Engine',
      description:
        'Regex-powered precision matching that flags prohibited wording, non-compliant pricing terms, and missing disclosures with exact character spans.',
      icon: Sliders,
    },
    {
      title: 'Semantic Context Analysis',
      description:
        'Gemini-powered evaluation of voice, tone, and unverified promotional claims that simple keyword filters fail to catch.',
      icon: FileCheck2,
    },
    {
      title: 'Verified Fact Registry',
      description:
        'Prevent outdated stats and superseded product specs from reaching production through cross-checking against audited company baselines.',
      icon: CheckCircle2,
    },
    {
      title: 'Multi-Role Approval Workflows',
      description:
        'Separation of concerns between Creators, Reviewers, Managers, and Administrators with strict RBAC enforcement.',
      icon: Users2,
    },
    {
      title: 'Immutable Audit Trail',
      description:
        'Comprehensive chronological records of every scan, applied suggestion, reviewer comment, and sign-off decision.',
      icon: History,
    },
    {
      title: 'Private & Secure Governance',
      description:
        'Your organizational content is never used for foundation model training. Data remains strictly siloed within tenant boundaries.',
      icon: Lock,
    },
  ];

  const faqs = [
    {
      q: 'How does Inkloom AI differ from general grammar tools?',
      a: 'Grammar tools only verify spelling and syntax. Inkloom AI is an institutional brand governance platform that enforces organizational policy, prohibited legal claims, mandatory disclaimers, verified business facts, and multi-tier approval permissions.',
    },
    {
      q: 'Does automated scanning replace human review?',
      a: 'No. Inkloom AI is built on human-in-the-loop governance. Automated scanners surface evidence, explain policy implications, and suggest corrections, but authorized human reviewers retain ultimate approval responsibility.',
    },
    {
      q: 'Can the deterministic engine run if external AI services are offline?',
      a: 'Yes. Our deterministic rule engine runs completely autonomously on-premises or server-side without external API calls, guaranteeing uninterrupted pre-flight checks.',
    },
    {
      q: 'How are conflicting or outdated corporate facts prevented?',
      a: 'Authorized administrators register verified organizational claims (such as customer counts, SLA percentages, and compliance certifications) tied to source documents.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Quiet unboxed metadata */}
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
                <span>Enterprise Brand Governance</span>
                <span aria-hidden="true">·</span>
                <span>Pre-Publication Assurance</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                Consistent Content.{' '}
                <span className="text-indigo-600 block sm:inline">Confident Publishing.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Growing organizations publish content across dozens of authors, agencies, and generative tools.
                Inkloom AI reviews drafts against your approved guidelines, verified facts, and legal disclosures
                before mistakes reach the public.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onEnterApp}
                  className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-98 transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenDemoReview}
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/80 flex items-center gap-2"
                >
                  <span>Explore Sample Review</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dual Regex & Semantic Pipeline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Role-Based Approvals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Immutable Audit Logs</span>
                </div>
              </div>
            </div>

            {/* Visual Hero Mockup */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl border border-slate-200 bg-slate-100/70 p-3 shadow-md">
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-white shadow-inner">
                  <img
                    src={HERO_IMAGE_CANDIDATES[candidateIndex]}
                    alt="Brand Governance Strategy Workshop"
                    className="w-full h-72 sm:h-80 object-cover"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={handleHeroImageError}
                  />
                  <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">Pre-Flight Review Monitor</span>
                      <span className="font-mono tabular-nums text-indigo-600 font-medium">99.2% Consistency Target</span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>7 Active Guidelines · 3 Verified Facts · 4 Authorized Reviewers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Governance Workflow */}
      <section className="py-20 border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-semibold text-indigo-700 tracking-wider uppercase">
              End-To-End Methodology
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Three Steps to Bulletproof Publishing
            </h2>
            <p className="text-base text-slate-600">
              From initial draft to final executive approval, our framework removes ambiguity and safeguards brand integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-xl p-8 border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="text-2xl font-mono font-bold text-indigo-600">{step.num}</div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Bento Grid */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-semibold text-indigo-700 tracking-wider uppercase">
              Comprehensive Platform Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Architected for Enterprise Governance
            </h2>
            <p className="text-base text-slate-600">
              Deterministic rule certainty paired with generative context intelligence to protect brand equity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-50/70 rounded-xl p-6 border border-slate-200 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Human Governance Assurance */}
      <section className="py-16 border-b border-slate-200 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Trust Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Human Authority. Zero Data Exploitation.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Automated findings empower authors, but humans retain the sign-off pen.
                All content scanned through Inkloom AI remains strictly confidential and is never used to retrain public models.
                Every decision is archived with cryptographic timestamps in our compliance audit log.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <button
                onClick={onStartOnboarding}
                className="px-6 py-3 text-sm font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
              >
                Configure Brand Guidelines
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600">
              Clear answers regarding our technology, rule parser, and compliance workflow.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-200 pb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Inkloom AI</span>
            <span className="text-slate-400 font-normal">· Consistent Content. Confident Publishing.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onEnterApp} className="hover:text-slate-900 transition-colors">
              Dashboard
            </button>
            <button onClick={onOpenDemoReview} className="hover:text-slate-900 transition-colors">
              Review Workspace
            </button>
            <button onClick={onStartOnboarding} className="hover:text-slate-900 transition-colors">
              Brand Onboarding
            </button>
          </div>

          <p>© {new Date().getFullYear()} Inkloom AI Governance Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
