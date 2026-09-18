import React, { useState } from 'react';
import { Copy, Check, Terminal, Sparkles, Database, FileJson, Layers } from 'lucide-react';
import { PADEG_FUNCTIONS, PADEG_CASES, RETURN_CODES, REGISTRY_CONFIG, DICTIONARY_SECTIONS, CURRENCY_SPEC } from '../data/padegDocs';

export const LlmSpecViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tools' | 'full_json' | 'prompt_template' | 'rules_data'>('tools');
  const [copied, setCopied] = useState(false);

  // 1. Tool Call Definition (OpenAPI / Function Calling format)
  const openAiTools = {
    tools: [
      {
        type: "function",
        function: {
          name: "padeg_decline_fio",
          description: "Склонение полного ФИО человека на русском языке в целевой падеж с помощью библиотеки Padeg v4.1",
          parameters: {
            type: "object",
            properties: {
              fio: {
                type: "string",
                description: "Полное ФИО в именительном падеже, например 'Иванов Иван Иванович'"
              },
              padeg: {
                type: "integer",
                enum: [1, 2, 3, 4, 5, 6],
                description: "Номер падежа: 1-Именительный, 2-Родительный, 3-Дательный, 4-Винительный, 5-Творительный, 6-Предложный"
              },
              sex: {
                type: "string",
                enum: ["auto", "male", "female"],
                default: "auto",
                description: "Пол: 'auto' (автоматически по отчеству), 'male' (мужской), 'female' (женский)"
              }
            },
            required: ["fio", "padeg"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "padeg_decline_full_appointment",
          description: "Согласованное склонение должности и подразделения/организации с устранением дублей слов",
          parameters: {
            type: "object",
            properties: {
              appointment: {
                type: "string",
                description: "Наименование должности или вид документа (например, 'Начальник цеха' или 'Постановление')"
              },
              office: {
                type: "string",
                description: "Наименование подразделения или органа (например, 'Цех нестандартного оборудования' или 'Совет Министров')"
              },
              padeg: {
                type: "integer",
                enum: [1, 2, 3, 4, 5, 6],
                description: "Номер целевого падежа (1..6)"
              }
            },
            required: ["appointment", "padeg"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "padeg_restore_nominative",
          description: "Восстановление исходной формы именительного падежа для ФИО, записанного в косвенном падеже",
          parameters: {
            type: "object",
            properties: {
              fio_in_case: {
                type: "string",
                description: "ФИО в косвенном падеже (например, 'Ивановым Иваном Ивановичем')"
              }
            },
            required: ["fio_in_case"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "padeg_decline_currency",
          description: "Склонение суммы и валюты прописью по стандарту ISO 4217 (RUB, USD, EUR, KZT)",
          parameters: {
            type: "object",
            properties: {
              amount: {
                type: "number",
                description: "Числовое значение суммы (например 123.45)"
              },
              currency_code: {
                type: "string",
                default: "RUB",
                description: "Символьный код валюты (RUB, USD, EUR, KZT, JPY)"
              },
              padeg: {
                type: "integer",
                enum: [1, 2, 3, 4, 5, 6],
                description: "Номер падежа"
              },
              form: {
                type: "integer",
                enum: [0, 1, 2],
                default: 0,
                description: "0: прописью без скобок, 1: в скобках, 2: цифры + пропись в скобках"
              }
            },
            required: ["amount", "padeg"]
          }
        }
      }
    ]
  };

  // 2. Full Structured JSON Knowledge Base
  const fullJsonData = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "PadegDllKnowledgeBase",
    version: "4.1",
    author: "Покаташкин Г.Л., Плахов С.В.",
    architecture: {
      binaries: [
        { file: "PadegUC.dll", type: "Native DLL", calling_convention: "stdcall", encoding: "Unicode UTF-16", bitness: ["x86", "x64"] },
        { file: "PadegUCA.dll", type: "COM / OLE Server + Native DLL", prog_id: "PadegUCA.Declension", string_type: "WideString (BSTR)" },
        { file: "PadegFB.dll", type: "Firebird UDF", calling_convention: "cdecl", encodings: ["UTF8", "WIN1251"] }
      ],
      memory_rule: "Caller must allocate pResult buffer (minimum length + 20 chars) and pass allocated capacity in nLen. Return code -3 indicates buffer overflow."
    },
    cases: PADEG_CASES,
    return_codes: RETURN_CODES,
    registry: REGISTRY_CONFIG,
    functions: PADEG_FUNCTIONS.map((fn) => ({
      id: fn.id,
      name: fn.name,
      category: fn.category,
      summary: fn.summary,
      pascal_signature: fn.pascalSignature,
      parameters: fn.parameters,
      returns: fn.returns,
      sample: fn.example
    })),
    exception_dictionary_sections: DICTIONARY_SECTIONS,
    currency_dictionary_format: CURRENCY_SPEC
  };

  // 3. System Prompt Template for LLM Agents
  const promptTemplate = `Вы — специализированный ассистент по морфологии русского языка и интеграции библиотеки Padeg.dll (v4.1).
При генерации кода для склонения ФИО, должностей, подразделений или валют строго соблюдайте следующие правила:

1. Библиотека PadegUC.dll использует строки Unicode (PChar / PWideChar, UTF-16) и соглашение stdcall.
2. Вызывающее приложение ОБЯЗАНО самостоятельно выделять буфер pResult под результат (длина исходного текста + 20 символов или не менее 255 символов) и передавать размер в переменную nLen.
3. Коды падежей (nPadeg): 1 = Именительный (форматирование), 2 = Родительный, 3 = Дательный, 4 = Винительный, 5 = Творительный, 6 = Предложный.
4. При работе через COM (PadegUCA.Declension) результат возвращается напрямую типом WideString, буфер передавать не нужно:
   - В 1С: Новый COMОбъект("PadegUCA.Declension").GetFIOPadegFS(ФИО, "", 3)
   - В VBA: CreateObject("PadegUCA.Declension").GetFIOPadegFS(cFIO, "", 3)
5. Для баз данных Firebird используйте библиотеку PadegFB.dll с соглашением cdecl (функции GETFIOPADEGFSAS, GETFULLAPPOINTMENTPADEG и др.).
6. Словарь исключений Except.dic имеет 15 секций. Маски со звездочкой (*ава, *их) разрешены только в первых шести секциях.`;

  const getActiveCode = () => {
    switch (activeSubTab) {
      case 'tools':
        return JSON.stringify(openAiTools, null, 2);
      case 'full_json':
        return JSON.stringify(fullJsonData, null, 2);
      case 'prompt_template':
        return promptTemplate;
      case 'rules_data':
        return JSON.stringify({ cases: PADEG_CASES, return_codes: RETURN_CODES, registry: REGISTRY_CONFIG }, null, 2);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Формат для LLM / AI-агентов</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Структурированная спецификация Padeg v4.1 для парсинга LLM
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Готовые схемы Function Calling (OpenAI / Gemini / Anthropic), JSON-представление полного API, справочники и системный промпт для безошибочной кодогенерации нейросетями.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition active:scale-95 shadow-sm self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать блок данных'}</span>
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'tools'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>OpenAPI / Function Tools JSON</span>
          </button>
          <button
            onClick={() => setActiveSubTab('full_json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'full_json'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Полный JSON-каталог API</span>
          </button>
          <button
            onClick={() => setActiveSubTab('prompt_template')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'prompt_template'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Системный промпт для LLM</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rules_data')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'rules_data'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Константы и перечисления JSON</span>
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-inner relative group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span>{activeSubTab === 'prompt_template' ? 'SYSTEM_PROMPT.txt' : 'SPECIFICATION.json'}</span>
          <span className="text-[11px] text-slate-500">JSON Schema Draft-07 / Validated</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[600px] leading-relaxed select-all">
          {getActiveCode()}
        </pre>
      </div>
    </div>
  );
};
