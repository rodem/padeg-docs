import React, { useState } from 'react';
import { Copy, Check, Terminal, Play, RotateCcw } from 'lucide-react';
import { PADEG_CASES } from '../data/padegDocs';

export const CodeGenerator: React.FC = () => {
  const [language, setLanguage] = useState<'delphi' | 'csharp' | 'cpp' | 'vba' | 'onec8' | 'onec7' | 'firebird'>('onec8');
  const [fioInput, setFioInput] = useState('Иванов Иван Иванович');
  const [padegCase, setPadegCase] = useState<number>(3); // Дательный
  const [copied, setCopied] = useState(false);

  const getGeneratedCode = () => {
    switch (language) {
      case 'onec8':
        return `// 1С:Предприятие 8.2 / 8.3 (Обычные и Управляемые формы)
// Библиотека PadegUCA.dll должна быть предварительно зарегистрирована: regsvr32 "PadegUCA.dll"

&НаКлиенте
Функция СклонятьФИОПоПадежу(Знач ИсходноеФИО, Знач НомерПадежа = ${padegCase})
    // 1 - Именительный, 2 - Родительный, 3 - Дательный, 4 - Винительный, 5 - Творительный, 6 - Предложный
    Результат = ИсходноеФИО;
    Попытка
        Padeg = Новый COMОбъект("PadegUCA.Declension");
        // Параметры GetFIOPadegFS: ФИО, Пол ("" = автоопределение), НомерПадежа
        Результат = Padeg.GetFIOPadegFS(ИсходноеФИО, "", НомерПадежа);
    Исключение
        ВызватьИсключение "Ошибка создания COM-объекта PadegUCA.Declension: " + ОписаниеОшибки();
    КонецПопытки;
    Возврат Результат;
КонецФункции

// Пример использования:
Результат = СклонятьФИОПоПадежу("${fioInput}", ${padegCase});
Сообщить(Результат);`;

      case 'csharp':
        return `// C# (.NET Core / .NET 6/7/8 / .NET Framework)
// Требуется наличие PadegUC.dll (или PadegUCA.dll) рядом с .exe или в System32
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class PadegHelper
{
    private const string DllName = "PadegUC.dll";

    [DllImport(DllName, EntryPoint = "GetFIOPadegFSAS", CharSet = CharSet.Unicode, CallingConvention = CallingConvention.StdCall)]
    private static extern int GetFIOPadegFSAS(
        string pFIO,
        int nPadeg,
        StringBuilder pResult,
        ref int nLen
    );

    /// <summary>
    /// Склоняет ФИО одной строкой с автоматическим определением пола.
    /// </summary>
    /// <param name="fio">Исходное ФИО в им. падеже</param>
    /// <param name="padeg">Номер падежа (1..6)</param>
    public static string DeclineFIO(string fio, int padeg = ${padegCase})
    {
        if (string.IsNullOrWhiteSpace(fio)) return string.Empty;
        
        // Выделяем буфер с запасом (длина + 30 символов)
        int bufferLen = fio.Length + 32;
        StringBuilder sb = new StringBuilder(bufferLen);
        
        int retCode = GetFIOPadegFSAS(fio, padeg, sb, ref bufferLen);
        if (retCode == 0)
        {
            return sb.ToString(0, bufferLen);
        }
        
        throw new InvalidOperationException($"Ошибка склонения Padeg.dll (код ошибки: {retCode})");
    }
}

// Пример вызова:
string declined = PadegHelper.DeclineFIO("${fioInput}", ${padegCase});
Console.WriteLine(declined);`;

      case 'delphi':
        return `// Delphi (XE и выше, полная поддержка Unicode UTF-16)
unit PadegWrapper;

interface

uses
  Windows, SysUtils, Dialogs;

function DeclineFIO(const cFIO: string; nPadeg: Integer = ${padegCase}): string;

implementation

// Статический импорт функции с автоопределением пола
function GetFIOPadegFSAS(pFIO: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall; external 'PadegUC.dll';

function DeclineFIO(const cFIO: string; nPadeg: Integer): string;
var
  pBuf: PChar;
  nLen: LongInt;
  retVal: Integer;
begin
  Result := cFIO;
  if cFIO = '' then Exit;

  // 1. Выделяем буфер с запасом под удлинение окончаний
  nLen := Length(cFIO) + 30;
  pBuf := StrAlloc(nLen);
  try
    // 2. Вызов функции библиотеки
    retVal := GetFIOPadegFSAS(PChar(cFIO), nPadeg, pBuf, nLen);
    if retVal = 0 then
      Result := Copy(pBuf, 1, nLen)
    else if retVal = -1 then
      raise Exception.CreateFmt('Недопустимый номер падежа: %d', [nPadeg])
    else if retVal = -3 then
      raise Exception.Create('Размер буфера pResult недостаточен');
  finally
    // 3. ОБЯЗАТЕЛЬНОЕ освобождение выделенной памяти
    StrDispose(pBuf);
  end;
end;

end.

// Пример обращения:
ShowMessage(DeclineFIO('${fioInput}', ${padegCase}));`;

      case 'cpp':
        return `// C / C++ (Visual Studio / GCC / Clang)
#include <windows.h>
#include <iostream>
#include <string>

typedef int(__stdcall *LPFNGetFIOPadegFSAS)(const wchar_t*, int, wchar_t*, int&);

stdcall std::wstring DeclineFIO(const std::wstring& fio, int padeg = ${padegCase})
{
    HMODULE hDll = LoadLibraryW(L"PadegUC.dll");
    if (!hDll) {
        throw std::runtime_error("Не удалось загрузить PadegUC.dll");
    }

    LPFNGetFIOPadegFSAS pFn = (LPFNGetFIOPadegFSAS)GetProcAddress(hDll, "GetFIOPadegFSAS");
    if (!pFn) {
        FreeLibrary(hDll);
        throw std::runtime_error("Функция GetFIOPadegFSAS не найдена в DLL");
    }

    int bufLen = (int)fio.length() + 32;
    wchar_t* pBuffer = new wchar_t[bufLen];
    memset(pBuffer, 0, bufLen * sizeof(wchar_t));

    int res = pFn(fio.c_str(), padeg, pBuffer, bufLen);
    std::wstring result = (res == 0) ? std::wstring(pBuffer, bufLen) : fio;

    delete[] pBuffer;
    FreeLibrary(hDll);
    return result;
}

int main()
{
    std::wstring fio = L"${fioInput}";
    std::wcout << DeclineFIO(fio, ${padegCase}) << std::endl;
    return 0;
}`;

      case 'vba':
        return `' Visual Basic for Applications (MS Excel / Word / Access 2010+)
' Функция импорта с автоматическим определением пола (Unicode версия 4.1)
Private Declare PtrSafe Function GetPadeg Lib "PadegUC.dll" Alias "GetFIOPadegFSAS" _
  (ByVal pFIO As String, ByVal nPadeg As Long, ByVal pResult As String, ByRef nLen As Long) As Integer

Public Function MakePadeg(ByVal cFIO As String, Optional ByVal nPadeg As Long = ${padegCase}) As String
    Dim tmpS As String
    Dim nLen As Long
    Dim retVal As Integer
    
    nLen = 255
    tmpS = String(nLen, 0)
    
    ' Преобразование строки в Unicode перед передачей в PadegUC.dll v4.x
    retVal = GetPadeg(StrConv(cFIO, vbUnicode), nPadeg, tmpS, nLen)
    ' Обратное преобразование результата в ASC
    tmpS = StrConv(tmpS, vbFromUnicode)
    
    If retVal = 0 Then
        MakePadeg = Left(tmpS, nLen)
    ElseIf retVal = -1 Then
        MsgBox "Недопустимый номер падежа: " & nPadeg, vbExclamation, "Padeg.dll"
        MakePadeg = cFIO
    Else
        MakePadeg = cFIO
    End If
End Function

' Тестовый вызов:
Sub TestPadeg()
    MsgBox MakePadeg("${fioInput}", ${padegCase})
End Sub`;

      case 'onec7':
        return `// 1C:Предприятие 7.7
// Вариант 1: Через сервер автоматизации PadegUCA.Declension
Склонение = СоздатьОбъект("PadegUCA.Declension");
ФИО_Результат = Склонение.GetFIOPadegFS("${fioInput}", "", ${padegCase});
Сообщить(ФИО_Результат);

// Вариант 2: Через внешнюю компоненту ULE (Universal Language Extender)
Если ПодключитьВнешнююКомпоненту("ULE.dll") = 1 Тогда
    Склонение = СоздатьОбъект("AddIn.ULE");
    Склонение.TransmuteInto("PadegUCA.Declension", "");
    ФИО_Результат = Склонение.GetFIOPadegFS("${fioInput}", "", ${padegCase});
    Сообщить(ФИО_Результат);
КонецЕсли;`;

      case 'firebird':
        return `-- Firebird SQL (UDF модуль PadegFB.dll в каталоге UDF)
-- 1. Регистрация функции в БД:
DECLARE EXTERNAL FUNCTION GETFIOPADEGFSAS
    CSTRING(200),
    INTEGER
    RETURNS CSTRING(200)
    ENTRY_POINT 'GetFIOPadegFSAS' MODULE_NAME 'PadegFB';

-- 2. Пример SQL-запроса на склонение ФИО:
SELECT 
    e.fio AS original_fio,
    GETFIOPADEGFSAS(e.fio, ${padegCase}) AS declined_fio
FROM employee e
WHERE e.fio = '${fioInput}';

-- 3. Пример склонения валюты (возврат UTF-8):
-- SELECT DeclCurrency(123.45, 'RUB', ${padegCase}, 0) FROM rdb$database;`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Configuration Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Интерактивный генератор интеграционного кода</h3>
            <p className="text-xs text-slate-500">
              Выберите целевую среду программирования и параметры вызова для генерации готового проверенного фрагмента кода.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать код'}</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Целевая платформа / Язык</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'onec8', label: '1С 8.x (COM)' },
                { id: 'csharp', label: 'C# (.NET P/Invoke)' },
                { id: 'delphi', label: 'Delphi XE (Win32/64)' },
                { id: 'cpp', label: 'C / C++ (WinAPI)' },
                { id: 'vba', label: 'VBA (MS Office)' },
                { id: 'firebird', label: 'Firebird SQL (UDF)' },
                { id: 'onec7', label: '1С 7.7 (ULE/NDS)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLanguage(item.id as any)}
                  className={`p-2 rounded-lg text-left font-medium transition ${
                    language === item.id
                      ? 'bg-sky-50 border border-sky-300 text-sky-900 font-semibold'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Тестовое ФИО</label>
            <input
              type="text"
              value={fioInput}
              onChange={(e) => setFioInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50 font-medium text-slate-800"
              placeholder="Введите ФИО..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Будет подставлено в вызовы функций и примеры тестового запуска.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Целевой падеж (nPadeg)</label>
            <select
              value={padegCase}
              onChange={(e) => setPadegCase(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50 font-medium text-slate-800"
            >
              {PADEG_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name} ({c.question})
                </option>
              ))}
            </select>
            <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
              Выбран: <strong>{PADEG_CASES.find((c) => c.id === padegCase)?.name}</strong> падеж
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Сгенерированный исходный код ({language.toUpperCase()})</span>
          </div>
          <span className="text-[11px] text-slate-500">Auto-generated with Memory Management</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-[500px]">
          {getGeneratedCode()}
        </pre>
      </div>
    </div>
  );
};
