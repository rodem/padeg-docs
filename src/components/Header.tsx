import React from 'react';
import { BookOpen, Cpu, Code, BookCheck, Database, Download, Copy, Check } from 'lucide-react';

export type TabType = 'markdown' | 'llm' | 'catalog' | 'generator' | 'rules' | 'dictionaries';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onCopyAllMarkdown: () => void;
  copied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onCopyAllMarkdown,
  copied,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'markdown', label: 'Документация MD', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'llm', label: 'LLM-Спецификация (JSON)', icon: <Cpu className="w-4 h-4" />, badge: 'AI Ready' },
    { id: 'catalog', label: 'Каталог API (21 функция)', icon: <Code className="w-4 h-4" /> },
    { id: 'generator', label: 'Генератор кода', icon: <Database className="w-4 h-4" /> },
    { id: 'rules', label: 'Правила склонения', icon: <BookCheck className="w-4 h-4" /> },
    { id: 'dictionaries', label: 'Словари (Except / Currency)', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              P4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Padeg.dll <span className="text-sky-600 font-semibold text-base">v4.1</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Unicode & 64-bit
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200 hidden sm:inline">
                  PadegUC / PadegUCA / PadegFB
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Склонение ФИО, должностей, подразделений, валют и сумм прописью (Покаташкин Г.Л., Плахов С.В.)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onCopyAllMarkdown}
              id="copy-markdown-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs"
              title="Скопировать весь Markdown в буфер обмена"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать .MD'}</span>
            </button>
            <a
              href="/PADEG_DOCUMENTATION_LLM.md"
              download="PADEG_DOCUMENTATION_LLM.md"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 transition shadow-2xs"
              title="Скачать файл PADEG_DOCUMENTATION_LLM.md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать MD</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 py-1 no-scrollbar border-t border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                id={`tab-btn-${tab.id}`}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors relative ${
                  isActive
                    ? 'text-sky-700 bg-sky-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-indigo-100 text-indigo-700">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-sky-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
