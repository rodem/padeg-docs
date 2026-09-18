import React, { useState } from 'react';
import { PADEG_FUNCTIONS, PadegFunction } from '../data/padegDocs';
import { Search, Copy, Check, Filter, ArrowRight, Code2 } from 'lucide-react';

export const ApiCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<PadegFunction>(PADEG_FUNCTIONS[0]);
  const [codeSyntax, setCodeSyntax] = useState<'pascal' | 'cpp' | 'csharp' | 'com' | 'firebird'>('pascal');

  const categories = [
    { id: 'all', label: 'Все функции', count: PADEG_FUNCTIONS.length },
    { id: 'fio', label: 'Склонение ФИО', count: PADEG_FUNCTIONS.filter((f) => f.category === 'fio').length },
    { id: 'appointment', label: 'Должности и подразделения', count: PADEG_FUNCTIONS.filter((f) => f.category === 'appointment').length },
    { id: 'nominative', label: 'Восстановление падежа', count: PADEG_FUNCTIONS.filter((f) => f.category === 'nominative').length },
    { id: 'numerals', label: 'Числительные и валюты', count: PADEG_FUNCTIONS.filter((f) => f.category === 'numerals').length },
    { id: 'service', label: 'Сервисные функции', count: PADEG_FUNCTIONS.filter((f) => f.category === 'service').length },
    { id: 'dictionary', label: 'Словарь исключений', count: PADEG_FUNCTIONS.filter((f) => f.category === 'dictionary').length },
  ];

  const filteredFunctions = PADEG_FUNCTIONS.filter((fn) => {
    const matchesCategory = selectedCategory === 'all' || fn.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      fn.name.toLowerCase().includes(q) ||
      (fn.alias && fn.alias.toLowerCase().includes(q)) ||
      fn.summary.toLowerCase().includes(q) ||
      fn.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSignatureForSyntax = (fn: PadegFunction) => {
    switch (codeSyntax) {
      case 'pascal':
        return fn.pascalSignature;
      case 'cpp':
        return fn.cppSignature;
      case 'csharp':
        return fn.csharpSignature;
      case 'com':
        return fn.comSignature || '// Метод COM не применим для данной функции';
      case 'firebird':
        return fn.firebirdUdf || '-- UDF для Firebird не объявлена для данной функции';
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск функции (напр. GetFIOPadegFSAS, DeclCurrency, NumberToString)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} <span className="opacity-75">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: List on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Function List */}
        <div className="lg:col-span-5 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredFunctions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              Функции по запросу не найдены.
            </div>
          ) : (
            filteredFunctions.map((fn) => {
              const isSelected = selectedFunction.id === fn.id;
              return (
                <div
                  key={fn.id}
                  onClick={() => setSelectedFunction(fn)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-slate-900">{fn.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wider bg-slate-100 text-slate-600">
                      {fn.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{fn.summary}</p>
                  {fn.alias && (
                    <div className="mt-1 text-[11px] text-slate-400 font-mono">Алиас: {fn.alias}</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Function Details */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 font-mono">{selectedFunction.name}</h3>
                {selectedFunction.alias && (
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                    {selectedFunction.alias}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">{selectedFunction.description}</p>
            </div>
            <button
              onClick={() => copyCode(selectedFunction.pascalSignature, selectedFunction.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 text-slate-700 transition self-start sm:self-auto"
            >
              {copiedId === selectedFunction.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedId === selectedFunction.id ? 'Скопировано' : 'Сигнатура'}</span>
            </button>
          </div>

          {/* Syntax Toggle & Code View */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Сигнатура объявления</span>
              </div>
              <div className="flex gap-1 text-[11px]">
                {(['pascal', 'cpp', 'csharp', 'com', 'firebird'] as const).map((syntax) => (
                  <button
                    key={syntax}
                    onClick={() => setCodeSyntax(syntax)}
                    className={`px-2 py-0.5 rounded font-medium uppercase transition ${
                      codeSyntax === syntax
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {syntax}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-lg font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
              <pre>{getSignatureForSyntax(selectedFunction)}</pre>
            </div>
          </div>

          {/* Parameters Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Параметры функции</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Параметр</th>
                    <th className="p-2.5">Тип</th>
                    <th className="p-2.5">Напр.</th>
                    <th className="p-2.5">Описание</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedFunction.parameters.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono font-semibold text-sky-800">{p.name}</td>
                      <td className="p-2.5 font-mono text-slate-600 text-[11px]">{p.type}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            p.direction === 'in'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : p.direction === 'out'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {p.direction}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 leading-normal">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Return & Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-semibold text-slate-800 mb-1">Возвращаемое значение</div>
              <div className="text-slate-600 leading-relaxed">{selectedFunction.returns}</div>
            </div>
            <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-lg">
              <div className="font-semibold text-sky-900 mb-1">Пример вызова и результат</div>
              <div className="font-mono text-[11px] text-slate-700 mb-1">{selectedFunction.example.code}</div>
              <div className="flex items-center gap-1.5 text-sky-800 font-semibold">
                <ArrowRight className="w-3 h-3" />
                <span>{selectedFunction.example.output}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
