/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, TabType } from './components/Header';
import { MarkdownViewer } from './components/MarkdownViewer';
import { LlmSpecViewer } from './components/LlmSpecViewer';
import { ApiCatalog } from './components/ApiCatalog';
import { CodeGenerator } from './components/CodeGenerator';
import { RulesAndDictionary } from './components/RulesAndDictionary';
import { ShieldCheck, Download } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('markdown');
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    try {
      const resp = await fetch('/PADEG_DOCUMENTATION_LLM.md');
      const text = await resp.text();
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      setCopiedAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCopyAllMarkdown={handleCopyAll}
        copied={copiedAll}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'markdown' && (
          <MarkdownViewer markdownContent="" />
        )}

        {activeTab === 'llm' && (
          <LlmSpecViewer />
        )}

        {activeTab === 'catalog' && (
          <ApiCatalog />
        )}

        {activeTab === 'generator' && (
          <CodeGenerator />
        )}

        {activeTab === 'rules' && (
          <RulesAndDictionary />
        )}

        {activeTab === 'dictionaries' && (
          <RulesAndDictionary />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">Padeg.dll v4.1 Documentation & LLM Specification</span>
            <span className="mx-2">•</span>
            <span>Авторы: Покаташкин Г.Л., Плахов С.В.</span>
            <span className="mx-2">•</span>
            <span>PadegUC.dll / PadegUCA.dll / PadegFB.dll</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Подтверждено для v4.1
            </span>
            <a
              href="/PADEG_DOCUMENTATION_LLM.md"
              download="PADEG_DOCUMENTATION_LLM.md"
              className="hover:text-sky-700 underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать PADEG_DOCUMENTATION_LLM.md
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
