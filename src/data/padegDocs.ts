export interface PadegFunction {
  id: string;
  name: string;
  alias?: string;
  category: 'fio' | 'appointment' | 'nominative' | 'numerals' | 'service' | 'dictionary';
  description: string;
  summary: string;
  pascalSignature: string;
  cppSignature: string;
  csharpSignature: string;
  comSignature?: string;
  firebirdUdf?: string;
  parameters: {
    name: string;
    type: string;
    direction: 'in' | 'out' | 'in/out';
    description: string;
    allowedValues?: string[];
  }[];
  returns: string;
  example: {
    input: string;
    code: string;
    output: string;
  };
  notes?: string[];
}

export interface DictionarySection {
  name: string;
  title: string;
  description: string;
  supportsMask: boolean;
  examples: string[];
  caveats?: string;
}

export const PADEG_CASES = [
  { id: 1, name: 'Именительный', question: 'Кто? Что?', preposition: '', example: 'Иванов Иван Иванович' },
  { id: 2, name: 'Родительный', question: 'Кого? Чего?', preposition: 'нет', example: 'Иванова Ивана Ивановича' },
  { id: 3, name: 'Дательный', question: 'Кому? Чему?', preposition: 'дать', example: 'Иванову Ивану Ивановичу' },
  { id: 4, name: 'Винительный', question: 'Кого? Что?', preposition: 'вижу', example: 'Иванова Ивана Ивановича' },
  { id: 5, name: 'Творительный', question: 'Кем? Чем?', preposition: 'горжусь', example: 'Ивановым Иваном Ивановичем' },
  { id: 6, name: 'Предложный', question: 'О ком? О чем?', preposition: 'думаю о', example: 'Иванове Иване Ивановиче' },
];

export const RETURN_CODES = [
  { code: 0, title: 'Успех', description: 'Операция преобразования выполнена успешно без ошибок.' },
  { code: -1, title: 'Ошибка падежа', description: 'Передан недопустимый номер падежа (допустимы только целые числа от 1 до 6).' },
  { code: -2, title: 'Ошибка рода', description: 'Недопустимое значение рода (сохранено для совместимости с v1.x; в v4.x булевский параметр).' },
  { code: -3, title: 'Недостаточен буфер', description: 'Размер буфера pResult меньше требуемой длины результата. Результат усекается.' },
  { code: -4, title: 'Малый буфер имени', description: 'В GetFIOParts: размер буфера pFirstName недостаточен для имени.' },
  { code: -5, title: 'Малый буфер отчества', description: 'В GetFIOParts: размер буфера pMiddleName недостаточен для отчества.' },
];

export const REGISTRY_CONFIG = [
  { key: 'ExceptionDicDir', type: 'REG_SZ (String)', defaultVal: 'Каталог программы или MS Office', desc: 'Путь к каталогу, содержащему файл словаря исключений Except.dic' },
  { key: 'CurrencyDic', type: 'REG_SZ (String)', defaultVal: 'C:\\DevelopXE\\Declension\\Currency.txt', desc: 'Абсолютный путь к справочнику валют Currency.txt' },
  { key: 'AccentSymbol', type: 'REG_SZ (String)', defaultVal: '" (кавычка)', desc: 'Символ для обозначения ударной гласной в секции словаря [Accent]' },
  { key: 'AccentPosition', type: 'REG_DWORD (Integer)', defaultVal: '0 (перед гласной)', desc: 'Положение символа ударения: 0 - перед гласной, 1 - после гласной' },
];

export const PADEG_FUNCTIONS: PadegFunction[] = [
  {
    id: 'GetFIOPadeg',
    name: 'GetFIOPadeg',
    category: 'fio',
    summary: 'Основная универсальная функция склонения раздельных фамилии, имени и отчества',
    description: 'Помещает в буфер pResult размера nLen результат склонения фамилии, имени и отчества указанного пола в заданный падеж. Поддерживает составные фамилии с дефисом, инициалы и восточные имена.',
    pascalSignature: 'function GetFIOPadeg(pLastName, pFirstName, pMiddleName: PChar; bSex: Boolean; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetFIOPadeg(const wchar_t* pLastName, const wchar_t* pFirstName, const wchar_t* pMiddleName, bool bSex, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetFIOPadeg(string pLastName, string pFirstName, string pMiddleName, bool bSex, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetFIOPadeg(const cLastName, cFirstName, cMiddleName, cSex: WideString; nPadeg: Integer): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETFIOPADEG CSTRING(200), CSTRING(200), CSTRING(200), INTEGER, INTEGER RETURNS CSTRING(500) ENTRY_POINT \'GetFIOPadeg\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pLastName', type: 'PChar / Unicode', direction: 'in', description: 'Фамилия (может быть пустой, напр. для Ли Сицын)' },
      { name: 'pFirstName', type: 'PChar / Unicode', direction: 'in', description: 'Имя' },
      { name: 'pMiddleName', type: 'PChar / Unicode', direction: 'in', description: 'Отчество' },
      { name: 'bSex', type: 'Boolean', direction: 'in', description: 'Пол: True — мужской, False — женский', allowedValues: ['True (мужской)', 'False (женский)'] },
      { name: 'nPadeg', type: 'LongInt (1..6)', direction: 'in', description: 'Номер падежа (1 - Им., 2 - Род., 3 - Дат., 4 - Вин., 5 - Твор., 6 - Предл.)' },
      { name: 'pResult', type: 'PChar / Unicode', direction: 'out', description: 'Указатель на предварительно выделенный буфер результата' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'На входе: емкость буфера; на выходе: фактическая длина результата' },
    ],
    returns: '0 при успехе, -1 неверный падеж, -3 переполнение буфера',
    example: {
      input: 'Фамилия: "Иванов", Имя: "Иван", Отчество: "Иванович", Пол: Мужской, Падеж: 5 (Творительный)',
      code: 'GetFIOPadeg("Иванов", "Иван", "Иванович", True, 5, pBuf, nLen);',
      output: 'Ивановым Иваном Ивановичем',
    },
    notes: [
      'Буфер pResult должен быть выделен вызывающей стороной (не менее Length(fio) + 20).',
      'Для фамилий с инициалами (Сидоров И.П.) склоняется только фамилия.',
    ]
  },
  {
    id: 'GetFIOPadegAS',
    name: 'GetFIOPadegAS',
    alias: 'GetFIOPadegAutoSex',
    category: 'fio',
    summary: 'Склонение раздельного ФИО с автоматическим определением пола по отчеству',
    description: 'Помещает в буфер pResult размера nLen результат склонения ФИО с автоматическим распознаванием рода по окончанию отчества (включая восточные суффиксы Оглы и Кызы).',
    pascalSignature: 'function GetFIOPadegAS(pLastName, pFirstName, pMiddleName: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetFIOPadegAS(const wchar_t* pLastName, const wchar_t* pFirstName, const wchar_t* pMiddleName, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetFIOPadegAS(string pLastName, string pFirstName, string pMiddleName, int nPadeg, StringBuilder pResult, ref int nLen);',
    parameters: [
      { name: 'pLastName', type: 'PChar', direction: 'in', description: 'Фамилия' },
      { name: 'pFirstName', type: 'PChar', direction: 'in', description: 'Имя' },
      { name: 'pMiddleName', type: 'PChar', direction: 'in', description: 'Отчество (по его окончанию определяется пол)' },
      { name: 'nPadeg', type: 'LongInt (1..6)', direction: 'in', description: 'Номер целевого падежа' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер для записи результата' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Емкость буфера / фактическая длина' },
    ],
    returns: '0 при успехе, -1 неверный падеж, -3 переполнение буфера',
    example: {
      input: 'Петрова Анна Сергеевна, Падеж: 3 (Дательный)',
      code: 'GetFIOPadegAS("Петрова", "Анна", "Сергеевна", 3, pBuf, nLen);',
      output: 'Петровой Анне Сергеевне',
    },
  },
  {
    id: 'GetFIOPadegFS',
    name: 'GetFIOPadegFS',
    alias: 'GetFIOPadegFromStr',
    category: 'fio',
    summary: 'Склонение ФИО, заданного одной строкой, с явным указанием пола',
    description: 'Преобразует строку "Фамилия Имя Отчество" в требуемый падеж при явно указанном поле.',
    pascalSignature: 'function GetFIOPadegFS(pFIO: PChar; bSex: Boolean; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetFIOPadegFS(const wchar_t* pFIO, bool bSex, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetFIOPadegFS(string pFIO, bool bSex, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetFIOPadegFS(const cFIO, cSex: WideString; nPadeg: Integer): WideString;',
    parameters: [
      { name: 'pFIO', type: 'PChar', direction: 'in', description: 'ФИО одной строкой через пробел' },
      { name: 'bSex', type: 'Boolean', direction: 'in', description: 'Пол: True - мужской, False - женский' },
      { name: 'nPadeg', type: 'LongInt (1..6)', direction: 'in', description: 'Номер падежа' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер для результата' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Емкость буфера / итоговая длина' },
    ],
    returns: '0 при успехе, отрицательный код при ошибке',
    example: {
      input: 'Соколов Николай Константинович, Пол: М, Падеж: 2',
      code: 'GetFIOPadegFS("Соколов Николай Константинович", True, 2, pBuf, nLen);',
      output: 'Соколова Николая Константиновича',
    }
  },
  {
    id: 'GetFIOPadegFSAS',
    name: 'GetFIOPadegFSAS',
    alias: 'GetFIOPadegFromStrAutoSex',
    category: 'fio',
    summary: 'Склонение ФИО одной строкой с автоматическим определением пола (Самая популярная)',
    description: 'Наиболее удобная функция для большинства сценариев: принимает полное ФИО одной строкой и падеж, автоматически распознает род по отчеству и возвращает просклоненное ФИО.',
    pascalSignature: 'function GetFIOPadegFSAS(pFIO: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetFIOPadegFSAS(const wchar_t* pFIO, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetFIOPadegFSAS(string pFIO, int nPadeg, StringBuilder pResult, ref int nLen);',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETFIOPADEGFSAS CSTRING(200), INTEGER RETURNS CSTRING(200) ENTRY_POINT \'GetFIOPadegFSAS\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pFIO', type: 'PChar', direction: 'in', description: 'Полное ФИО в именительном падеже' },
      { name: 'nPadeg', type: 'LongInt (1..6)', direction: 'in', description: 'Номер падежа' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер для результата' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Емкость буфера / длина строки' },
    ],
    returns: '0 при успехе, -1 неверный падеж, -3 буфер недостаточен',
    example: {
      input: 'Давыдов Денис Олегович, Падеж: 5 (Творительный)',
      code: 'GetFIOPadegFSAS("Давыдов Денис Олегович", 5, pBuf, nLen);',
      output: 'Давыдовым Денисом Олеговичем',
    }
  },
  {
    id: 'GetIFPadeg',
    name: 'GetIFPadeg',
    category: 'fio',
    summary: 'Склонение пар "Имя Фамилия" раздельно',
    description: 'Склонение имен собственных в формате "Имя [Имена] Фамилия" (например, "Марк Твен", "Джон Фиджеральд Кеннеди"). Разделитель нескольких имен — пробел.',
    pascalSignature: 'function GetIFPadeg(pFirstName, pLastName: PChar; bSex: Boolean; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetIFPadeg(const wchar_t* pFirstName, const wchar_t* pLastName, bool bSex, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetIFPadeg(string pFirstName, string pLastName, bool bSex, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetIFPadeg(const cFirstName, cLastName, cSex: WideString; nPadeg: Integer): WideString;',
    parameters: [
      { name: 'pFirstName', type: 'PChar', direction: 'in', description: 'Имя или группа имен ("Джон Фиджеральд")' },
      { name: 'pLastName', type: 'PChar', direction: 'in', description: 'Фамилия ("Кеннеди")' },
      { name: 'bSex', type: 'Boolean', direction: 'in', description: 'Пол' },
      { name: 'nPadeg', type: 'LongInt', direction: 'in', description: 'Падеж' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: 'Имя: "Марк", Фамилия: "Твен", Пол: М, Падеж: 2',
      code: 'GetIFPadeg("Марк", "Твен", True, 2, pBuf, nLen);',
      output: 'Марка Твена',
    }
  },
  {
    id: 'GetIFPadegFS',
    name: 'GetIFPadegFS',
    category: 'fio',
    summary: 'Склонение пар "Имя Фамилия" одной строкой',
    description: 'Склонение пары "Имя Фамилия", переданной единой строкой. Последнее слово считается фамилией, все предшествующие — именами.',
    pascalSignature: 'function GetIFPadegFS(pIF: PChar; bSex: Boolean; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetIFPadegFS(const wchar_t* pIF, bool bSex, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetIFPadegFS(string pIF, bool bSex, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetIFPadegFS(const cIF, cSex: WideString; nPadeg: Integer): WideString;',
    parameters: [
      { name: 'pIF', type: 'PChar', direction: 'in', description: 'Строка "Имя Фамилия"' },
      { name: 'bSex', type: 'Boolean', direction: 'in', description: 'Пол' },
      { name: 'nPadeg', type: 'LongInt', direction: 'in', description: 'Падеж' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '"Жюль Верн", Пол: М, Падеж: 2',
      code: 'GetIFPadegFS("Жюль Верн", True, 2, pBuf, nLen);',
      output: 'Жюля Верна',
    }
  },
  {
    id: 'GetNominativePadeg',
    name: 'GetNominativePadeg',
    category: 'nominative',
    summary: 'Восстановление именительного падежа из произвольного падежа',
    description: 'Анализирует переданное в любом падеже ФИО и восстанавливает его форму в именительном падеже ("Фамилия Имя Отчество"). В неоднозначных случаях рекомендуется сверка с базой данных.',
    pascalSignature: 'function GetNominativePadeg(pFIO, pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetNominativePadeg(const wchar_t* pFIO, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetNominativePadeg(string pFIO, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetNominativePadeg(const cFIO: WideString): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETNOMINATIVEPADEG CSTRING(500) RETURNS CSTRING(500) ENTRY_POINT \'GetNominativePadeg\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pFIO', type: 'PChar', direction: 'in', description: 'ФИО в произвольном падеже ("Ивановым Иваном Ивановичем")' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер под восстановленный результат' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Размер буфера' },
    ],
    returns: '0 при успехе, -3 при недостатке буфера',
    example: {
      input: '"Иванову Ивану Ивановичу"',
      code: 'GetNominativePadeg("Иванову Ивану Ивановичу", pBuf, nLen);',
      output: 'Иванов Иван Иванович',
    }
  },
  {
    id: 'GetAppointmentPadeg',
    name: 'GetAppointmentPadeg',
    category: 'appointment',
    summary: 'Склонение наименования должности',
    description: 'Склоняет наименование должности, записанное одной строкой. При составных должностях (например, "Директор департамента - главный бухгалтер") рекомендуется разбивать строку по дефису.',
    pascalSignature: 'function GetAppointmentPadeg(pAppointment: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetAppointmentPadeg(const wchar_t* pAppointment, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetAppointmentPadeg(string pAppointment, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetAppointmentPadeg(const cAppointment: WideString; nPadeg: Integer): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETAPPOINTMENTPADEG CSTRING(500), INTEGER RETURNS CSTRING(500) ENTRY_POINT \'GetAppointmentPadeg\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pAppointment', type: 'PChar', direction: 'in', description: 'Наименование должности' },
      { name: 'nPadeg', type: 'LongInt', direction: 'in', description: 'Целевой падеж' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '"генеральный директор", Падеж: 3 (Дательный)',
      code: 'GetAppointmentPadeg("генеральный директор", 3, pBuf, nLen);',
      output: 'генеральному директору',
    }
  },
  {
    id: 'GetOfficePadeg',
    name: 'GetOfficePadeg',
    category: 'appointment',
    summary: 'Склонение наименования подразделения или предприятия',
    description: 'Склоняет наименования структурных подразделений, отделов, цехов или предприятий.',
    pascalSignature: 'function GetOfficePadeg(pOffice: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetOfficePadeg(const wchar_t* pOffice, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetOfficePadeg(string pOffice, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetOfficePadeg(const cOffice: WideString; nPadeg: Integer): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETOFFICEPADEG CSTRING(500), INTEGER RETURNS CSTRING(500) ENTRY_POINT \'GetOfficePadeg\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pOffice', type: 'PChar', direction: 'in', description: 'Наименование подразделения или предприятия' },
      { name: 'nPadeg', type: 'LongInt', direction: 'in', description: 'Целевой падеж' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '"Цех нестандартного оборудования", Падеж: 2',
      code: 'GetOfficePadeg("Цех нестандартного оборудования", 2, pBuf, nLen);',
      output: 'Цеха нестандартного оборудования',
    }
  },
  {
    id: 'GetFullAppointmentPadeg',
    name: 'GetFullAppointmentPadeg',
    category: 'appointment',
    summary: 'Полное объединенное склонение должности и подразделения (или документа и органа)',
    description: 'Формирует полное наименование ("Должность + Подразделение") и склоняет его в требуемый падеж с удалением повторяющихся слов. Может применяться для документов (напр. "Постановление" + "Совет Министров").',
    pascalSignature: 'function GetFullAppointmentPadeg(pAppointment, pOffice: PChar; nPadeg: LongInt; pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetFullAppointmentPadeg(const wchar_t* pAppointment, const wchar_t* pOffice, int nPadeg, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetFullAppointmentPadeg(string pAppointment, string pOffice, int nPadeg, StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetFullAppointmentPadeg(const cAppointment, cOffice: WideString; nPadeg: Integer): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETFULLAPPOINTMENTPADEG CSTRING(500), CSTRING(500), INTEGER RETURNS CSTRING(1000) ENTRY_POINT \'GetFullAppointmentPadeg\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pAppointment', type: 'PChar', direction: 'in', description: 'Должность (или вид документа, напр. "Постановление")' },
      { name: 'pOffice', type: 'PChar', direction: 'in', description: 'Подразделение (или орган, напр. "Совет Министров")' },
      { name: 'nPadeg', type: 'LongInt', direction: 'in', description: 'Целевой падеж' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: 'Должность: "Начальник цеха", Подразделение: "Цех нестандартного оборудования", Падеж: 3',
      code: 'GetFullAppointmentPadeg("Начальник цеха", "Цех нестандартного оборудования", 3, pBuf, nLen);',
      output: 'Начальнику цеха нестандартного оборудования',
    }
  },
  {
    id: 'GetSex',
    name: 'GetSex',
    category: 'service',
    summary: 'Определение рода по отчеству или ФИО',
    description: 'Анализирует отчество (или ФИО с отчеством в конце) в любом падеже и возвращает код пола.',
    pascalSignature: 'function GetSex(pMiddleName: PChar): Integer; stdcall;',
    cppSignature: 'int __stdcall GetSex(const wchar_t* pMiddleName);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetSex(string pMiddleName);',
    comSignature: 'function GetSex(const cMiddleName: WideString): Integer;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GET_SEX CSTRING(200) RETURNS INTEGER BY VALUE ENTRY_POINT \'Get_Sex\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pMiddleName', type: 'PChar', direction: 'in', description: 'Отчество или ФИО целиком (главное, чтобы отчество было последним)' }
    ],
    returns: '1 — Мужской, 0 — Женский, -1 — Не удалось определить',
    example: {
      input: '"Иванович"',
      code: 'int sex = GetSex("Иванович");',
      output: '1 (Мужской)',
    }
  },
  {
    id: 'GetPadegID',
    name: 'GetPadegID',
    category: 'service',
    summary: 'Определение номера падежа, в котором записано ФИО',
    description: 'Определяет падеж переданного ФИО. В случае омонимии падежных форм возвращает 2 для мужчин и 3 для женщин.',
    pascalSignature: 'function GetPadegID(pFIO: PChar): Integer; stdcall;',
    cppSignature: 'int __stdcall GetPadegID(const wchar_t* pFIO);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetPadegID(string pFIO);',
    parameters: [
      { name: 'pFIO', type: 'PChar', direction: 'in', description: 'Строка ФИО в косвенном падеже' }
    ],
    returns: '0 — не определен; 1..6 — номер падежа',
    example: {
      input: '"Ивановым Иваном Ивановичем"',
      code: 'int padeg = GetPadegID("Ивановым Иваном Ивановичем");',
      output: '5 (Творительный)',
    }
  },
  {
    id: 'GetFIOParts',
    name: 'GetFIOParts',
    category: 'service',
    summary: 'Выделение составляющих ФИО (Фамилия, Имя, Отчество)',
    description: 'Разбирает строку ФИО на три составляющие в специальную запись TPartsFIO с контролем длины каждого компонента. Корректно обрабатывает Оглы/Кызы через дефис или пробел.',
    pascalSignature: 'function GetFIOParts(pFIO: PChar; Parts: PPartsFIO): Integer; stdcall;',
    cppSignature: 'struct TPartsFIO { wchar_t *pLast, *pFirst, *pMid; int nLast, nFirst, nMid; };\nint __stdcall GetFIOParts(const wchar_t* pFIO, TPartsFIO* Parts);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetFIOParts(string pFIO, ref TPartsFIO Parts);',
    parameters: [
      { name: 'pFIO', type: 'PChar', direction: 'in', description: 'Исходная строка ФИО' },
      { name: 'Parts', type: 'PPartsFIO', direction: 'in/out', description: 'Указатель на структуру с буферами и длинами' }
    ],
    returns: '0 — Успех; -3 мал буфер фамилии; -4 мал буфер имени; -5 мал буфер отчества',
    example: {
      input: '"Иванов Иван Иванович"',
      code: 'GetFIOParts("Иванов Иван Иванович", @Parts);',
      output: 'pLastName="Иванов", pFirstName="Иван", pMiddleName="Иванович"',
    }
  },
  {
    id: 'UpdateExceptions',
    name: 'UpdateExceptions',
    category: 'dictionary',
    summary: 'Принятие изменений в файле словаря исключений',
    description: 'Выполняет горячую перезагрузку словаря исключений Except.dic без перезапуска вызывающего приложения.',
    pascalSignature: 'function UpdateExceptions: Boolean; stdcall;',
    cppSignature: 'bool __stdcall UpdateExceptions();',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall)]\npublic static extern bool UpdateExceptions();',
    comSignature: 'function Update_Exceptions: WordBool;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION UPDATEEXCEPTIONS RETURNS INTEGER BY VALUE ENTRY_POINT \'UpdateExceptions\' MODULE_NAME \'PadegFB\';',
    parameters: [],
    returns: 'True при успешной перезагрузке, False при ошибке',
    example: {
      input: 'Вызов после правки Except.dic в блокноте',
      code: 'bool ok = UpdateExceptions();',
      output: 'true',
    }
  },
  {
    id: 'GetExceptionsFileName',
    name: 'GetExceptionsFileName',
    category: 'dictionary',
    summary: 'Получение полного пути к активному словарю исключений',
    description: 'Возвращает путь к текущему используемому файлу словаря Except.dic.',
    pascalSignature: 'function GetExceptionsFileName(pResult: PChar; var nLen: LongInt): Integer; stdcall;',
    cppSignature: 'int __stdcall GetExceptionsFileName(wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int GetExceptionsFileName(StringBuilder pResult, ref int nLen);',
    comSignature: 'function GetExceptionsFileName: WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION GETDICTIONARY RETURNS CSTRING(500) CHARACTER SET UTF8 ENTRY_POINT \'GetDictionary\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер для пути' },
      { name: 'nLen', type: 'LongInt', direction: 'in/out', description: 'Размер буфера' },
    ],
    returns: '0 при успехе',
    example: {
      input: 'Запрос пути',
      code: 'GetExceptionsFileName(pBuf, nLen);',
      output: 'C:\\Program Files\\Microsoft Office\\Office\\Except.dic',
    }
  },
  {
    id: 'SetDictionary',
    name: 'SetDictionary',
    category: 'dictionary',
    summary: 'Установка альтернативного словаря исключений как рабочего',
    description: 'Позволяет в рантайме переключиться на другой файл словаря (без изменения системного реестра). Удобно для профилей пользователей и мультитенантных систем.',
    pascalSignature: 'function SetDictionary(FileName: PChar): Boolean; stdcall;',
    cppSignature: 'bool __stdcall SetDictionary(const wchar_t* FileName);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern bool SetDictionary(string FileName);',
    comSignature: 'function SetDictionary(const DicName: WideString): WordBool;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION SETDICTIONARY CSTRING(200) RETURNS INTEGER BY VALUE ENTRY_POINT \'SetDictionary\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'FileName', type: 'PChar', direction: 'in', description: 'Полный путь к новому файлу словаря' }
    ],
    returns: 'True если словарь загружен, иначе False',
    example: {
      input: '"D:\\MyProject\\CustomExcept.dic"',
      code: 'SetDictionary("D:\\MyProject\\CustomExcept.dic");',
      output: 'true',
    }
  },
  {
    id: 'NumberToString',
    name: 'NumberToString',
    category: 'numerals',
    summary: 'Базовое преобразование числа в строковый эквивалент прописью',
    description: 'Преобразует вещественное число Extended в словесную форму. Ограничение типа Extended: до 15 значащих цифр.',
    pascalSignature: 'function NumberToString(Quantity: Extended; iSex: Integer; Decimal: Integer; RemoveZero, CnvtFrac: Boolean; pResult: PChar; var nLen: Integer): Integer; stdcall;',
    cppSignature: 'int __stdcall NumberToString(double Quantity, int iSex, int Decimal, bool RemoveZero, bool CnvtFrac, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int NumberToString(double Quantity, int iSex, int Decimal, bool RemoveZero, bool CnvtFrac, StringBuilder pResult, ref int nLen);',
    comSignature: 'function NumberToString(Quantity: Double; iSex, Decimal: Integer; RemoveZero, CnvtFrac: WordBool): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION NUMBERTOSTRING CSTRING(50), INTEGER, INTEGER, INTEGER, INTEGER RETURNS CSTRING(500) CHARACTER SET UTF8 ENTRY_POINT \'NumberToString\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'Quantity', type: 'Extended / Double', direction: 'in', description: 'Число' },
      { name: 'iSex', type: 'Integer', direction: 'in', description: 'Род: -1 средний, 0 женский, 1 мужской', allowedValues: ['-1', '0', '1'] },
      { name: 'Decimal', type: 'Integer (<=15)', direction: 'in', description: 'Точность дробной части' },
      { name: 'RemoveZero', type: 'Boolean', direction: 'in', description: 'Удалять незначащие нули в дробной части' },
      { name: 'CnvtFrac', type: 'Boolean', direction: 'in', description: 'Преобразовывать дробную часть в слова (True) или цифрами (False)' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'Integer', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '231.152, Мужской род, Decimal=3, RemoveZero=True, CnvtFrac=True',
      code: 'NumberToString(231.152, 1, 3, True, True, pBuf, nLen);',
      output: 'двести тридцать один и сто пятьдесят две тысячные',
    }
  },
  {
    id: 'SumInWords',
    name: 'SumInWords',
    category: 'numerals',
    summary: 'Преобразование сверхдлинных сумм строкой прописью без потери точности',
    description: 'Аналог NumberToString, принимающий число в виде строки PChar для обхода 15-значного лимита Extended. Поддерживает до 15 знаков целой части и 14 знаков дробной части (до «стотриллионных»).',
    pascalSignature: 'function SumInWords(Quantity: PChar; iSex: Integer; Decimal: Integer; RemoveZero, CnvtFrac: Boolean; pResult: PChar; var nLen: Integer): Integer; stdcall;',
    cppSignature: 'int __stdcall SumInWords(const wchar_t* Quantity, int iSex, int Decimal, bool RemoveZero, bool CnvtFrac, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int SumInWords(string Quantity, int iSex, int Decimal, bool RemoveZero, bool CnvtFrac, StringBuilder pResult, ref int nLen);',
    comSignature: 'function SumInWords(const Quantity: WideString; iSex, Decimal: Integer; RemoveZero, CnvtFrac: WordBool): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION SUMINWORDS DOUBLE PRECISION, INTEGER, INTEGER, INTEGER, INTEGER RETURNS CSTRING(500) CHARACTER SET UTF8 ENTRY_POINT \'SumInWords\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'Quantity', type: 'PChar (String)', direction: 'in', description: 'Число в строковом виде' },
      { name: 'iSex', type: 'Integer', direction: 'in', description: 'Род (-1, 0, 1)' },
      { name: 'Decimal', type: 'Integer', direction: 'in', description: 'Точность дроби' },
      { name: 'RemoveZero', type: 'Boolean', direction: 'in', description: 'Удалять незначащие нули' },
      { name: 'CnvtFrac', type: 'Boolean', direction: 'in', description: 'Словами или цифрами' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'Integer', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '"123456789123456,12345678912345"',
      code: 'SumInWords("123456789123456,12345678912345", 1, 14, True, True, pBuf, nLen);',
      output: 'сто двадцать три триллиона четыреста пятьдесят шесть миллиардов семьсот восемьдесят девять миллионов сто двадцать три тысячи четыреста пятьдесят шесть и двенадцать триллионов триста сорок пять миллиардов шестьсот семьдесят восемь миллионов девятьсот двенадцать тысяч триста сорок пять стотриллионных',
    }
  },
  {
    id: 'DoubleToVerbal',
    name: 'DoubleToVerbal',
    category: 'numerals',
    summary: 'Преобразование числа прописью со словами «целая / целых / целые»',
    description: 'Упрощенный вызов NumberToString с Decimal=14, RemoveZero=True, CnvtFrac=True и добавлением грамматического разделителя "целые / целых".',
    pascalSignature: 'function DoubleToVerbal(Quantity: Extended; pResult: PChar; var nLen: Integer): Integer; stdcall;',
    cppSignature: 'int __stdcall DoubleToVerbal(double Quantity, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int DoubleToVerbal(double Quantity, StringBuilder pResult, ref int nLen);',
    comSignature: 'function DoubleToVerbal(Quantity: Double): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION DOUBLETOVERBAL DOUBLE PRECISION RETURNS CSTRING(500) CHARACTER SET UTF8 ENTRY_POINT \'DoubleToVerbal\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'Quantity', type: 'Extended / Double', direction: 'in', description: 'Вещественное число' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'Integer', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '123.46',
      code: 'DoubleToVerbal(123.46, pBuf, nLen);',
      output: 'сто двадцать три целые и сорок шесть сотых',
    }
  },
  {
    id: 'DeclNumeral',
    name: 'DeclNumeral',
    category: 'numerals',
    summary: 'Склонение текстового числительного в любой падеж',
    description: 'Склоняет текстовое числительное в именительном падеже (полученное из NumberToString, SumInWords или DoubleToVerbal) с учетом рода, одушевленности и порядка.',
    pascalSignature: 'function DeclNumeral(Value: PChar; nPadeg: Integer; iSex: Integer; Order, Soul: Boolean; pResult: PChar; var nLen: Integer): Integer; stdcall;',
    cppSignature: 'int __stdcall DeclNumeral(const wchar_t* Value, int nPadeg, int iSex, bool Order, bool Soul, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int DeclNumeral(string Value, int nPadeg, int iSex, bool Order, bool Soul, StringBuilder pResult, ref int nLen);',
    comSignature: 'function DeclNumeral(const Value: WideString; nPadeg, iSex: Integer; Order, Soul: WordBool): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION DECLNUMERAL CSTRING(50), INTEGER, INTEGER, INTEGER, INTEGER RETURNS CSTRING(500) CHARACTER SET UTF8 ENTRY_POINT \'DeclNumeral\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'Value', type: 'PChar', direction: 'in', description: 'Строковое числительное в именительном падеже' },
      { name: 'nPadeg', type: 'Integer (1..6)', direction: 'in', description: 'Целевой падеж' },
      { name: 'iSex', type: 'Integer', direction: 'in', description: '-1 средний, 0 женский, 1 мужской' },
      { name: 'Order', type: 'Boolean', direction: 'in', description: 'True - порядковое, False - количественное' },
      { name: 'Soul', type: 'Boolean', direction: 'in', description: 'True - одушевленное, False - неодушевленное' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'Integer', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: '"сто двадцать три и сорок пять сотых", Падеж: 5 (Творительный)',
      code: 'DeclNumeral("сто двадцать три и сорок пять сотых", 5, 1, False, False, pBuf, nLen);',
      output: 'ста двадцатью тремя и сорока пятью сотыми',
    }
  },
  {
    id: 'DeclCurrency',
    name: 'DeclCurrency',
    category: 'numerals',
    summary: 'Склонение суммы и валюты по справочнику Currency.txt',
    description: 'Склоняет числовую сумму валюты (RUB, USD, EUR, KZT или кастомных единиц измерения) с банковским округлением сотых до четного. Формы вывода: 0 (прописью), 1 (в скобках), 2 (цифры + пропись в скобках).',
    pascalSignature: 'function DeclCurrency(Quantity: Currency; CurrName: PChar; nPadeg: Integer; Forms: Byte; pResult: PChar; var nLen: Integer): Integer; stdcall;',
    cppSignature: 'int __stdcall DeclCurrency(CY Quantity, const wchar_t* CurrName, int nPadeg, unsigned char Forms, wchar_t* pResult, int& nLen);',
    csharpSignature: '[DllImport("PadegUC.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Unicode)]\npublic static extern int DeclCurrency(decimal Quantity, string CurrName, int nPadeg, byte Forms, StringBuilder pResult, ref int nLen);',
    comSignature: 'function DeclCurrency(Quantity: Currency; const CurrName: WideString; nPadeg, Forms: Integer): WideString;',
    firebirdUdf: 'DECLARE EXTERNAL FUNCTION DECLCURRENCY NUMERIC(18,4), CSTRING(10), INTEGER, INTEGER RETURNS CSTRING(500) CHARACTER SET UTF8 ENTRY_POINT \'DeclCurrency\' MODULE_NAME \'PadegFB\';',
    parameters: [
      { name: 'Quantity', type: 'Currency / Decimal', direction: 'in', description: 'Сумма' },
      { name: 'CurrName', type: 'PChar', direction: 'in', description: 'Код валюты ISO 4217 ("RUB", "USD", "EUR", "KZT" или кастомный "#M2")' },
      { name: 'nPadeg', type: 'Integer (1..6)', direction: 'in', description: 'Падеж' },
      { name: 'Forms', type: 'Byte (0..2)', direction: 'in', description: '0 - прописью, 1 - в скобках, 2 - число + пропись в скобках' },
      { name: 'pResult', type: 'PChar', direction: 'out', description: 'Буфер' },
      { name: 'nLen', type: 'Integer', direction: 'in/out', description: 'Длина' },
    ],
    returns: '0 при успехе',
    example: {
      input: 'Quantity=123.45, CurrName="RUB", Падеж=5, Forms=0',
      code: 'DeclCurrency(123.45, "RUB", 5, 0, pBuf, nLen);',
      output: 'ста двадцатью тремя российскими рублями 45 копейками',
    }
  },
];

export const DICTIONARY_SECTIONS: DictionarySection[] = [
  {
    name: 'LastName',
    title: 'Несклоняемые фамилии обоих полов',
    description: 'Фамилии, которые не склоняются ни при каких условиях (включая первые части составных фамилий).',
    supportsMask: true,
    examples: ['*ава', 'Дюма', 'Золя', 'Гюго', 'Бизе'],
    caveats: 'Маска *ава исключит все японские и грузинские фамилии на -ава (Куросава, Окуджава).'
  },
  {
    name: 'LastNameW',
    title: 'Несклоняемые женские фамилии',
    description: 'Фамилии, не преобразуемые исключительно для женского рода.',
    supportsMask: true,
    examples: ['*их', '*ых', 'Коваль', 'Жук', 'Мицкевич'],
  },
  {
    name: 'DependedLastNameW',
    title: 'Зависимые женские фамилии на -ина',
    description: 'Женские фамилии (как правило на -ина), склонение которых зависит от склонения соответствующей мужской фамилии (напр. Щербина -> муж. Щербин или Щербина).',
    supportsMask: false,
    examples: ['Щербина'],
  },
  {
    name: 'FirstNameM',
    title: 'Несклоняемые мужские имена',
    description: 'Мужские имена иноязычного происхождения, оканчивающиеся на гласные звуки кроме -а, -я.',
    supportsMask: true,
    examples: ['Серго', 'Бату', 'Шота'],
  },
  {
    name: 'FirstNameW',
    title: 'Несклоняемые женские имена',
    description: 'Женские имена на согласный звук или иноязычные на гласный.',
    supportsMask: true,
    examples: ['Кармен', 'Гюльчетай', 'Долорес', 'Элен', 'Элизабет', 'Нелли'],
    caveats: 'Будьте осторожны с маской *ь: она исключит и русские имена, такие как Любовь.'
  },
  {
    name: 'FirstPartLastName',
    title: 'Несклоняемые первые части составных фамилий',
    description: 'Первые части двойных фамилий, которые сами по себе не употребляются как фамилия.',
    supportsMask: true,
    examples: ['Бонч', 'Мамин', 'Сквозняк', 'Грун'],
  },
  {
    name: 'BaseNonRussian',
    title: 'Неславянские фамилии на -ов, -ин, -их',
    description: 'Фамилии не славянского происхождения, которые должны склоняться по русским правилам (в творительном падеже на -ом/-ем).',
    supportsMask: false,
    examples: ['Бюлов', 'Рабин', 'Либих', 'Дарвин', 'Чаплин'],
  },
  {
    name: 'NonLeaveVocalic',
    title: 'Фамилии на -ок, -ец без выпадения беглой гласной',
    description: 'Фамилии, в которых при склонении сохраняется гласная (Корешок -> Корешока, а не Корешка).',
    supportsMask: false,
    examples: ['Корешок', 'Перец'],
  },
  {
    name: 'FirstNameParallelForms',
    title: 'Параллельные формы мужских имен на -о/-а',
    description: 'Народные и разговорные параллели мужских имен (Михайло -> Михайла).',
    supportsMask: false,
    examples: ['Михайло', 'Гаврило'],
  },
  {
    name: 'Accent',
    title: 'Учет положения ударения',
    description: 'Женские имена на -ия, мужские фамилии на -ец и фамилии на -а с предшествующей шипящей, где окончание зависит от ударения.',
    supportsMask: false,
    examples: ['Судь"я', 'Пев"ец'],
    caveats: 'Ударная гласная предваряется символом из AccentSymbol реестра (по умолч. кавычка).'
  },
  {
    name: 'NonAdjective',
    title: 'Слова на -ая/-ий, не являющиеся прилагательными',
    description: 'Существительные, совпадающие по окончанию с прилагательными, но склоняющиеся как существительные.',
    supportsMask: false,
    examples: ['Лесничий', 'Городничий'],
  },
  {
    name: 'NonDeclBeforeHyphen',
    title: 'Несклоняемые части составных слов перед дефисом',
    description: 'Первые части сложных слов и терминов, не изменяющиеся при склонении.',
    supportsMask: false,
    examples: ['кафе', 'пресс', 'интернет'],
  },
  {
    name: 'HyphenAbbreviation',
    title: 'Сокращения существительных через дефис',
    description: 'Сокращенные наименования и аббревиатуры с дефисом.',
    supportsMask: false,
    examples: ['зам-пред', 'пом-ком'],
  },
  {
    name: 'PointAbbreviation',
    title: 'Сокращения существительных через точку',
    description: 'Аббревиатуры и сокращения, оканчивающиеся точкой.',
    supportsMask: false,
    examples: ['и.о.', 'врио', 'зав.'],
  },
  {
    name: 'Plural',
    title: 'Существительные во множественном числе',
    description: 'Существительные pluralia tantum, не имеющие формы единственного числа.',
    supportsMask: false,
    examples: ['Ножницы', 'Сутки', 'Весы'],
  },
];

export const CURRENCY_SPEC = {
  columns: [
    { index: 1, name: 'Код валюты', desc: 'ISO 4217 (RUB, USD, EUR) или кастомный (#M2, #BT)' },
    { index: 2, name: 'Род', desc: 'М (мужской), Ж (женский)' },
    { index: 3, name: 'Корень страны', desc: 'Основа прилагательного страны (напр. "российск")' },
    { index: 4, name: 'Окончание страны для 1', desc: 'Например, "ий" -> российский' },
    { index: 5, name: 'Окончание страны для 2-4', desc: 'Например, "их" -> российских' },
    { index: 6, name: 'Окончание страны для 5-0', desc: 'Например, "их" -> российских' },
    { index: 7, name: 'Корень валюты', desc: 'Основа наименования (напр. "рубл", "доллар", "евро")' },
    { index: 8, name: 'Окончание валюты для 1', desc: 'Например, "ь" -> рубль, "а" -> гривна' },
    { index: 9, name: 'Окончание валюты для 2-4', desc: 'Например, "я" -> рубля, "ы" -> гривны' },
    { index: 10, name: 'Окончание валюты для 5-0', desc: 'Например, "ей" -> рублей, "" -> гривен' },
    { index: 11, name: 'Доп. наименование', desc: 'Пояснение ("США", "Великобритании")' },
    { index: 12, name: 'Корень сотой части', desc: 'Основа сотых долей (напр. "копе", "цент")' },
    { index: 13, name: 'Окончание сотой для 1', desc: 'Например, "йка" -> копейка, "" -> цент' },
    { index: 14, name: 'Окончание сотой для 2-4', desc: 'Например, "йки" -> копейки, "а" -> цента' },
    { index: 15, name: 'Окончание сотой для 5-0', desc: 'Например, "ек" -> копеек, "ов" -> центов' },
  ],
  samples: [
    'EUR,М,           ,  ,  ,  ,евро     ,  ,  ,  ,          ,цент    ,   ,а  ,ов',
    'USD,М,           ,  ,  ,  ,доллар   ,  ,а ,ов,США       ,цент    ,   ,а  ,ов',
    'JPY,Ж,японск     ,ая,их,их,йен      ,а ,ы',
    'KZT,М,казахстанск,ий,их,их,тенге    ,  ,  ,  ,          ,тиын',
    'RUB,М,российск   ,ий,их,их,рубл     ,ь ,я ,ей,          ,копе    ,йка,йки,ек',
    '#M2,М,квадратн   ,ый,ых,ых,метр     ,  ,а ,ов',
    '#BT,М,           ,  ,  ,  ,байт     ,  ,а ,ов',
    '#PG,М,           ,  ,  ,  ,попуга   ,й ,я ,ев,          ,крылыш  ,ко ,ка ,ек',
  ]
};
