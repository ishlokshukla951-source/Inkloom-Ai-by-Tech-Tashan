import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Cpu,
  Users2,
  RotateCcw,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Organisation, UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  currentOrg: Organisation;
  teamMembers: UserProfile[];
  onResetDemo: () => void;
  onUpdateOrg: (org: Organisation) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  currentOrg,
  teamMembers,
  onResetDemo,
  onUpdateOrg,
}) => {
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [industry, setIndustry] = useState(currentOrg.industry);
  const [notifyOnReview, setNotifyOnReview] = useState(true);
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrg({
      ...currentOrg,
      name: orgName,
      industry,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Governance & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure organization profiles, team authorizations, AI engines, and compliance preferences
        </p>
      </div>

      {/* AI Engine & Rule Parser Health Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">AI & Governance Pipeline Status</h2>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-sm border border-emerald-200">
            System Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Deterministic Rule Engine</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-600">
              Runs in-process without network overhead. 100% precision exact token, regex, and character span locator.
            </p>
            <div className="text-[11px] font-mono text-slate-500">Latency: &lt; 5ms · Zero External Calls</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Google Gemini Semantic Review</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-slate-600">
              Evaluates tone, unverified puffery, and contextual consistency via server-side Google GenAI proxy.
            </p>
            <div className="text-[11px] font-mono text-slate-500">Target Model: gemini-2.5-flash / gemini-1.5-flash</div>
          </div>
        </div>
      </div>

      {/* Organization Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Organization Profile</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Changes saved to workspace!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-2xs"
            >
              Save Organization Info
            </button>
          </div>
        </form>
      </div>

      {/* Role-Based Access Control (RBAC) Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users2 className="w-4 h-4 text-indigo-600" />
          <span>Authorized Team Members & Roles</span>
        </h2>

        <div className="divide-y divide-slate-100 text-xs">
          {teamMembers.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <p className="text-[11px] text-slate-500">{member.email} · {member.title}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 text-[11px] font-semibold uppercase rounded bg-slate-100 text-slate-800 border border-slate-200">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management & Demo Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-indigo-600" />
          <span>Demo Data & Workspace Reset</span>
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          Need to test the initial state or re-run a fresh evaluation demo? Resetting clears local modifications
          and restores the default enterprise sample documents, brand guidelines, and verified corporate facts.
        </p>

        <div>
          <button
            onClick={() => {
              if (confirm('Reset workspace to initial sample data and pristine brand guidelines?')) {
                onResetDemo();
                alert('Workspace reset to initial demonstration state.');
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
          >
            Reset All Data to Demo Baseline
          </button>
        </div>
      </div>
    </div>
  );
};
