import React, { useState } from 'react';
import { Copy, Check, Hash, FileText, ChevronRight } from 'lucide-react';

interface MarkdownViewerProps {
  markdownContent: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdownContent }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    { id: 'sec-overview', title: '1. Общие сведения и архитектура' },
    { id: 'sec-constants', title: '2. Структурированные константы (LLM Data)' },
    { id: 'sec-registry', title: '3. Реестр Windows и конфигурация' },
    { id: 'sec-fio', title: '4.1 Склонение ФИО (GetFIOPadeg*)' },
    { id: 'sec-nominative', title: '4.2 Восстановление именительного падежа' },
    { id: 'sec-appointment', title: '4.3 Должности и подразделения' },
    { id: 'sec-service', title: '4.4 Сервисные функции (GetSex, GetPadegID)' },
    { id: 'sec-numerals', title: '4.6 Числительные, суммы прописью и валюты' },
    { id: 'sec-com', title: '5. Сервер автоматизации COM (PadegUCA)' },
    { id: 'sec-firebird', title: '6. Расширение для Firebird SQL (PadegFB)' },
    { id: 'sec-dic', title: '7. Словарь исключений Except.dic' },
    { id: 'sec-currency', title: '8. Справочник валют Currency.txt' },
    { id: 'sec-rules', title: '9. Правила склонения ФИО' },
    { id: 'sec-examples', title: '10. Примеры интеграции (Delphi, C#, VBA, 1C)' },
    { id: 'sec-llm', title: '11. LLM Tools Definition (OpenAPI / JSON Schema)' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-6">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3 text-slate-800 font-semibold text-sm">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Разделы документа</span>
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Быстрый поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
            />
          </div>
          <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 text-xs">
            {sections
              .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition flex items-center justify-between group"
                >
                  <span className="truncate">{s.title}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3 space-y-6">
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-medium mb-3">
              <span>Официальная спецификация v4.1</span>
              <span>•</span>
              <span>Полная поддержка Unicode</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              Библиотека склонения Padeg.dll (PadegUC / PadegUCA / PadegFB)
            </h2>
            <p className="text-sm text-sky-100/90 max-w-3xl leading-relaxed">
              Авторы: <strong>Покаташкин Г.Л.</strong> и <strong>Плахов С.В.</strong> Данный документ содержит актуальное описание интерфейсов библиотеки функций, COM-сервера автоматизации, модуля расширения для СУБД Firebird, словарей исключений, а также структурированные спецификации для LLM-агентов.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section id="sec-overview" className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-600" />
              1. Назначение и архитектура файлов
            </h3>
            <button
              onClick={() => copyText(`PadegUC.dll (Win32/Win64), PadegUCA.dll (COM), PadegFB.dll (Firebird UDF)`, 'arch')}
              className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1"
            >
              {copiedSection === 'arch' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Копировать
            </button>
          </div>
          <div className="prose prose-slate text-sm space-y-3 leading-relaxed text-slate-700">
            <p>
              Библиотека предназначена для преобразования ФИО, должностей и подразделений в любой падеж, восстановления именительного падежа, а также склонения числительных, валют и сумм прописью по правилам русского языка.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-mono font-semibold text-sky-700 text-xs mb-1">PadegUC.dll</div>
                <div className="text-xs text-slate-600">
                  Основная библиотека функций со стандартным соглашением <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">stdcall</code>. Полная поддержка Unicode (UTF-16) для 32- и 64-битных систем.
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-mono font-semibold text-indigo-700 text-xs mb-1">PadegUCA.dll</div>
                <div className="text-xs text-slate-600">
                  Содержит сервер автоматизации COM (ProgID: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">PadegUCA.Declension</code>) с возвратом <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">WideString</code> и те же экспортируемые функции.
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-mono font-semibold text-emerald-700 text-xs mb-1">PadegFB.dll</div>
                <div className="text-xs text-slate-600">
                  Модуль расширения UDF для СУБД Firebird со специальным соглашением <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">cdecl</code> и прямой поддержкой баз UTF8 и WIN1251.
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
              <strong>Важнейшее правило распределения памяти:</strong> Библиотека <em>НЕ выделяет и НЕ освобождает память</em> под результат склонения. Вызывающая программа должна выделить буфер (например, <code className="font-mono">pResult</code>) достаточного размера (рекомендуется длина исходной строки + 20 символов или 255 байт) и передать его размер в параметре <code className="font-mono">nLen</code>. При успешном завершении в <code className="font-mono">nLen</code> возвращается фактическая длина результата.
            </div>
          </div>
        </section>

        {/* Section 2: Constants & LLM Data Block */}
        <section id="sec-constants" className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-600" />
              2. Структурированные константы (Падежи, Род, Коды возврата)
            </h3>
            <button
              onClick={() => copyText(`Падежи: 1-Им, 2-Род, 3-Дат, 4-Вин, 5-Твор, 6-Предл\nКоды: 0-Успех, -1-Неверный падеж, -3-Малый буфер`, 'consts')}
              className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1"
            >
              {copiedSection === 'consts' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Копировать
            </button>
          </div>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">Номера падежей (параметр nPadeg)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { n: 1, name: 'Именительный', q: 'Кто? Что?' },
                  { n: 2, name: 'Родительный', q: 'Кого? Чего?' },
                  { n: 3, name: 'Дательный', q: 'Кому? Чему?' },
                  { n: 4, name: 'Винительный', q: 'Кого? Что?' },
                  { n: 5, name: 'Творительный', q: 'Кем? Чем?' },
                  { n: 6, name: 'Предложный', q: 'О ком? О чем?' },
                ].map((item) => (
                  <div key={item.n} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="inline-block w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-xs mb-1">
                      {item.n}
                    </span>
                    <div className="font-semibold text-slate-800 text-xs">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.q}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">Коды завершения функций (Return Codes)</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2.5">Код</th>
                      <th className="p-2.5">Статус</th>
                      <th className="p-2.5">Описание</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono font-bold text-emerald-600">0</td>
                      <td className="p-2.5 font-medium">Успех</td>
                      <td className="p-2.5 text-slate-600">Функция отработала без системных ошибок.</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-2.5 font-mono font-bold text-rose-600">-1</td>
                      <td className="p-2.5 font-medium">Неверный падеж</td>
                      <td className="p-2.5 text-slate-600">Задан номер падежа вне диапазона 1..6.</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono font-bold text-rose-600">-2</td>
                      <td className="p-2.5 font-medium">Неверный род</td>
                      <td className="p-2.5 text-slate-600">Недопустимое значение рода (сохранено для совместимости с v1.0).</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-2.5 font-mono font-bold text-amber-600">-3</td>
                      <td className="p-2.5 font-medium">Малый буфер</td>
                      <td className="p-2.5 text-slate-600">Размер буфера pResult недостаточен. Результат усечен до nLen.</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono font-bold text-amber-600">-4 / -5</td>
                      <td className="p-2.5 font-medium">Малый буфер поля</td>
                      <td className="p-2.5 text-slate-600">В GetFIOParts: недостаточен буфер имени (-4) или отчества (-5).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Registry */}
        <section id="sec-registry" className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-600" />
              3. Системный реестр Windows (Конфигурация)
            </h3>
            <button
              onClick={() => copyText(`[HKEY_CURRENT_CONFIG\\Software\\Padeg]\n"ExceptionDicDir"="C:\\Users\\All Users\\Padeg"\n"CurrencyDic"="C:\\DevelopXE\\Declension\\Currency.txt"`, 'reg')}
              className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1"
            >
              {copiedSection === 'reg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              Копировать .REG
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Начиная с версии 4.0, ключевая ветка реестра изменена на <code className="bg-slate-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-semibold">HKEY_CURRENT_CONFIG\Software\Padeg</code> (в версиях 3.x использовался HKEY_LOCAL_MACHINE).
          </p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>
{`REGEDIT4

[HKEY_CURRENT_CONFIG\\Software\\Padeg]
"ExceptionDicDir"="C:\\Program Files\\Padeg\\Dictionaries"
"CurrencyDic"="C:\\Program Files\\Padeg\\Dictionaries\\Currency.txt"
"AccentSymbol"="\\""
"AccentPosition"=dword:00000000`}
            </pre>
          </div>
        </section>

        {/* Section 4: FIO Functions */}
        <section id="sec-fio" className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-600" />
              4.1 Склонение ФИО (Функции GetFIOPadeg*)
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-sky-700">GetFIOPadegFSAS</span>
                <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">Рекомендуется</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Склонение ФИО, заданного одной строкой, с автоматическим определением пола по отчеству.
              </p>
              <div className="bg-slate-900 text-emerald-400 p-3 rounded text-xs font-mono mb-2 overflow-x-auto">
                function GetFIOPadegFSAS(pFIO: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;
              </div>
              <div className="text-xs text-slate-500">
                Пример: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-slate-800">"Иванов Иван Иванович", 5</code> → <span className="font-semibold text-slate-800">"Ивановым Иваном Ивановичем"</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-white">
              <div className="font-mono font-bold text-sm text-slate-800 mb-1">GetFIOPadeg</div>
              <p className="text-xs text-slate-600 mb-2">
                Основная универсальная функция. Принимает раздельно Фамилию, Имя и Отчество тремя строками и флаг пола (True - мужской, False - женский).
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto">
                function GetFIOPadeg(pLastName, pFirstName, pMiddleName: PChar; bSex: Boolean; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: COM Server */}
        <section id="sec-com" className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-600" />
              5. Сервер автоматизации COM/OLE (PadegUCA.dll)
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <p>
              Библиотека <code className="font-mono font-semibold text-slate-900">PadegUCA.dll</code> регистрируется через <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">regsvr32.exe PadegUCA.dll</code>.
              Все методы используют тип <code className="font-mono font-semibold text-indigo-700">WideString</code>, не требуют передачи буфера и возвращают результат напрямую:
            </p>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>
{`// Пример вызова в Delphi:
var Decl: Variant;
Decl := CreateOleObject('PadegUCA.Declension');
res := Decl.GetFIOPadegFS('Иванов Иван Иванович', '', 2); // '' - автоопределение пола

// Пример в 1C:Предприятие 8.3:
Padeg = Новый COMОбъект("PadegUCA.Declension");
Результат = Padeg.GetFIOPadegFS("Иванов Иван Иванович", "", 3); // Дательный падеж`}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
