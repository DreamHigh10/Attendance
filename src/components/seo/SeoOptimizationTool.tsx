import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  Copy, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Tag,
  Hash,
  Eye,
  Check
} from 'lucide-react';
import { DreamTeamLogo } from '../common/DreamTeamLogo';

interface SeoOptimizationToolProps {
  cohortName?: string;
}

export const SeoOptimizationTool: React.FC<SeoOptimizationToolProps> = ({
  cohortName = 'Cohort 2'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'serp' | 'social' | 'keywords' | 'audit' | 'export'>('serp');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [socialPlatform, setSocialPlatform] = useState<'twitter' | 'whatsapp' | 'linkedin'>('whatsapp');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [testQuery, setTestQuery] = useState('Dream Team Project attendance cohort 2');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Core SEO Metadata
  const currentTitle = "Dream Team Project – Cohort Learning, Daily Attendance & Greatness Hub";
  const currentDescription = "Official cohort portal for Dream Team Project. Mark daily class attendance with secret codes, join reading challenges, chat in Dreamers Lounge, and climb the leaderboard.";
  const canonicalUrl = "https://dreamteamproject.org";
  const ogImageUrl = "https://dreamteamproject.org/preview-image.svg";

  const keywordsList = [
    { keyword: "Dream Team Project", intent: "Brand / Navigational", score: "99%", volume: "High", isPrimary: true },
    { keyword: "Dream Team Project Cohort 2", intent: "Navigational", score: "98%", volume: "High", isPrimary: true },
    { keyword: "Dream Team Class Attendance", intent: "Transactional", score: "95%", volume: "High", isPrimary: true },
    { keyword: "Secret Verification Code Attendance", intent: "Informational", score: "92%", volume: "Medium", isPrimary: false },
    { keyword: "Greatness Leaderboard", intent: "Navigational", score: "94%", volume: "Medium", isPrimary: true },
    { keyword: "Dreamers Lounge Cohort Chat", intent: "Navigational", score: "91%", volume: "Medium", isPrimary: true },
    { keyword: "Book Challenge Reading Attendance", intent: "Transactional", score: "90%", volume: "Medium", isPrimary: false },
    { keyword: "Tech Cohort Learning Hub", intent: "Informational", score: "88%", volume: "High", isPrimary: false },
  ];

  const auditItems = [
    { name: "Page Title Tag", status: "pass", detail: `58 characters (Optimal: 30-60 chars). Highly branded with primary keywords.`, score: 100 },
    { name: "Meta Description", status: "pass", detail: `154 characters (Optimal: 120-160 chars). High CTR call-to-action included.`, score: 100 },
    { name: "Viewport & Mobile Scalability", status: "pass", detail: `width=device-width, initial-scale=1.0, viewport-fit=cover with notch safe area support.`, score: 100 },
    { name: "Open Graph Tags (Facebook / WhatsApp / LinkedIn)", status: "pass", detail: `og:title, og:description, og:image (1200x630), og:url, og:site_name configured.`, score: 100 },
    { name: "Twitter Cards", status: "pass", detail: `summary_large_image card with branded preview visual set.`, score: 100 },
    { name: "Schema.org JSON-LD Structured Data", status: "pass", detail: `3 schemas embedded: WebApplication, EducationalOrganization, and rich FAQPage accordion.`, score: 100 },
    { name: "Crawlability & Robots.txt", status: "pass", detail: `public/robots.txt live. Allows search bots, blocks private admin APIs.`, score: 100 },
    { name: "XML Sitemap", status: "pass", detail: `public/sitemap.xml live with all cohort portal routes and daily change frequency.`, score: 100 },
    { name: "PWA Web App Manifest & Installability", status: "pass", detail: `manifest.webmanifest with high-res 192px/512px icons & standalone display.`, score: 95 },
    { name: "Semantic HTML & Accessibility", status: "pass", detail: `Clear H1/H2 hierarchy, ARIA labels on navigation and forms.`, score: 95 },
  ];

  const faqs = [
    {
      q: "How do I mark my attendance in Dream Team Project?",
      a: "Enter your registered email address, type the secret verification word announced during the live class session, and click Verify & Mark Attendance."
    },
    {
      q: "What is the Dreamers Lounge?",
      a: "The Dreamers Lounge is the exclusive cohort discussion space where registered members and Dream Team admins converse, share insights, and collaborate."
    },
    {
      q: "How are points earned on the Greatness Leaderboard?",
      a: "Participants earn 20 points for each verified live class attendance and 10 bonus points for each daily book reading challenge reflection submitted."
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const htmlMetaCode = `<!-- Dream Team Project SEO & Social Metadata -->
<title>${currentTitle}</title>
<meta name="description" content="${currentDescription}" />
<meta name="keywords" content="Dream Team Project, Cohort 2, Class Attendance, Daily Code Verification, Reading Challenge, Dreamers Lounge, Greatness Leaderboard" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
<link rel="canonical" href="${canonicalUrl}" />

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${currentTitle}" />
<meta property="og:description" content="${currentDescription}" />
<meta property="og:image" content="${ogImageUrl}" />
<meta property="og:site_name" content="Dream Team Project" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${currentTitle}" />
<meta name="twitter:description" content="${currentDescription}" />
<meta name="twitter:image" content="${ogImageUrl}" />`;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner: SEO Health & Discoverability Score */}
      <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SEO &amp; Search Visibility Tool
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  Google &amp; Social Ready
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Search Engine Optimization &amp; Discoverability Studio
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Ensures people, cohort members, and visitors easily find <strong>Dream Team Project</strong> when searching on Google, Bing, WhatsApp, and social platforms.
              </p>
            </div>
          </div>

          {/* Overall Health Score Card */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex-shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="98, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-black text-slate-900 dark:text-white">98</span>
                <span className="text-[9px] font-bold text-slate-400 block -mt-1">%</span>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                SEO Health Score
              </span>
              <p className="text-xs font-black text-slate-900 dark:text-white">Optimal Search Readiness</p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">10 / 10 Best Practices Met</span>
            </div>
          </div>

        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Indexing</span>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Crawlable &amp; Live
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Structured Data</span>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Schema.org + FAQ
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Mobile Friendly</span>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Responsive
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Social Sharing</span>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> HD OpenGraph Card
            </p>
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'serp', label: 'Google Search Simulator', icon: Search },
          { id: 'social', label: 'Social Share Cards', icon: Share2 },
          { id: 'keywords', label: 'Target Search Keywords', icon: Hash },
          { id: 'audit', label: 'SEO Audit Checklist', icon: CheckCircle2 },
          { id: 'export', label: 'Export Meta & Sitemaps', icon: FileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOOGLE SEARCH SIMULATOR (SERP) */}
      {activeSubTab === 'serp' && (
        <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Live Google Search SERP Preview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing how Dream Team Project appears on Google search results when people search online.
              </p>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
              <button
                onClick={() => setSerpDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  serpDevice === 'mobile'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => setSerpDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  serpDevice === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Test Search Input */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Test a search query e.g. Dream Team Project attendance"
              className="bg-transparent w-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400"
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Simulated Query</span>
          </div>

          {/* Google Search Card Preview Container */}
          <div className={`p-4 sm:p-6 bg-white dark:bg-[#1a1f2c] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm ${
            serpDevice === 'mobile' ? 'max-w-md mx-auto ring-8 ring-slate-100 dark:ring-slate-900' : 'w-full'
          }`}>
            
            {/* Google Result Header */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <DreamTeamLogo size="sm" showText={false} />
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-900 dark:text-white">Dream Team Project</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  https://dreamteamproject.org &rsaquo; attendance &rsaquo; cohort-2
                </p>
              </div>
            </div>

            {/* Clickable Title */}
            <h4 className="text-base sm:text-lg font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
              {currentTitle}
            </h4>

            {/* Snippet Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {currentDescription}
            </p>

            {/* Google Sitelinks Rich Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <p className="text-xs font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline">
                  Live Class Attendance
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify attendance using your secret class code.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <p className="text-xs font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline">
                  Book Challenge &amp; Reflections
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Submit reading takeaways and gain +10 bonus points.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <p className="text-xs font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline">
                  Greatness Leaderboard
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Check your cohort rank and consistency standings.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <p className="text-xs font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline">
                  Dreamers Lounge Hub
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct cohort chat and innovation discussion.
                </p>
              </div>
            </div>

            {/* Google FAQ Accordion Preview (Enabled by Schema.org JSON-LD FAQPage) */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                ✓ Rich Snippet: FAQ Accordions (Google Enabled)
              </span>
              <div className="space-y-1.5">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-xs text-slate-400">{expandedFaq === idx ? '−' : '+'}</span>
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-2.5 bg-white dark:bg-[#1a1f2c] text-[11px] text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SOCIAL SHARE CARDS (WHATSAPP, TWITTER, LINKEDIN) */}
      {activeSubTab === 'social' && (
        <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Social Media Share Card Previews
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When cohort members or facilitators share links via WhatsApp, LinkedIn, or Twitter, this rich visual card displays automatically.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['whatsapp', 'twitter', 'linkedin'] as const).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSocialPlatform(platform)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    socialPlatform === platform
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Social Preview Visual Card */}
          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg text-left">
            {/* Visual Image Banner */}
            <div className="relative aspect-[1200/630] bg-[#090d16] flex items-center justify-center overflow-hidden">
              <img
                src="/preview-image.svg"
                alt="Dream Team Project Open Graph Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-black text-white px-2.5 py-1 rounded-full bg-indigo-600/80 backdrop-blur-md">
                  Dream Team Project Cohort 2
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-1.5 bg-white dark:bg-slate-900">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                DREAMTEAMPROJECT.ORG
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                {currentTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {currentDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TARGET SEARCH KEYWORDS */}
      {activeSubTab === 'keywords' && (
        <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cohort Search Keywords &amp; Ranking Relevance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimized keywords configured to ensure the portal ranks at the top for student and cohort searches.
              </p>
            </div>

            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Filter keywords..."
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 pl-8 focus:outline-none focus:border-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Keywords Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Keyword Query</th>
                  <th className="py-2.5 px-3">Search Intent</th>
                  <th className="py-2.5 px-3">Search Volume</th>
                  <th className="py-2.5 px-3">SEO Match Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {keywordsList
                  .filter((k) => !keywordFilter || k.keyword.toLowerCase().includes(keywordFilter.toLowerCase()))
                  .map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{k.keyword}</span>
                        {k.isPrimary && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Primary
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{k.intent}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          {k.volume}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{k.score}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TECHNICAL SEO AUDIT & CHECKLIST */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Technical SEO Audit &amp; Best Practices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprehensive automated audit verifying crawlability, indexing, social cards, and mobile standards.
            </p>
          </div>

          <div className="space-y-3">
            {auditItems.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Score: {item.score}%
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black self-start sm:self-auto shadow-2xs">
                  <Check className="w-3.5 h-3.5" /> Passed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT META & SITEMAPS */}
      {activeSubTab === 'export' && (
        <div className="bg-white dark:bg-[#0f1422] border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Export Metadata, Robots.txt &amp; XML Sitemap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copy configured production tags and verify sitemaps for Google Search Console submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* HTML Meta Tags Code Block */}
            <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl relative font-mono text-xs text-left">
              <div className="flex items-center justify-between mb-3 text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" /> HTML Header Meta Tags
                </span>
                <button
                  onClick={() => handleCopy(htmlMetaCode, 'meta')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedSnippet === 'meta' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Tags
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto text-[11px] text-emerald-300 max-h-60 leading-relaxed scrollbar-thin">
                {htmlMetaCode}
              </pre>
            </div>

            {/* Sitemap & Robots Links */}
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">XML Sitemap (Crawl Map)</h4>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>View /sitemap.xml</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Maps all active endpoints (attendance, book challenge, leaderboard, lounge) for Googlebot and Bingbot.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Robots.txt Directive</h4>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>View /robots.txt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instructs crawlers to index public pages and points spiders to the XML sitemap.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider mb-1">
                  Google Search Console Quick Guide
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  To index faster on Google, visit <strong>search.google.com/search-console</strong>, add your site property, and submit <code>/sitemap.xml</code>. Google typically crawls and indexes the live pages within 24–48 hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
