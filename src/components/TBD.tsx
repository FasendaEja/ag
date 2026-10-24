const tbdItems = [
  {
    id: 1,
    question: "Точные эндпоинты DoQA API 4.3.1",
    description: "Необходимо получить официальную документацию DoQA API для определения точных URL эндпоинтов.",
    impact: "Без этого невозможно выполнить реальные запросы к DoQA. Адаптер работает в mock/dry-run режиме.",
    category: "integration",
    file: "integrations/doqa/api_contract.yaml",
  },
  {
    id: 2,
    question: "Формат экспорта кейсов из DoQA",
    description: "Неизвестен точный формат данных при экспорте тест-кейсов из DoQA.",
    impact: "Адаптер не может корректно парсить ответ от DoQA.",
    category: "integration",
    file: "integrations/doqa/doqa_api_adapter.py",
  },
  {
    id: 3,
    question: "Формат файла импорта в DoQA",
    description: "Неизвестна точная структура файла для массового импорта тест-кейсов в DoQA.",
    impact: "До получения формата используется внутренний JSON-формат. Генерация файла для импорта может быть несовместима.",
    category: "integration",
    file: "integrations/doqa/doqa_file_export_adapter.py",
  },
  {
    id: 4,
    question: "Методы DoQA API для создания и обновления тест-кейсов",
    description: "Неизвестны HTTP-методы, пути и схемы запросов для CRUD операций с тест-кейсами.",
    impact: "Адаптер не может создавать, обновлять или архивировать кейсы через API.",
    category: "integration",
    file: "integrations/doqa/doqa_api_adapter.py",
  },
  {
    id: 5,
    question: "Способ аутентификации в DoQA API",
    description: "Неизвестен метод аутентификации: Bearer token, API key, Basic auth, OAuth и т.д.",
    impact: "Невозможно настроить авторизацию в адаптере.",
    category: "security",
    file: ".env.example",
  },
  {
    id: 6,
    question: "Внутренние ID статусов \"Ревью\" и \"Архив\"",
    description: "Неизвестны числовые или строковые идентификаторы статусов внутри DoQA.",
    impact: "Система не может корректно устанавливать статусы кейсов при импорте.",
    category: "integration",
    file: "config/doqa_status_mapping.yaml",
  },
  {
    id: 7,
    question: "Поддержка изменения структуры кейсов через DoQA API",
    description: "Неизвестно, предоставляет ли DoQA API методы для управления структурой (папки, разделы, группы).",
    impact: "Если API не поддерживает — предложения по структуре формируются как отчёт для ручного выполнения.",
    category: "integration",
    file: "integrations/doqa/doqa_structure_service.py",
  },
  {
    id: 8,
    question: "Интерфейс внешнего агента кодовой базы",
    description: "Формат запроса и ответа к внешнему агенту кодовой базы пока не определён.",
    impact: "Адаптер работает в режиме заглушки. Контекст из кодовой базы не собирается.",
    category: "architecture",
    file: "adapters/external_codebase_agent_adapter.py",
  },
  {
    id: 9,
    question: "Формат запроса и ответа к внешнему агенту кодовой базы",
    description: "Не определена контрактная схема данных для взаимодействия с агентом кодовой базы.",
    impact: "Невозможно запрашивать изменённые файлы, связанные модули, существующие автотесты.",
    category: "architecture",
    file: "schemas/codebase_context.py",
  },
  {
    id: 10,
    question: "Папка, структура и шаблон требований в репозитории",
    description: "Не определено, где и в каком формате хранятся требования в репозитории проекта.",
    impact: "Адаптер repository_input_adapter не может корректно находить и парсить требования.",
    category: "configuration",
    file: "adapters/repository_input_adapter.py",
  },
  {
    id: 11,
    question: "Трекеры, статусы и custom fields Redmine",
    description: "Неизвестны конкретные трекеры задач, статусы и пользовательские поля в Redmine.",
    impact: "Адаптер Redmine может читать задачи, но не может корректно создавать или обновлять.",
    category: "integration",
    file: "adapters/redmine_adapter.py",
  },
  {
    id: 12,
    question: "Способ связывания DoQA и Redmine",
    description: "Неизвестен механизм связи тест-кейсов DoQA с задачами Redmine.",
    impact: "Трассировка requirement → test_case → redmine_issue может быть неполной.",
    category: "integration",
    file: "schemas/doqa_test_case.py",
  },
];

const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  integration: { label: "Интеграция", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: "fa-solid fa-plug" },
  security: { label: "Безопасность", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "fa-solid fa-shield-halved" },
  architecture: { label: "Архитектура", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: "fa-solid fa-sitemap" },
  configuration: { label: "Конфигурация", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: "fa-solid fa-gears" },
};

const prohibitions = [
  "Выдумывать DoQA API, методы, эндпоинты и схемы",
  "Выдумывать учётные данные",
  "Выдумывать тестовые данные",
  "Выдумывать требования",
  "Выдумывать файлы кодовой базы",
  "Выдумывать элементы интерфейса",
  "Выдумывать задачи Redmine",
  "Автоматически отправлять данные в DoQA",
  "Автоматически удалять кейсы",
  "Пропускать подтверждение человека",
  "Игнорировать правила DoQA",
  "Использовать CrewAI как основной оркестратор",
  "Хардкодить модель, ключи, статусы, адреса стендов",
];

const acceptanceCriteria = [
  { id: 1, text: "Замена файла правил меняет поведение без изменения кода" },
  { id: 2, text: "Кейс с названием \"Проверка фильтра\" получает замечание" },
  { id: 3, text: "Кейс со словом \"тестирование\" в названии получает замечание" },
  { id: 4, text: "Кейс с заглушкой \"любое значение\" получает замечание" },
  { id: 5, text: "Кейс с заглушкой \"тбд\" получает замечание" },
  { id: 6, text: "Кейс с ветвлением \"если появится\" получает замечание" },
  { id: 7, text: "Кейс с субъективным результатом \"всё корректно\" получает замечание" },
  { id: 8, text: "Кейс с жёстко прописанным адресом стенда получает замечание" },
  { id: 9, text: "Кейс с адресом стороннего сервиса НЕ получает замечание по правилу стенда" },
  { id: 10, text: "Ограничение автоматизации меняет статус, но не снижает оценку" },
  { id: 11, text: "Расчёт оценки соответствует весам и коэффициентам" },
  { id: 12, text: "Каждый этап останавливается на подтверждении человека" },
  { id: 13, text: "Повторный запуск этапа учитывает комментарии" },
  { id: 14, text: "Дельта корректно определяет added, changed, removed, unchanged, moved, renamed" },
  { id: 15, text: "Переформулировка без изменения смысла не создаёт новые кейсы" },
  { id: 16, text: "Каждый тест-кейс имеет трассировку до delta_id" },
  { id: 17, text: "Импорт в DoQA требует выбора режима и подтверждения" },
  { id: 18, text: "Новые и актуализированные кейсы получают статус \"Ревью\"" },
  { id: 19, text: "Устаревшие кейсы переводятся в статус \"Архив\"" },
  { id: 20, text: "Удаление кейсов не выполняется без подтверждения" },
  { id: 21, text: "Без контракта DoQA API реальные запросы не выполняются" },
  { id: 22, text: "Тесты проходят без сети и реальных секретов" },
];

export default function TBD() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Открытые вопросы
          </span>
        </h1>
        <p className="text-gray-400">
          12 пунктов, которые остаются открытыми и должны быть помечены как TBD.
          Запрещается заполнять выдуманными значениями.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
          <p className="text-2xl font-bold text-violet-400">7</p>
          <p className="text-xs text-gray-400">Интеграции</p>
        </div>
        <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
          <p className="text-2xl font-bold text-cyan-400">2</p>
          <p className="text-xs text-gray-400">Архитектура</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
          <p className="text-2xl font-bold text-red-400">1</p>
          <p className="text-xs text-gray-400">Безопасность</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <p className="text-2xl font-bold text-amber-400">2</p>
          <p className="text-xs text-gray-400">Конфигурация</p>
        </div>
      </div>

      {/* TBD items */}
      <div className="space-y-3">
        {tbdItems.map((item) => {
          const cat = categoryConfig[item.category];
          return (
            <div key={item.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0">
                  {item.id}
                </span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{item.question}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.color} flex items-center gap-1`}>
                      <i className={`${cat.icon} text-[8px]`} />
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{item.description}</p>
                  <div className="bg-amber-500/5 rounded-lg p-2.5 border border-amber-500/10">
                    <p className="text-[11px] text-amber-400/80">
                      <i className="fa-solid fa-triangle-exclamation text-[9px] mr-1" />
                      <span className="font-semibold">Влияние:</span> {item.impact}
                    </p>
                  </div>
                  <code className="text-[10px] text-gray-500 font-mono">
                    <i className="fa-solid fa-file-code mr-1" />
                    {item.file}
                  </code>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prohibitions */}
      <section className="bg-gray-900 rounded-xl border border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-ban text-red-400" />
          Запреты
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {prohibitions.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fa-solid fa-circle-xmark text-red-400/60 text-[10px]" />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Acceptance criteria */}
      <section className="bg-gray-900 rounded-xl border border-emerald-500/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-clipboard-check text-emerald-400" />
          Критерии приёмки (22 пункта)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {acceptanceCriteria.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs text-gray-400 bg-gray-800/30 rounded-lg p-2">
              <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {c.id}
              </span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* API Contract */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-file-contract text-violet-400" />
          Контракт DoQA API
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Файл: <code className="text-violet-400 bg-gray-800 px-1.5 py-0.5 rounded">integrations/doqa/api_contract.yaml</code>
        </p>
        <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 font-mono text-xs text-gray-400 overflow-x-auto">
          <pre>{`doqa_api:
  version: "4.3.1"
  base_url: "TBD"
  auth:
    type: "TBD"
    header_name: "TBD"
    token_env: "DOQA_API_TOKEN"

  endpoints:
    get_test_case:
      method: "TBD"
      path: "TBD"
    export_test_cases:
      method: "TBD"
      path: "TBD"
      response_format: "TBD"
    create_test_case:
      method: "TBD"
      path: "TBD"
      request_schema: "TBD"
    update_test_case:
      method: "TBD"
      path: "TBD"
      request_schema: "TBD"
    bulk_import_test_cases:
      method: "TBD"
      path: "TBD"
      file_format: "TBD"
    set_status:
      method: "TBD"
      path: "TBD"
    archive_test_case:
      method: "TBD"
      path: "TBD"
    update_structure:
      method: "TBD"
      path: "TBD"

  statuses:
    review:
      name: "Ревью"
      id: "TBD"
    archive:
      name: "Архив"
      id: "TBD"`}</pre>
        </div>
      </section>
    </div>
  );
}
