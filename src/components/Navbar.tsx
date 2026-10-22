import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ChevronDown, Sparkles, MessageSquare } from 'lucide-react';
import { UserProfile, Organisation } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserProfile;
  teamMembers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  org: Organisation;
  pendingApprovalsCount: number;
  onToggleChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  teamMembers,
  onSwitchUser,
  org,
  pendingApprovalsCount,
  onToggleChat,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'review-workspace', label: 'Review Content' },
    { id: 'approvals', label: 'Approvals', badge: pendingApprovalsCount },
    { id: 'guidelines', label: 'Brand Guidelines' },
    { id: 'asset-studio', label: 'Visual Studio' },
    { id: 'monolith-3d', label: '3D Monolith' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'audit', label: 'Audit Trail' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Inkloom AI
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono tabular-nums bg-amber-100 text-amber-800 rounded-sm">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 -mb-5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + role switch context */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-md border border-slate-200 transition-colors whitespace-nowrap"
                title="Switch active user role for testing"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-slate-900">{currentUser.name.split(' ')[0]}</span>
                <span className="text-slate-400 capitalize">({currentUser.role})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{org.name}</p>
                      <p className="text-[11px] text-slate-500">{org.industry}</p>
                    </div>

                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Role (RBAC)
                    </div>

                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onSwitchUser(member);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                          currentUser.id === member.id ? 'bg-indigo-50/70 text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${currentUser.id === member.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{member.role} · {member.title}</p>
                        </div>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('settings');
                        }}
                        className="w-full px-3 py-1.5 text-left text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        Settings & Governance Config
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* AI Advisor Chatbot Trigger */}
            {onToggleChat && (
              <button
                onClick={onToggleChat}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                title="Open Brand Governance AI Advisor"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">AI Advisor</span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate('review-workspace')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 active:scale-98 transition-all shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review Content</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
