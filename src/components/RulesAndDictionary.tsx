import React, { useState } from 'react';
import { DICTIONARY_SECTIONS, CURRENCY_SPEC } from '../data/padegDocs';
import { BookOpen, CheckCircle, XCircle, Search, FileCode, Layers } from 'lucide-react';

export const RulesAndDictionary: React.FC = () => {
  const [subTab, setSubTab] = useState<'rules' | 'except' | 'currency'>('rules');
  const [dicSearch, setDicSearch] = useState('');

  const filteredSections = DICTIONARY_SECTIONS.filter(
    (sec) =>
      sec.name.toLowerCase().includes(dicSearch.toLowerCase()) ||
      sec.title.toLowerCase().includes(dicSearch.toLowerCase()) ||
      sec.description.toLowerCase().includes(dicSearch.toLowerCase()) ||
      sec.examples.some((ex) => ex.toLowerCase().includes(dicSearch.toLowerCase()))
  );

  return (
    <div className="py-6 space-y-6">
      {/* Tab Selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-md mx-auto text-xs font-semibold">
        <button
          onClick={() => setSubTab('rules')}
          className={`flex-1 py-2 rounded-lg transition ${
            subTab === 'rules' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Правила склонения
        </button>
        <button
          onClick={() => setSubTab('except')}
          className={`flex-1 py-2 rounded-lg transition ${
            subTab === 'except' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Словарь Except.dic (15 секций)
        </button>
        <button
          onClick={() => setSubTab('currency')}
          className={`flex-1 py-2 rounded-lg transition ${
            subTab === 'currency' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Справочник Currency.txt
        </button>
      </div>

      {/* Rules View */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do NOT decline */}
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-3 text-rose-800 font-bold text-base">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>НЕ склоняются в библиотеке</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Женские фамилии на согласный звук и мягкий знак:</strong> у Анны Жук, семья Марии Мицкевич, назначить Людмилу Коваль.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Женские имена на согласный звук:</strong> Кармен, Гюльчетай, Долорес, Элен, Суок, Эдит, Элизабет.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Иноязычные фамилии на гласный (кроме безударных -а, -я):</strong> Гюго, Бизе, Россини, Шоу, Неру, Гете, Бруно, Дюма, Золя.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Мужские и женские имена на гласный (кроме -а, -я):</strong> Серго, Нелли, Шота.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Фамилии на -а, -я с предшествующим -и:</strong> сонеты Эредиа, стихи Гарсиа, рассказы Гулиа.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Застывшие формы родительного падежа на -ово, -аго, -яго:</strong> Дурново, Сухово, Живаго, Шамбинаго; и множественного на <strong>-их, -ых</strong>: Седых, Польских, Крученых.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Украинские фамилии на -ко:</strong> Шевченко, Макаренко, Короленко, Ляшко.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Первая часть двойной фамилии</strong>, если она сама по себе не употребляется как фамилия (в роли Сквозняк-Дмухановского).
                </span>
              </li>
            </ul>
          </div>

          {/* DO decline */}
          <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-3 text-emerald-800 font-bold text-base">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>СКЛОНЯЮТСЯ в библиотеке</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Мужские фамилии и имена на согласный и мягкий знак:</strong> С.Я. Жука, Адама Мицкевича, Игоря Коваля.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Женские имена на мягкий знак:</strong> Любовь (Любови, Любовью), Юдифь.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Фамилии на безударные -а, -я:</strong> статья В.М. Птицы, творчество Яна Неруды, стихи Окуджавы.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Славянские фамилии на ударные -а, -я:</strong> у писателя Майбороды, с философом Сковородой.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Первая часть русских двойных фамилий:</strong> стихи Лебедева-Кумача, постановка Немировича-Данченко.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Иностранное имя перед фамилией на согласный:</strong> романы Жюля Верна, рассказы Марка Твена.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Польские и чешские женские фамилии на -а:</strong> склоняются по образцу русских на -ая (Бандровска-Турска → Бандровской-Турской).
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Except.dic View */}
      {subTab === 'except' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Структура словаря Except.dic</h4>
                <p className="text-xs text-slate-500">
                  Содержит 15 секций в INI-формате. В первых 6 секциях поддерживается символ маски <code className="font-mono text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-bold">*</code> (например, <code className="font-mono text-slate-700">*ава</code>).
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Фильтр секций или примеров..."
                  value={dicSearch}
                  onChange={(e) => setDicSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500/20 bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map((sec, idx) => (
              <div key={sec.name} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      [{sec.name}]
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Секция #{idx + 1}</span>
                  </div>
                  <h5 className="font-semibold text-slate-900 text-xs mt-1">{sec.title}</h5>
                  <p className="text-xs text-slate-600 leading-normal">{sec.description}</p>
                  {sec.caveats && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 mt-2">
                      ⚠️ {sec.caveats}
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Примеры:</div>
                  <div className="flex flex-wrap gap-1">
                    {sec.examples.map((ex) => (
                      <span key={ex} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ex}
                      </span>
                    ))}
                    {sec.supportsMask && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        Поддерживает *маски
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currency.txt View */}
      {subTab === 'currency' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Спецификация справочника валют Currency.txt</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Файл справочника валют представляет собой текстовый CSV-файл с 15 колонками. Справочник может использоваться не только для денежных знаков, но и для произвольных единиц измерения (напр. байты, файлы, метры, попугаи).
            </p>
          </div>

          {/* Table of 15 columns */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5">Колонка</th>
                  <th className="p-2.5">Поле</th>
                  <th className="p-2.5">Описание</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {CURRENCY_SPEC.columns.map((col) => (
                  <tr key={col.index} className="hover:bg-slate-50">
                    <td className="p-2 text-slate-400 font-bold">{col.index}</td>
                    <td className="p-2 text-sky-800 font-semibold">{col.name}</td>
                    <td className="p-2 text-slate-600 font-sans">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sample records */}
          <div>
            <h5 className="font-semibold text-slate-900 text-xs mb-2">Примеры строк из Currency.txt:</h5>
            <div className="bg-slate-950 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto space-y-1">
              {CURRENCY_SPEC.samples.map((line, idx) => (
                <div key={idx} className="hover:text-emerald-400">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
