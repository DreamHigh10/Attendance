import React, { useState, useEffect, useRef } from 'react';
import { 
  MessagesSquare, 
  Send, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Users, 
  Smile, 
  Flame, 
  Lightbulb, 
  Rocket, 
  Heart, 
  ThumbsUp, 
  Search, 
  Hash, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  LogOut,
  UserCheck
} from 'lucide-react';
import { Student, Cohort, LoungeMessage } from '../../types';
import { api } from '../../services/api';
import { firebaseDb } from '../../services/firebase';
import { DreamTeamLogo } from '../common/DreamTeamLogo';

interface DreamersLoungeProps {
  cohort?: Cohort;
  currentEmail?: string;
  currentUser?: { email: string; name: string; photoURL?: string; isGoogleAuth?: boolean } | null;
  registeredStudents: Student[];
  onEmailVerified?: (email: string) => void;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'ogungbadekehinde19@gmail.com',
  'aduoluwaseyi33@gmail.com',
  'paulstanleytobechukwu01@gmail.com',
  'chiemelab166@gmail.com',
  'munachimsomoses04@gmail.com',
];

const CHANNELS = [
  { id: 'all', name: 'All Conversations', icon: MessagesSquare },
  { id: 'general', name: 'General Lounge', icon: Hash },
  { id: 'projects', name: 'Projects & Innovation', icon: Rocket },
  { id: 'insights', name: 'Class Takeaways', icon: Lightbulb },
  { id: 'help', name: 'Questions & Help', icon: MessageCircle },
];

const QUICK_REACTIONS = ['🔥', '💡', '🚀', '❤️', '👏'];

export const DreamersLounge: React.FC<DreamersLoungeProps> = ({
  cohort,
  currentEmail = '',
  currentUser,
  registeredStudents = [],
  onEmailVerified,
}) => {
  // Gate authentication state
  const [verifiedEmail, setVerifiedEmail] = useState<string>(() => {
    if (currentUser?.email) return currentUser.email.toLowerCase();
    if (currentEmail) return currentEmail.toLowerCase();
    try {
      return localStorage.getItem('dtp_lounge_verified_email') || '';
    } catch {
      return '';
    }
  });

  const [emailInput, setEmailInput] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<LoungeMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper to determine if an email is registered or authorized
  const checkEmailAuthorization = (email: string): { isAuthorized: boolean; studentName: string; isFacilitator: boolean } => {
    const clean = email.trim().toLowerCase();
    const isAdmin = AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
    const matched = registeredStudents.find((s) => s.email.toLowerCase() === clean);

    if (matched) {
      return { isAuthorized: true, studentName: matched.name, isFacilitator: false };
    }
    if (isAdmin) {
      return { 
        isAuthorized: true, 
        studentName: currentUser?.name || 'Dream Team Facilitator', 
        isFacilitator: true 
      };
    }
    return { isAuthorized: false, studentName: '', isFacilitator: false };
  };

  // Derive current verified member's display name (ONLY name, no email exposed)
  const authInfo = verifiedEmail ? checkEmailAuthorization(verifiedEmail) : { isAuthorized: false, studentName: '', isFacilitator: false };
  const isUnlocked = Boolean(verifiedEmail && authInfo.isAuthorized);
  const myDisplayName = authInfo.studentName || currentUser?.name || 'Dreamer';

  // Synchronize when parent passed currentEmail changes
  useEffect(() => {
    if (currentUser?.email) {
      const check = checkEmailAuthorization(currentUser.email);
      if (check.isAuthorized) {
        setVerifiedEmail(currentUser.email.toLowerCase());
        try { localStorage.setItem('dtp_lounge_verified_email', currentUser.email.toLowerCase()); } catch {}
      }
    } else if (currentEmail && !verifiedEmail) {
      const check = checkEmailAuthorization(currentEmail);
      if (check.isAuthorized) {
        setVerifiedEmail(currentEmail.toLowerCase());
        try { localStorage.setItem('dtp_lounge_verified_email', currentEmail.toLowerCase()); } catch {}
      }
    }
  }, [currentUser, currentEmail, registeredStudents]);

  // Initial messages load & Real-time Firestore subscription (ONLY for authorized admins & cohort members)
  useEffect(() => {
    if (!isUnlocked) {
      setMessages([]);
      return;
    }

    let unsubscribeFirestore = () => {};

    // Initial load from storage / api
    api.getLoungeMessages(cohort?.id).then((initialMsgs) => {
      if (initialMsgs && initialMsgs.length > 0) {
        setMessages(initialMsgs);
      }
    });

    // Real-time listener for authorized multi-user collaboration
    unsubscribeFirestore = firebaseDb.subscribeToLoungeMessages(cohort?.id, (liveMsgs) => {
      if (liveMsgs && liveMsgs.length > 0) {
        setMessages(liveMsgs);
      }
    });

    return () => {
      unsubscribeFirestore();
    };
  }, [cohort?.id, isUnlocked]);

  // Auto scroll to latest message on update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, activeChannel]);

  // Handle gate email verification
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const clean = emailInput.trim().toLowerCase();

    if (!clean || !clean.includes('@')) {
      setGateError('Please enter a valid email address.');
      return;
    }

    setIsVerifying(true);
    const auth = checkEmailAuthorization(clean);

    if (auth.isAuthorized) {
      setVerifiedEmail(clean);
      try {
        localStorage.setItem('dtp_lounge_verified_email', clean);
      } catch {}
      if (onEmailVerified) onEmailVerified(clean);
      setEmailInput('');
      setGateError(null);
    } else {
      setGateError(
        `Access Restricted: "${clean}" is not found on the Cohort 2 register. Only registered students and facilitators can access the Dreamers Lounge.`
      );
    }
    setIsVerifying(false);
  };

  const handleLeaveLoungeSession = () => {
    setVerifiedEmail('');
    try {
      localStorage.removeItem('dtp_lounge_verified_email');
    } catch {}
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || !isUnlocked) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const channel = activeChannel === 'all' ? 'general' : activeChannel;
      const newMsg = await api.sendLoungeMessage({
        cohortId: cohort?.id || 'dtp-cohort-2',
        studentName: myDisplayName, // ONLY Name is exposed
        studentEmail: verifiedEmail,
        message: textToSend,
        channel,
        isFacilitator: authInfo.isFacilitator,
      });

      // Optimistic update
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle emoji reaction
  const handleReact = async (messageId: string, emoji: string) => {
    if (!isUnlocked) return;
    try {
      const updated = await api.reactToLoungeMessage(messageId, emoji, myDisplayName);
      if (updated) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    const matchesChannel = activeChannel === 'all' || m.channel === activeChannel;
    const matchesSearch = !searchQuery.trim() || 
      m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  // GATED ACCESS CARD (Shown if user is not verified in roster)
  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md text-center transition-colors">
          {/* Top Radiant Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

          <DreamTeamLogo size="lg" showText={false} className="justify-center mb-4" />

          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mx-auto mb-4 ring-8 ring-indigo-50 dark:ring-indigo-950/40">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <span className="inline-block px-3.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            Restricted Access &bull; Admins &amp; Cohort Members Only
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            The Dreamers Lounge
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1 mb-6 max-w-md mx-auto">
            Only Dream Team Admins and registered {cohort?.name || 'Cohort 2'} members are authorized to view chat conversations and participate in discussions.
          </p>

          {/* Gating Error Notice */}
          {gateError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-start gap-3 text-left animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black mb-0.5">Verification Required</strong>
                <span>{gateError}</span>
              </div>
            </div>
          )}

          {/* Email Gating Verification Form */}
          <form onSubmit={handleVerifyEmail} className="space-y-4 max-w-md mx-auto text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Enter Your Registered Cohort Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. member@dreamteam.org"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                🔒 Access is strictly verified against the official registered cohort roster. Once unlocked, only your <strong>Name</strong> will be visible in the chat.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !emailInput.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Membership...</span>
                </>
              ) : (
                <>
                  <span>Enter Dreamers Lounge</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Roster counter info */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{registeredStudents.length > 0 ? `${registeredStudents.length} Registered Members Eligible` : 'Official Cohort Roster Active'}</span>
          </div>

        </div>
      </div>
    );
  }

  // UNLOCKED LOUNGE CHAT INTERFACE
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-4 animate-fade-in pb-28">
      
      {/* Lounge Header Card */}
      <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 flex-shrink-0">
              <MessagesSquare className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Dreamers Lounge &bull; Live
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Member
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Cohort 2 Collaboration Hub
              </h3>
            </div>
          </div>

          {/* Current User Identity (Only Name Shown, Privacy Guard) */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              {myDisplayName.charAt(0)}
            </div>

            <div className="text-left text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Posting As</span>
              <p className="font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                {myDisplayName}
              </p>
            </div>

            <button
              onClick={handleLeaveLoungeSession}
              title="Sign Out of Lounge"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Channel Switcher & Search Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 pl-8 focus:outline-none focus:border-indigo-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative min-h-[420px] max-h-[600px] flex flex-col justify-between transition-colors">
        
        {/* Messages List Area */}
        <div className="overflow-y-auto space-y-4 pr-1 mb-4 flex-1 max-h-[460px]">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-3">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
              <p className="font-bold text-sm">No messages in this channel yet.</p>
              <p className="text-xs max-w-sm mx-auto">
                Be the first to share a breakthrough, start a discussion, or ask a question!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMine = msg.studentName === myDisplayName;
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group transition-all ${
                    isMine ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm ${
                      msg.isFacilitator
                        ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white'
                        : isMine
                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {msg.studentName.charAt(0).toUpperCase()}
                  </div>

                  {/* Message Bubble & Meta */}
                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isMine ? 'items-end text-right' : 'items-start text-left'}`}>
                    
                    {/* Header: ONLY Name, Badge, Time (NO Email) */}
                    <div className={`flex items-center gap-2 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {msg.studentName}
                      </span>

                      {msg.isFacilitator && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded-md">
                          Facilitator
                        </span>
                      )}

                      {msg.channel && msg.channel !== 'general' && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded-md">
                          #{msg.channel}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all text-left ${
                        isMine
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>

                    {/* Reactions Bar */}
                    <div className={`flex items-center gap-1.5 pt-0.5 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {hasReactions &&
                        Object.entries(msg.reactions || {}).map(([emoji, count]) => {
                          const reactedByMe = msg.userReactions?.[emoji]?.includes(myDisplayName);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg.id, emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                reactedByMe
                                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 scale-105'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{count}</span>
                            </button>
                          );
                        })}

                      {/* Quick React Picker Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          title="Add Reaction"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity cursor-pointer"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>

                        {showEmojiPicker === msg.id && (
                          <div className="absolute bottom-6 left-0 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl p-1.5 flex items-center gap-1 animate-fade-in">
                            {QUICK_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  handleReact(msg.id, emoji);
                                  setShowEmojiPicker(null);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm transition-transform hover:scale-125 cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  activeChannel === 'all'
                    ? `Share a thought in General Lounge as ${myDisplayName}...`
                    : `Post in #${activeChannel} as ${myDisplayName}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 pr-20"
              />

              {/* Quick Emojis inside input */}
              <div className="absolute right-3 top-2.5 flex items-center gap-1">
                {['🔥', '🚀', '💡'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setInputText((prev) => prev + em)}
                    className="hover:scale-125 transition-transform text-xs cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer hover:scale-105 active:scale-95"
            >
              {isSending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
            <span>Press Enter to send &bull; Registered Cohort Members Only</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              Posting publicly as: <strong>{myDisplayName}</strong> (Email private)
            </span>
          </div>
        </form>

      </div>

    </div>
  );
};
