import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Sliders,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [modelType, setModelType] = useState<'general' | 'complex' | 'fast'>('general');
  const [rolePreset, setRolePreset] = useState<
    'counsel' | 'copy_coach' | 'regulatory'
  >('counsel');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      text: `Hello ${currentUser.name.split(' ')[0]}. I am your Inkloom Brand Governance AI Advisor.

I can help you review draft copy, suggest compliant alternatives for sensitive claims, verify mandatory disclaimers, or answer questions about your organization's brand voice.

What content or brand guidelines would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const roleConfigs = {
    counsel: {
      name: 'Brand Governance Counsel',
      instruction:
        'You are the Chief Brand Governance Counsel. Your goal is to safeguard institutional credibility by identifying unverified promotional claims, prohibited terminology, and mandatory disclaimers. Give actionable, concise revisions.',
    },
    copy_coach: {
      name: 'Editorial Voice Coach',
      instruction:
        'You are the Senior Editorial Voice Coach. You refine draft headlines and copy to be authoritative, clear, and engaging without resorting to marketing buzzwords, clickbait, or passive voice.',
    },
    regulatory: {
      name: 'Regulatory Risk Specialist',
      instruction:
        'You are a Regulatory & Legal Risk Specialist. You ensure marketing, investor relations, and security announcements adhere to strict compliance guidelines and include appropriate performance disclaimers.',
    },
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, text: m.text })),
          systemInstruction: roleConfigs[rolePreset].instruction,
          model: modelType,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || (modelType === 'complex' ? 'gemini-4-argon' : modelType === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: `[Advisor]: Brand governance scan advises ensuring that all marketing claims are verifiable, preferred terminology is maintained, and mandatory performance disclaimers are present.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.8-flash',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How do I rephrase a "100% guarantee" claim legally?',
    'What disclaimer is mandatory when citing ROI numbers?',
    'Review my headline: "The world\'s most unrivaled AI solution"',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 text-xs">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Brand Governance AI Advisor</h3>
            <p className="text-[11px] text-slate-500">Multi-turn consultative policy assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role & Model Controls Strip */}
      <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        {/* Role Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Persona:</span>
          <select
            value={rolePreset}
            onChange={(e) => setRolePreset(e.target.value as any)}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-medium focus:ring-1 focus:ring-indigo-600"
          >
            <option value="counsel">Governance Counsel</option>
            <option value="copy_coach">Editorial Voice Coach</option>
            <option value="regulatory">Regulatory Specialist</option>
          </select>
        </div>

        {/* Gemini Model Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Model:</span>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as any)}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-mono text-[11px] font-medium focus:ring-1 focus:ring-indigo-600"
          >
            <option value="complex">gemini-4-argon (Complex)</option>
            <option value="general">gemini-3.8-flash (General)</option>
            <option value="fast">gemini-3.1-flash-lite (Fast)</option>
          </select>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-xl p-3.5 leading-relaxed text-xs space-y-1.5 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-2xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`flex items-center justify-between text-[10px] font-mono tabular-nums pt-1 ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span>{msg.modelUsed}</span>}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl rounded-bl-none text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-mono">Consulting {modelType === 'complex' ? 'gemini-4-argon' : modelType === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'}...</span>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-1.5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Suggested Inquiries
        </div>
        <div className="flex flex-col gap-1">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-left text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors truncate"
            >
              → {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask the ${roleConfigs[rolePreset].name}...`}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600 text-xs"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors shadow-2xs flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
