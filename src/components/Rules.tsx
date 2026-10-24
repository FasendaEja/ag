import { useState } from "react";

interface Rule {
  id: string;
  section: string;
  title: string;
  required: boolean;
  checks: { text: string; type: "forbidden" | "required" | "allowed" }[];
  examples?: { bad?: string; good?: string };
}

const rules: Rule[] = [
  {
    id: "14.1",
    section: "Название",
    title: "Правила формирования названия тест-кейса",
    required: true,
    checks: [
      { text: "Обязательный смысловой блок: что делаем", type: "required" },
      { text: "Блоки \"где\" и \"при каком условии\" опциональны", type: "allowed" },
      { text: "Стоп-слова: \"проверка\", \"тестирование\"", type: "forbidden" },
      { text: "Формат с \"_\" допустим, если принят в проекте", type: "allowed" },
      { text: "Дубликат — одинаковая операция в одинаковом условии", type: "forbidden" },
    ],
    examples: {
      bad: "Проверка фильтра по дате",
      good: "Применить фильтр по дате создания в списке заказов",
    },
  },
  {
    id: "14.2",
    section: "Описание",
    title: "Правила описания тест-кейса",
    required: true,
    checks: [
      { text: "Поле description обязательно", type: "required" },
      { text: "Business rule или сценарий полезны, но не обязательны", type: "allowed" },
      { text: "Ссылка на требование/задачу опциональна", type: "allowed" },
      { text: "Тип теста обязателен", type: "required" },
      { text: "Выдумывать ссылку, задачу или тип теста", type: "forbidden" },
    ],
  },
  {
    id: "14.3",
    section: "Предусловия",
    title: "Правила предусловий",
    required: true,
    checks: [
      { text: "Предусловие описывает готовое состояние", type: "required" },
      { text: "Команда подготовки браузера допустима", type: "allowed" },
      { text: "Команда подготовки не делает кейс ручным автоматически", type: "allowed" },
    ],
  },
  {
    id: "14.4",
    section: "Тестовые данные",
    title: "Правила тестовых данных",
    required: true,
    checks: [
      { text: "Каждое значение должно быть конкретным", type: "required" },
      { text: "Литералы допустимы", type: "allowed" },
      { text: "Понятные правила генерации допустимы", type: "allowed" },
      { text: "Заглушки: \"любое значение\", \"тбд\", \"уточнить\"", type: "forbidden" },
      { text: "Месяцы, годы, рабочие дни не поддерживаются", type: "forbidden" },
    ],
    examples: {
      bad: "Любое подходящее значение",
      good: "Дата создания = сегодня; Имя пользователя = \"test_user_01\"",
    },
  },
  {
    id: "14.5",
    section: "Конфигурации",
    title: "Правила конфигураций прогона",
    required: true,
    checks: [
      { text: "Реальные учётные данные запрещены", type: "forbidden" },
      { text: "Адрес стенда не должен быть в шагах", type: "forbidden" },
      { text: "Адрес стенда — через конфигурацию прогона", type: "required" },
      { text: "\"базовый URL\" и \"base URL\" допустимы", type: "allowed" },
      { text: "Абсолютные адреса сторонних сервисов ≠ адрес стенда", type: "allowed" },
    ],
  },
  {
    id: "14.6",
    section: "Шаги",
    title: "Правила шагов",
    required: true,
    checks: [
      { text: "Каждый шаг — конкретное действие", type: "required" },
      { text: "Одна грамматическая форма: инфинитив или повелительное", type: "required" },
      { text: "В ячейке действия — действия, не проверки", type: "required" },
      { text: "Элементы описываются видимыми признаками", type: "required" },
      { text: "Ветвления запрещены", type: "forbidden" },
      { text: "Маркеры: \"если появится\", \"при наличии\"", type: "forbidden" },
      { text: "Максимальная длина: 2000 символов", type: "required" },
    ],
    examples: {
      bad: "Если появится модальное окно, нажать ОК",
      good: "Нажать кнопку \"Подтвердить\" в модальном окне",
    },
  },
  {
    id: "14.7",
    section: "Ожидаемые результаты",
    title: "Правила ожидаемых результатов",
    required: true,
    checks: [
      { text: "Что произошло + наблюдаемый признак", type: "required" },
      { text: "В ожидаемом результате — проверки, не команды", type: "required" },
      { text: "Субъективные формулировки запрещены", type: "forbidden" },
      { text: "\"всё корректно\", \"успешно\" — запрещены", type: "forbidden" },
      { text: "Для свободного текста — вхождение по умолчанию", type: "allowed" },
      { text: "Максимальная длина: 2000 символов", type: "required" },
    ],
    examples: {
      bad: "Данные отображаются корректно",
      good: "В столбце \"Статус\" отображается текст \"Активен\"",
    },
  },
  {
    id: "14.8",
    section: "Автоматизация",
    title: "Правила автоматизации",
    required: true,
    checks: [
      { text: "Ограничения автоматизации не снижают качество текста", type: "allowed" },
      { text: "Все действия автоматизируются → \"Подлежит автоматизации\"", type: "required" },
      { text: "Хотя бы одно действие не поддерживается → \"Ручной\"", type: "required" },
    ],
  },
];

const forbiddenPhrases = [
  { phrase: "проверка", context: "в названии", severity: "error" },
  { phrase: "тестирование", context: "в названии", severity: "error" },
  { phrase: "любое значение", context: "в тестовых данных", severity: "error" },
  { phrase: "любое подходящее значение", context: "в тестовых данных", severity: "error" },
  { phrase: "произвольное значение", context: "в тестовых данных", severity: "error" },
  { phrase: "тбд", context: "в тестовых данных", severity: "error" },
  { phrase: "уточнить", context: "в тестовых данных", severity: "error" },
  { phrase: "todo", context: "в тестовых данных", severity: "error" },
  { phrase: "если появится", context: "маркер ветвления", severity: "error" },
  { phrase: "если отображается", context: "маркер ветвления", severity: "error" },
  { phrase: "при наличии", context: "маркер ветвления", severity: "error" },
  { phrase: "всё корректно", context: "в ожидаемом результате", severity: "error" },
  { phrase: "операция выполнена успешно", context: "в ожидаемом результате", severity: "error" },
  { phrase: "данные отображаются корректно", context: "в ожидаемом результате", severity: "error" },
  { phrase: "правильный результат", context: "в ожидаемом результате", severity: "error" },
];

export default function Rules() {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "forbidden" | "scoring">("rules");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Правила DoQA
          </span>
        </h1>
        <p className="text-gray-400">
          DoQA test case review rules v1.10.0 — внешний редактируемый источник правил.
          Файл: <code className="text-emerald-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">rules/doqa_rules.md</code>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {[
          { id: "rules" as const, label: "Правила генерации", icon: "fa-solid fa-list-check" },
          { id: "forbidden" as const, label: "Запрещённые фразы", icon: "fa-solid fa-ban" },
          { id: "scoring" as const, label: "Алгоритм оценки", icon: "fa-solid fa-calculator" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-gray-800 text-emerald-400 border-b-2 border-emerald-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <i className={`${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rules" && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors"
              >
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  §{rule.id}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{rule.title}</h3>
                  <p className="text-xs text-gray-500">{rule.section}</p>
                </div>
                <i className={`fa-solid fa-chevron-${expandedRule === rule.id ? "up" : "down"} text-gray-600 text-xs`} />
              </button>
              {expandedRule === rule.id && (
                <div className="px-5 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  <div className="space-y-1.5">
                    {rule.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          check.type === "forbidden" ? "bg-red-500/20 text-red-400" :
                          check.type === "required" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-cyan-500/20 text-cyan-400"
                        }`}>
                          <i className={`fa-solid ${
                            check.type === "forbidden" ? "fa-xmark" :
                            check.type === "required" ? "fa-check" :
                            "fa-info"
                          } text-[8px]`} />
                        </span>
                        <span className="text-gray-300">{check.text}</span>
                      </div>
                    ))}
                  </div>
                  {rule.examples && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {rule.examples.bad && (
                        <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                          <p className="text-[10px] text-red-400 font-semibold mb-1">
                            <i className="fa-solid fa-xmark mr-1" />Неправильно
                          </p>
                          <code className="text-xs text-red-300">{rule.examples.bad}</code>
                        </div>
                      )}
                      {rule.examples.good && (
                        <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                          <p className="text-[10px] text-emerald-400 font-semibold mb-1">
                            <i className="fa-solid fa-check mr-1" />Правильно
                          </p>
                          <code className="text-xs text-emerald-300">{rule.examples.good}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "forbidden" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {forbiddenPhrases.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                <i className="fa-solid fa-circle-xmark text-red-400" />
                <div>
                  <code className="text-xs text-red-300 font-mono">"{item.phrase}"</code>
                  <p className="text-[10px] text-gray-500">{item.context}</p>
                </div>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "scoring" && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-arrows-rotate text-cyan-400" />
              Цикл генерации и ревью
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { step: "Генерация кейса", color: "emerald" },
                { step: "Внутреннее ревью", color: "cyan" },
                { step: "Оценка ≥ 90?", color: "amber" },
                { step: "Принят", color: "emerald" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1.5 rounded-lg border ${
                    s.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    s.color === "cyan" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>{s.step}</span>
                  {i < 3 && <i className="fa-solid fa-arrow-right text-gray-600 text-xs" />}
                </div>
              ))}
            </div>
            <div className="mt-4 bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
              <p className="text-xs text-amber-400">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                Если оценка &lt; 90 или есть блокирующие ошибки → замечания возвращаются агенту-автору.
                Максимум 3 итерации. После 3 итераций — статус <code className="font-mono">needs-changes</code>.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-calculator text-violet-400" />
              Алгоритм расчёта оценки
            </h3>
            <ol className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                Для каждой применимой области взять худшую серьёзность замечания
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                Посчитать итоговую оценку от 0 до 100 с учётом весов и коэффициентов
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                Ограничения автоматизации не участвуют в оценке качества текста
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>
                Если ≥ 90 и нет блокирующих → <code className="text-emerald-400">ready-for-review</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">5</span>
                Иначе → <code className="text-amber-400">needs-changes</code>
              </li>
            </ol>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-comment-dots text-amber-400" />
              Структура замечания
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { field: "severity", desc: "error / warning / recommendation" },
                { field: "category", desc: "дефект / ограничение / среда / автоматизация" },
                { field: "fixable", desc: "возможность исправления" },
                { field: "description", desc: "описание проблемы" },
                { field: "suggestion", desc: "рекомендуемое исправление" },
              ].map((f) => (
                <div key={f.field} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <code className="text-xs text-cyan-400 font-mono">{f.field}</code>
                  <p className="text-[11px] text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
