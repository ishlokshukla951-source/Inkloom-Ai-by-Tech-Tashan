import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: Wordmark + Mobile/Tablet Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Hamburger Toggle for < xl screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  Inkloom AI
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links (for xl+ screens) */}
          <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-[13px] 2xl:text-sm font-medium shrink-0">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
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

          {/* Zone 3: Actions + User context */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* User & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 text-xs text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-md border border-slate-200 transition-colors whitespace-nowrap"
                title="Switch active user role"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-slate-900 hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 shrink-0"
                title="Open Brand Governance AI Advisor"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">AI Advisor</span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate('review-workspace')}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 active:scale-98 transition-all shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Review Content</span>
              <span className="sm:hidden">Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer (below < xl) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-sm px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-1">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono tabular-nums bg-amber-100 text-amber-800 rounded-sm ml-1">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
