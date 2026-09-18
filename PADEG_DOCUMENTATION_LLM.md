# Библиотека склонения Padeg.dll (PadegUC / PadegUCA / PadegFB) — Версия 4.1

> **Авторы:** Покаташкин Г. Л. (`pgl@tut.by`), Плахов С. В. (`seer.true@gmail.com`)  
> **Версия продукта:** 4.1 (Склонение ФИО, должностей, подразделений, числительных, валют, сумм прописью)  
> **Платформы:** Windows x86 (Win32), Windows x64 (Win64), Firebird SQL (32/64-bit), COM/OLE Automation  
> **Формат документа:** Markdown + Структурированные блоки данных (JSON / YAML) для LLM и автоматического парсинга.

---

## Оглавление

1. [Общие сведения и архитектура](#1-общие-сведения-и-архитектура)
2. [Структурированные константы и перечисления (LLM Data Block)](#2-структурированные-константы-и-перечисления-llm-data-block)
3. [Реестр Windows и конфигурация](#3-реестр-windows-и-конфигурация)
4. [Спецификация API экспортируемых функций (PadegUC.dll)](#4-спецификация-api-экспортируемых-функций-padegucdll)
   - 4.1 [Склонение ФИО](#41-склонение-фио)
   - 4.2 [Восстановление именительного падежа](#42-восстановление-именительного-падежа)
   - 4.3 [Склонение должностей и подразделений](#43-склонение-должностей-и-подразделений)
   - 4.4 [Сервисные функции](#44-сервисные-функции)
   - 4.5 [Управление словарем исключений](#45-управление-словарем-исключений)
   - 4.6 [Склонение числительных, сумм прописью и валют](#46-склонение-числительных-сумм-прописью-и-валют)
5. [Сервер автоматизации COM/OLE (PadegUCA.dll)](#5-сервер-автоматизации-comole-padegucadll)
6. [Модуль расширения для СУБД Firebird (PadegFB.dll)](#6-модуль-расширения-для-субд-firebird-padegfbdll)
7. [Словарь исключений Except.dic (15 секций)](#7-словарь-исключений-exceptdic-15-секций)
8. [Справочник валют Currency.txt (Формат 15 полей)](#8-справочник-валют-currencytxt-формат-15-полей)
9. [Правила склонения, реализованные в библиотеке](#9-правила-склонения-реализованные-в-библиотеке)
10. [Примеры интеграции в код (Delphi, C++, C#, VBA, 1С, Firebird)](#10-примеры-интеграции-в-код)
11. [LLM Tools Definition (OpenAPI / Function Calling JSON Schema)](#11-llm-tools-definition-openapi--function-calling-json-schema)

---

## 1. Общие сведения и архитектура

Библиотека **Padeg** предназначена для:
1. Морфологического преобразования (склонения) ФИО из именительного падежа в любую падежную форму (Родительный, Дательный, Винительный, Творительный, Предложный).
2. Восстановления именительного падежа из произвольного падежа.
3. Склонения должностей, подразделений и комбинированных наименований («Должность + Подразделение»).
4. Генерации сумм и чисел прописью, склонения числительных (количественных и порядковых), склонения денежных сумм по справочнику валют ISO 4217 и произвольным единицам измерения.

### Исполняемые модули версии 4.1:
- `PadegUC.dll` — основная DLL со стандартным соглашением вызова `stdcall`. Поддерживает **Unicode** (строки `PChar` / `PWideChar` в UTF-16). Доступна в 32- и 64-битном вариантах.
- `PadegUCA.dll` — сборка, объединяющая стандартный экспорт функций и сервер автоматизации **COM/ActiveX** (`ProgID: "PadegUCA.Declension"`), возвращающий `WideString` без необходимости ручного управления буфером.
- `PadegFB.dll` — UDF-библиотека для СУБД **Firebird** (соглашение вызова `cdecl`, поддержка кодировок UTF8 и WIN1251).

### Управление памятью в DLL (Критическое правило):
- Функции библиотеки **НЕ выделяют и НЕ освобождают память** под возвращаемый результат.
- Вызывающее приложение обязано выделить буфер `pResult` достаточной длины (рекомендуется `Length(src) + 20` или фиксированный буфер 255–500 символов) и передать в `nLen` его размер.
- После выполнения функции в `nLen` возвращается **фактическое количество символов**, записанных в буфер.
- Если буфер недостаточен, возвращается код `-3`, а результат усекается.

---

## 2. Структурированные константы и перечисления (LLM Data Block)

```json
{
  "padeg_constants": {
    "version": "4.1",
    "case_ids": {
      "1": { "name": "Именительный", "question": "Кто? Что?", "alias": "Nominative" },
      "2": { "name": "Родительный", "question": "Кого? Чего?", "alias": "Genitive" },
      "3": { "name": "Дательный", "question": "Кому? Чему?", "alias": "Dative" },
      "4": { "name": "Винительный", "question": "Кого? Что?", "alias": "Accusative" },
      "5": { "name": "Творительный", "question": "Кем? Чем?", "alias": "Instrumental" },
      "6": { "name": "Предложный", "question": "О ком? О чем?", "alias": "Prepositional" }
    },
    "sex_flags": {
      "stdcall_dll": {
        "true": "Мужской род",
        "false": "Женский род"
      },
      "numerals_and_firebird": {
        "-1": "Средний род",
        "0": "Женский род",
        "1": "Мужской род"
      },
      "com_automation": {
        "\"\"": "Автоопределение рода по отчеству",
        "\"м\"": "Мужской род (регистронезависимо)",
        "\"ж\"": "Женский род (регистронезависимо)"
      }
    },
    "return_codes": {
      "0": "Успешное выполнение функции",
      "-1": "Недопустимый номер падежа (допустимы 1..6)",
      "-2": "Недопустимое значение рода (сохранено для обратной совместимости)",
      "-3": "Размер буфера pResult недостаточен для размещения результата",
      "-4": "Размер буфера pFirstName недостаточен (в GetFIOParts)",
      "-5": "Размер буфера pMiddleName недостаточен (в GetFIOParts)"
    },
    "currency_output_forms": {
      "0": "Сумма прописью + валюта + копейки цифрами (напр. 'сто двадцать три российских рубля 32 копейки')",
      "1": "(Сумма прописью в скобках) + валюта + копейки цифрами (напр. '(сто двадцать три) российских рубля 32 копейки')",
      "2": "Сумма цифрами + (в скобках прописью) + валюта (напр. '123 (сто двадцать три) российских рубля 32 копейки')"
    }
  }
}
```

---

## 3. Реестр Windows и конфигурация

Все настройки библиотеки хранятся в ветке системного реестра:  
`HKEY_CURRENT_CONFIG\Software\Padeg`

| Параметр | Тип | Назначение | Значение по умолчанию |
| :--- | :--- | :--- | :--- |
| `ExceptionDicDir` | `String (REG_SZ)` | Путь к каталогу словаря исключений `Except.dic` | Каталог приложения или каталоги MS Office |
| `CurrencyDic` | `String (REG_SZ)` | Полный путь к файлу справочника валют `Currency.txt` | `currency.txt` рядом с DLL |
| `AccentSymbol` | `String (REG_SZ)` | Символ обозначения ударной гласной в секции `[Accent]` | `"` (кавычка) |
| `AccentPosition` | `DWORD (REG_DWORD)` | Позиция символа ударения: `0` — перед гласной, `1` — после гласной | `0` |

---

## 4. Спецификация API экспортируемых функций (PadegUC.dll)

### 4.1 Склонение ФИО

#### 1. `GetFIOPadeg`
Основная универсальная функция. Склоняет фамилию, имя и отчество, переданные тремя отдельными строками.
```pascal
function GetFIOPadeg(
  pLastName: PChar;      // Фамилия (может быть пустой строкой)
  pFirstName: PChar;     // Имя (может быть пустой строкой)
  pMiddleName: PChar;    // Отчество (может быть пустой строкой)
  bSex: Boolean;         // Род: True - мужской, False - женский
  nPadeg: LongInt;       // Падеж (1..6)
  pResult: PChar;        // Указатель на выделенный вызывающим буфер
  var nLen: LongInt      // [in] размер буфера; [out] длина результата
): Integer; stdcall;
```
- **Особенности:** Поддерживает славянские, восточные (Ли Си Цын / Ким Ир Сен), составные фамилии с дефисом, инициалы (Сидоров И.П. → у Сидорова И.П.).

#### 2. `GetFIOPadegAS`
Склонение раздельного ФИО с автоматическим определением рода по отчеству.
```pascal
function GetFIOPadegAS(
  pLastName, pFirstName, pMiddleName: PChar;
  nPadeg: LongInt;
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```
- **Особенности:** Определяет пол по окончанию отчества, включая суффиксы `Оглы` (сын) и `Кызы` (дочь), записанные через пробел или дефис.

#### 3. `GetFIOPadegFS`
Склонение ФИО, переданного **одной строкой** в формате `"Фамилия Имя Отчество"`, с явным указанием пола.
```pascal
function GetFIOPadegFS(
  pFIO: PChar;           // Полное ФИО одной строкой
  bSex: Boolean;         // True - мужской, False - женский
  nPadeg: LongInt;       // 1..6
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```

#### 4. `GetFIOPadegFSAS`
Самая популярная функция для быстрой интеграции. ФИО передается **одной строкой**, пол определяется **автоматически**.
```pascal
function GetFIOPadegFSAS(
  pFIO: PChar;           // "Иванов Иван Иванович"
  nPadeg: LongInt;       // 1..6
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```

#### 5. `GetIFPadeg`
Склонение пары «Имя Фамилия» (например, «Марк Твен», «Джон Фиджеральд Кеннеди»).
```pascal
function GetIFPadeg(
  pFirstName: PChar;     // Имя или несколько имен ("Джон Фиджеральд")
  pLastName: PChar;      // Фамилия ("Кеннеди")
  bSex: Boolean;         // True - мужской, False - женский
  nPadeg: LongInt;       // 1..6
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```

#### 6. `GetIFPadegFS`
Склонение пары «Имя Фамилия», переданных **одной строкой**.
```pascal
function GetIFPadegFS(
  pIF: PChar;            // "Марк Твен"
  bSex: Boolean;         // True - мужской, False - женский
  nPadeg: LongInt;       // 1..6
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```
- **Правило:** Последнее слово строки считается фамилией, все предшествующие — именами.

---

### 4.2 Восстановление именительного падежа

#### 7. `GetNominativePadeg`
Восстанавливает именительный падеж для ФИО, записанного в произвольном косвенном падеже.
```pascal
function GetNominativePadeg(
  pFIO: PChar;           // ФИО в любом падеже ("Иванову Ивану Ивановичу")
  pResult: PChar;        // Буфер под результат в им. пад.
  var nLen: LongInt
): Integer; stdcall;
```

---

### 4.3 Склонение должностей и подразделений

#### 8. `GetAppointmentPadeg`
Склонение наименования должности.
```pascal
function GetAppointmentPadeg(
  pAppointment: PChar;   // Название должности ("генеральный директор")
  nPadeg: LongInt;       // 1..6
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```

#### 9. `GetOfficePadeg`
Склонение наименования подразделения или предприятия.
```pascal
function GetOfficePadeg(
  pOffice: PChar;        // Подразделение ("Департамент информационных технологий")
  nPadeg: LongInt;       // 1..6
  pResult: PChar;
  var nLen: LongInt
): Integer; stdcall;
```

#### 10. `GetFullAppointmentPadeg`
Объединение и согласованное склонение должности и подразделения с автоматическим удалением дублирующихся слов.
```pascal
function GetFullAppointmentPadeg(
  pAppointment: PChar;   // "Начальник цеха"
  pOffice: PChar;        // "Цех нестандартного оборудования"
  nPadeg: LongInt;       // 3 (Дательный)
  pResult: PChar;        // Результат: "Начальнику цеха нестандартного оборудования"
  var nLen: LongInt
): Integer; stdcall;
```
- **Применение для документов:** Если передать вид документа (напр., `"Постановление"`) в `pAppointment` и орган (напр., `"Совет Министров"`) в `pOffice`, функция корректно согласует и просклоняет наименование документа.

---

### 4.4 Сервисные функции

#### 11. `GetSex`
Определение рода по отчеству или по ФИО, заканчивающемуся на отчество.
```pascal
function GetSex(pMiddleName: PChar): Integer; stdcall;
```
- **Возврат:**
  - `1` — Мужской род
  - `0` — Женский род
  - `-1` — Невозможно определить

#### 12. `GetPadegID`
Определение номера падежа, в котором записано переданное ФИО.
```pascal
function GetPadegID(pFIO: PChar): Integer; stdcall;
```
- **Возврат:** `0` — не определен; `1..6` — номер падежа. (В спорных случаях при омонимии форм возвращает 2 для мужчин и 3 для женщин).

#### 13. `GetFIOParts`
Разделение строки ФИО на три составляющие: Фамилия, Имя, Отчество.
```pascal
type
  PPartsFIO = ^TPartsFIO;
  TPartsFIO = record
    pLastName, pFirstName, pMiddleName: PChar;
    nLastName, nFirstName, nMiddleName: LongInt;
  end;

function GetFIOParts(pFIO: PChar; Parts: PPartsFIO): Integer; stdcall;
```
- **Возврат:** `0` — успех; `-3` — мал буфер фамилии; `-4` — мал буфер имени; `-5` — мал буфер отчества.

---

### 4.5 Управление словарем исключений

#### 14. `UpdateExceptions`
Принятие изменений, внесенных в файл словаря `Except.dic` во время работы программы.
```pascal
function UpdateExceptions: Boolean; stdcall;
```

#### 15. `GetExceptionsFileName`
Возвращает абсолютный путь к активному файлу словаря исключений.
```pascal
function GetExceptionsFileName(pResult: PChar; var nLen: LongInt): Integer; stdcall;
```

#### 16. `SetDictionary`
Назначение альтернативного словаря исключений в качестве активного (без изменения реестра).
```pascal
function SetDictionary(FileName: PChar): Boolean; stdcall;
```

---

### 4.6 Склонение числительных, сумм прописью и валют

#### 17. `NumberToString`
Базовое преобразование вещественного числа в строковый эквивалент прописью.
```pascal
function NumberToString(
  Quantity: Extended;    // Преобразуемое число (до 15 значащих цифр)
  iSex: Integer;         // Род: -1 (средний), 0 (женский), 1 (мужской)
  Decimal: Integer;      // Точность дробной части (<= 15)
  RemoveZero: Boolean;   // True - отсекать незначащие нули в дробной части
  CnvtFrac: Boolean;     // True - преобразовывать дробную часть в слова, False - выводить цифрами
  pResult: PChar;
  var nLen: Integer
): Integer; stdcall;
```

#### 18. `SumInWords`
Преобразование сверхдлинных чисел (передаваемых строкой `PChar`) прописью без потери точности (до 15 знаков целой части и 14 знаков дробной части — до «стотриллионных»).
```pascal
function SumInWords(
  Quantity: PChar;       // Строковое число, напр. "123456789123456,12345678912345"
  iSex: Integer;         // -1, 0, 1
  Decimal: Integer;
  RemoveZero: Boolean;
  CnvtFrac: Boolean;
  pResult: PChar;
  var nLen: Integer
): Integer; stdcall;
```

#### 19. `DoubleToVerbal`
Упрощенная форма представления числа прописью со словами «целая / целых / целые».
```pascal
function DoubleToVerbal(
  Quantity: Extended;
  pResult: PChar;
  var nLen: Integer
): Integer; stdcall;
```

#### 20. `DeclNumeral`
Склонение текстового числительного в требуемый падеж.
```pascal
function DeclNumeral(
  Value: PChar;          // Текстовое числительное в им. падеже (после NumberToString/DoubleToVerbal)
  nPadeg: Integer;       // 1..6
  iSex: Integer;         // -1 (средний), 0 (женский), 1 (мужской)
  Order: Boolean;        // True - порядковое ("первый", "второй"), False - количественное ("один", "два")
  Soul: Boolean;         // True - одушевленное, False - неодушевленное
  pResult: PChar;
  var nLen: Integer
): Integer; stdcall;
```

#### 21. `DeclCurrency`
Склонение числовой денежной суммы по справочнику валют ISO 4217.
```pascal
function DeclCurrency(
  Quantity: Currency;    // Сумма (применяется банковское округление до четного)
  CurrName: PChar;       // Код валюты ("RUB", "USD", "EUR", "KZT", "JPY" или кастомные #M2, #BT)
  nPadeg: Integer;       // 1..6
  Forms: Byte;           // Форма вывода: 0, 1 или 2
  pResult: PChar;
  var nLen: Integer
): Integer; stdcall;
```

---

## 5. Сервер автоматизации COM/OLE (PadegUCA.dll)

- **ProgID:** `PadegUCA.Declension`
- **Особенность:** Все строковые параметры и результаты используют тип `WideString` (BSTR). Параметры `pResult` и `nLen` отсутствуют, результат возвращается напрямую как значение метода. При ошибке генерируется исключение `EOleException` (`ErrorCode = -1` или `-2`).
- В версии 4.x методы словаря исключений включены непосредственно в класс `Declension` (вложенный объект `Dictionary` ликвидирован).

### Таблица методов COM-интерфейса `Declension`

```pascal
// Определение пола: '1' - М, '0' - Ж, '-1' - неизвестно
function GetSex(const cMiddleName: WideString): Integer;

// Склонение ФИО одной строкой: cSex = '' (авто), 'м', 'ж'
function GetFIOPadegFS(const cFIO, cSex: WideString; nPadeg: Integer): WideString;

// Разделение ФИО на компоненты
procedure SeparateFIO(const cFIO: WideString; out cLastName, cFirstName, cMiddleName: WideString);

// Склонение ФИО по частям
function GetFIOPadeg(const cLastName, cFirstName, cMiddleName, cSex: WideString; nPadeg: Integer): WideString;

// Склонение пар "Имя Фамилия"
function GetIFPadeg(const cFirstName, cLastName, cSex: WideString; nPadeg: Integer): WideString;
function GetIFPadegFS(const cIF, cSex: WideString; nPadeg: Integer): WideString;

// Восстановление именительного падежа
function GetNominativePadeg(const cFIO: WideString): WideString;

// Должности и подразделения
function GetAppointmentPadeg(const cAppointment: WideString; nPadeg: Integer): WideString;
function GetOfficePadeg(const cOffice: WideString; nPadeg: Integer): WideString;
function GetFullAppointmentPadeg(const cAppointment, cOffice: WideString; nPadeg: Integer): WideString;

// Работа со словарем исключений
function SetDictionary(const DicName: WideString): WordBool;
function Update_Exceptions: WordBool;
function GetExceptionsFileName: WideString;

// Числительные и суммы
function NumberToString(Quantity: Double; iSex, Decimal: Integer; RemoveZero, CnvtFrac: WordBool): WideString;
function DoubleToVerbal(Quantity: Double): WideString;
function DeclNumeral(const Value: WideString; nPadeg, iSex: Integer; Order, Soul: WordBool): WideString;
function DeclCurrency(Quantity: Currency; const CurrName: WideString; nPadeg, Forms: Integer): WideString;
function SumInWords(const Quantity: WideString; iSex, Decimal: Integer; RemoveZero, CnvtFrac: WordBool): WideString;
```

---

## 6. Модуль расширения для СУБД Firebird (PadegFB.dll)

Библиотека `PadegFB.dll` использует соглашение вызовов `cdecl` и поддерживает работу с базами данных в кодировках `WIN1251` и `UTF8`. Функции не требуют параметров `pResult` и `nLen`.

### Основные UDF в Firebird:
```sql
-- Склонение ФИО одной строкой с автоопределением пола
DECLARE EXTERNAL FUNCTION GETFIOPADEGFSAS
    CSTRING(200),
    INTEGER
    RETURNS CSTRING(200)
    ENTRY_POINT 'GetFIOPadegFSAS' MODULE_NAME 'PadegFB';

-- Склонение ФИО по частям с указанием пола (1 - М, 0 - Ж)
DECLARE EXTERNAL FUNCTION GETFIOPADEG
    CSTRING(200), CSTRING(200), CSTRING(200), INTEGER, INTEGER
    RETURNS CSTRING(500)
    ENTRY_POINT 'GetFIOPadeg' MODULE_NAME 'PadegFB';

-- Склонение должности и подразделения
DECLARE EXTERNAL FUNCTION GETFULLAPPOINTMENTPADEG
    CSTRING(500), CSTRING(500), INTEGER
    RETURNS CSTRING(1000)
    ENTRY_POINT 'GetFullAppointmentPadeg' MODULE_NAME 'PadegFB';

-- Склонение валюты (возврат в UTF8)
DECLARE EXTERNAL FUNCTION DECLCURRENCY
    NUMERIC(18,4), CSTRING(10), INTEGER, INTEGER
    RETURNS CSTRING(500) CHARACTER SET UTF8
    ENTRY_POINT 'DeclCurrency' MODULE_NAME 'PadegFB';

-- Восстановление именительного падежа
DECLARE EXTERNAL FUNCTION GETNOMINATIVEPADEG
    CSTRING(500)
    RETURNS CSTRING(500)
    ENTRY_POINT 'GetNominativePadeg' MODULE_NAME 'PadegFB';
```

---

## 7. Словарь исключений Except.dic (15 секций)

Формат файла: INI-подобный текстовый файл в кодировке UTF-16 или ASCII. Поддерживает маски со звездочкой `*` в первых 6 секциях (например, `*ава`).

```ini
; 1. Фамилии обоего пола, не склоняемые вообще (в т.ч. первые части двойных)
[LastName]
*ава
Дюма
Золя

; 2. Фамилии женского рода, не склоняемые вообще
[LastNameW]
*их
*ых

; 3. Женские фамилии на -ина, зависящие от мужской (Щербина -> Щербина/Щербин)
[DependedLastNameW]
Щербина

; 4. Несклоняемые мужские имена
[FirstNameM]
Серго
Бату

; 5. Несклоняемые женские имена
[FirstNameW]
Кармен
Элен
*ь

; 6. Несклоняемые первые части составных фамилий
[FirstPartLastName]
Бонч
Мамин

; 7. Неславянские фамилии на -ов, -ин, -их (склоняемые как русские)
[BaseNonRussian]
Бюлов
Рабин
Либих

; 8. Фамилии на -ок, -ец без выпадения беглой гласной (Корешок -> Корешока)
[NonLeaveVocalic]
Корешок

; 9. Параллельные формы мужских имен на -о/-а (Михайло -> Михайла)
[FirstNameParallelForms]
Михайло

; 10. Зависимость окончания от положения ударения
[Accent]
Судья

; 11. Существительные с окончаниями прилагательных (-ая, -ий, -ое, -ый)
[NonAdjective]
Лесничий

; 12. Несклоняемые части составных слов перед дефисом
[NonDeclBeforeHyphen]
кафе

; 13. Сокращения существительных через дефис
[HyphenAbbreviation]
зам-пред

; 14. Сокращения существительных через точку
[PointAbbreviation]
и.о.

; 15. Существительные во множественном числе
[Plural]
Ножницы
```

---

## 8. Справочник валют Currency.txt (Формат 15 полей)

Файл содержит записи с разделителем-запятой. Каждая запись состоит из 15 позиций (допустимо сокращение пустых хвостовых полей):

```
1. Код валюты (ISO 4217 или кастомный код, например RUB, USD, #M2)
2. Род валюты: 'М' (мужской), 'Ж' (женский)
3. Корень наименования страны (например 'российск')
4-6. Триада окончаний страны для чисел, оканчивающихся на:
     4. '1' (напр. 'ий' -> российский)
     5. '2', '3', '4' (напр. 'их' -> российских)
     6. '0', '5..9', '11..19' (напр. 'их' -> российских)
7. Корень основного наименования валюты (напр. 'рубл')
8-10. Триада окончаний основной валюты:
     8. для 1 ('ь' -> рубль)
     9. для 2-4 ('я' -> рубля)
     10. для 5-0 ('ей' -> рублей)
11. Дополнительное наименование (напр. 'США' для доллара)
12. Корень наименования сотой части (напр. 'копе')
13-15. Триада окончаний сотой части:
     13. для 1 ('йка' -> копейка)
     14. для 2-4 ('йки' -> копейки)
     15. для 5-0 ('ек' -> копеек)
```

### Пример содержимого Currency.txt:
```csv
EUR,М,           ,  ,  ,  ,евро     ,  ,  ,  ,          ,цент    ,   ,а  ,ов
USD,М,           ,  ,  ,  ,доллар   ,  ,а ,ов,США       ,цент    ,   ,а  ,ов
JPY,Ж,японск     ,ая,их,их,йен      ,а ,ы
KZT,М,казахстанск,ий,их,их,тенге    ,  ,  ,  ,          ,тиын
RUB,М,российск   ,ий,их,их,рубл     ,ь ,я ,ей,          ,копе    ,йка,йки,ек
#M2,М,квадратн   ,ый,ых,ых,метр     ,  ,а ,ов
#PG,М,           ,  ,  ,  ,попуга   ,й ,я ,ев,          ,крылыш  ,ко ,ка ,ек
```

---

## 9. Правила склонения, реализованные в библиотеке

### Не склоняются:
1. Женские фамилии на согласный и мягкий знак (*Людмила Коваль*, *Анна Жук*, *Мария Мицкевич*).
2. Женские имена на согласный (*Кармен*, *Элен*, *Элизабет*, *Гюльчетай*).
3. Иноязычные фамилии на гласный звук, кроме безударных `-а`, `-я` (*Гюго*, *Бизе*, *Россини*, *Шоу*, *Дюма*, *Золя*).
4. Мужские и женские имена на гласный звук, кроме `-а`, `-я` (*Серго*, *Нелли*).
5. Фамилии на `-а`, `-я` с предшествующей гласной `-и` (*Эредиа*, *Гарсиа*, *Гулиа*).
6. Русские застывшие фамилии в форме род. падежа на `-ово`, `-аго`, `-яго` (*Дурново*, *Живаго*) и множ. числа на `-их`, `-ых` (*Седых*, *Долгих*).
7. Украинские фамилии на `-ко` (*Шевченко*, *Макаренко*).
8. Первая часть двойной фамилии, если отдельно не является фамилией (*Сквозняк-Дмухановский*).

### Склоняются:
1. Мужские фамилии и имена на согласный и `-ь` (*Игорь Коваль*, *Адам Мицкевич*).
2. Женские имена на `-ь` (*Любовь* → *Любови*, *Юдифь*).
3. Фамилии на неударные `-а`, `-я` (*Окуджава* → *Окуджавы*, *Вайда*).
4. Славянские фамилии на ударные `-а`, `-я` (*Сковорода* → *Сковороды*).
5. Первая часть русских двойных фамилий, если употребляется самостоятельно (*Лебедев-Кумач* → *Лебедева-Кумача*).
6. Иностранное имя перед фамилией на согласный (*Жюль Верн* → *Жюля Верна*).
7. Польские и чешские женские фамилии на `-а` склоняются как русские на `-ая` (*Бандровска* → *Бандровской*).

---

## 10. Примеры интеграции в код

### 10.1 1С:Предприятие 8.x (Управляемые и обычные формы)
```bsl
&НаКлиенте
Функция СклонятьФИО(СтрокаФИО, НомерПадежа)
    Попытка
        Padeg = Новый COMОбъект("PadegUCA.Declension");
        // Вызов GetFIOPadegFS: ФИО, Пол ("" - автоопределение), Падеж (1..6)
        Возврат Padeg.GetFIOPadegFS(СтрокаФИО, "", НомерПадежа);
    Исключение
        Сообщить("Ошибка инициализации PadegUCA.dll: " + ОписаниеОшибки());
        Возврат СтрокаФИО;
    КонецПопытки;
КонецФункции
```

### 10.2 C# (.NET P/Invoke)
```csharp
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class PadegNative
{
    private const string DllPath = "PadegUC.dll";

    [DllImport(DllPath, EntryPoint = "GetFIOPadegFSAS", CharSet = CharSet.Unicode, CallingConvention = CallingConvention.StdCall)]
    public static extern int GetFIOPadegFSAS(
        string pFIO,
        int nPadeg,
        StringBuilder pResult,
        ref int nLen
    );

    public static string DeclineFIO(string fio, int padeg)
    {
        int len = fio.Length + 40;
        var sb = new StringBuilder(len);
        int res = GetFIOPadegFSAS(fio, padeg, sb, ref len);
        if (res == 0) return sb.ToString(0, len);
        throw new InvalidOperationException($"Ошибка склонения: код {res}");
    }
}
```

### 10.3 VBA (MS Excel / Access / Word)
```vba
Private Declare PtrSafe Function GetPadeg Lib "PadegUC.dll" Alias "GetFIOPadegFSAS" _
  (ByVal pFIO As String, ByVal nPadeg As Long, ByVal pResult As String, ByRef nLen As Long) As Integer

Public Function MakePadeg(ByVal cFIO As String, ByVal nPadeg As Long) As String
    Dim tmpS As String
    Dim nLen As Long
    Dim ret As Integer
    nLen = 255
    tmpS = String(nLen, 0)
    ret = GetPadeg(StrConv(cFIO, vbUnicode), nPadeg, tmpS, nLen)
    tmpS = StrConv(tmpS, vbFromUnicode)
    If ret = 0 Then
        MakePadeg = Left(tmpS, nLen)
    Else
        MakePadeg = cFIO
    End If
End Function
```

---

## 11. LLM Tools Definition (OpenAPI / Function Calling JSON Schema)

Для использования библиотеки в составе AI-агентов, LangChain, AutoGen или Google GenAI Tool Calling используйте следующие структурированные схемы вызова:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PadegDeclensionTools",
  "description": "Набор инструментов морфологического склонения библиотеки Padeg v4.1 для LLM-агентов",
  "tools": [
    {
      "name": "decline_fio",
      "description": "Склонение Фамилии Имени Отчества в заданный падеж (1-Именительный, 2-Родительный, 3-Дательный, 4-Винительный, 5-Творительный, 6-Предложный)",
      "parameters": {
        "type": "object",
        "properties": {
          "fio": {
            "type": "string",
            "description": "Полное ФИО человека в именительном падеже, например 'Иванов Иван Иванович'"
          },
          "padeg": {
            "type": "integer",
            "minimum": 1,
            "maximum": 6,
            "description": "Номер падежа: 1-Им, 2-Род, 3-Дат, 4-Вин, 5-Твор, 6-Предл"
          },
          "sex": {
            "type": "string",
            "enum": ["auto", "male", "female"],
            "default": "auto",
            "description": "Пол: 'auto' (автоматически по отчеству), 'male' (мужской), 'female' (женский)"
          }
        },
        "required": ["fio", "padeg"]
      }
    },
    {
      "name": "decline_appointment_and_office",
      "description": "Согласованное склонение должности и подразделения/организации",
      "parameters": {
        "type": "object",
        "properties": {
          "appointment": {
            "type": "string",
            "description": "Наименование должности, например 'Начальник цеха' или 'генеральный директор'"
          },
          "office": {
            "type": "string",
            "description": "Наименование подразделения или организации, например 'Цех нестандартного оборудования'"
          },
          "padeg": {
            "type": "integer",
            "minimum": 1,
            "maximum": 6,
            "description": "Номер падежа: 1-Им, 2-Род, 3-Дат, 4-Вин, 5-Твор, 6-Предл"
          }
        },
        "required": ["appointment", "padeg"]
      }
    },
    {
      "name": "restore_nominative_fio",
      "description": "Восстановление исходной формы именительного падежа ФИО из косвенного падежа",
      "parameters": {
        "type": "object",
        "properties": {
          "fio_in_case": {
            "type": "string",
            "description": "ФИО в произвольном косвенном падеже, например 'Ивановым Иваном Ивановичем'"
          }
        },
        "required": ["fio_in_case"]
      }
    },
    {
      "name": "decline_currency_sum",
      "description": "Склонение суммы и валюты прописью по стандарту ISO 4217 (RUB, USD, EUR, KZT)",
      "parameters": {
        "type": "object",
        "properties": {
          "amount": {
            "type": "number",
            "description": "Числовое значение суммы (например 123.45)"
          },
          "currency_code": {
            "type": "string",
            "default": "RUB",
            "description": "Код валюты: RUB, USD, EUR, KZT, JPY"
          },
          "padeg": {
            "type": "integer",
            "minimum": 1,
            "maximum": 6,
            "description": "Номер целевого падежа"
          },
          "form": {
            "type": "integer",
            "enum": [0, 1, 2],
            "default": 0,
            "description": "0: прописью без скобок, 1: сумма прописью в скобках, 2: число цифрами + пропись в скобках"
          }
        },
        "required": ["amount", "padeg"]
      }
    }
  ]
}
```
