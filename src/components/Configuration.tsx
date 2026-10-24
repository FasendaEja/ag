import { useState } from "react";

const envVars = [
  { group: "LLM", vars: [
    { key: "OPENAI_API_KEY", desc: "API-ключ LLM-провайдера", secret: true },
    { key: "OPENAI_BASE_URL", desc: "Base URL OpenAI-compatible API", secret: false },
    { key: "LLM_MODEL", desc: "Модель", default: "qwen3.8" },
    { key: "LLM_TEMPERATURE", desc: "Температура по умолчанию", default: "0.2" },
    { key: "LLM_MAX_TOKENS", desc: "Максимум токенов", default: "8000" },
    { key: "LLM_TIMEOUT", desc: "Таймаут (сек)", default: "120" },
    { key: "LLM_MAX_RETRIES", desc: "Макс. повторов", default: "3" },
  ]},
  { group: "Rules", vars: [
    { key: "RULES_FILE_PATH", desc: "Путь к файлу правил", default: "rules/doqa_rules.md" },
  ]},
  { group: "Requirements source", vars: [
    { key: "REQUIREMENTS_SOURCE_TYPE", desc: "Тип источника", default: "folder" },
    { key: "REQUIREMENTS_FOLDER_PATH", desc: "Путь к папке", default: "./requirements" },
    { key: "REQUIREMENTS_SCAN_RECURSIVE", desc: "Рекурсивный скан", default: "true" },
    { key: "REQUIREMENTS_FILE_MASKS", desc: "Маски файлов", default: "*.md,*.txt,*.doc,*.docx,*.xls,*.xlsx" },
  ]},
  { group: "Redmine", vars: [
    { key: "REDMINE_BASE_URL", desc: "URL Redmine", secret: false },
    { key: "REDMINE_API_KEY", desc: "API-ключ Redmine", secret: true },
    { key: "REDMINE_PROJECT_ID", desc: "ID проекта", secret: false },
  ]},
  { group: "DoQA", vars: [
    { key: "DOQA_BASE_URL", desc: "URL DoQA", secret: false },
    { key: "DOQA_API_VERSION", desc: "Версия API", default: "4.3.1" },
    { key: "DOQA_API_TOKEN", desc: "API-токен DoQA", secret: true },
    { key: "DOQA_TIMEOUT", desc: "Таймаут (сек)", default: "60" },
    { key: "DOQA_MAX_RETRIES", desc: "Макс. повторов", default: "3" },
    { key: "DOQA_IMPORT_MODE", desc: "Режим импорта", default: "file" },
    { key: "DOQA_REVIEW_STATUS_NAME", desc: "Статус ревью", default: "Ревью" },
    { key: "DOQA_ARCHIVE_STATUS_NAME", desc: "Статус архив", default: "Архив" },
    { key: "DOQA_REVIEW_STATUS_ID", desc: "ID статуса Ревью", default: "TBD" },
    { key: "DOQA_ARCHIVE_STATUS_ID", desc: "ID статуса Архив", default: "TBD" },
  ]},
  { group: "Codebase", vars: [
    { key: "CODEBASE_ACCESS_MODE", desc: "Режим доступа", default: "external_agent" },
    { key: "CODEBASE_AGENT_URL", desc: "URL агента", secret: false },
    { key: "CODEBASE_AGENT_TIMEOUT", desc: "Таймаут (сек)", default: "120" },
  ]},
  { group: "Human review", vars: [
    { key: "HUMAN_REVIEW_MODE", desc: "Режим ревью", default: "web_ui" },
    { key: "HUMAN_REVIEW_CLI_ENABLED", desc: "CLI включён", default: "true" },
    { key: "MAX_STAGE_ITERATIONS", desc: "Макс. итераций этапа", default: "5" },
  ]},
];

const scoringConfig = `# doqa_scoring.yaml
# Параметры оценки тест-кейсов по правилам DoQA

weights:
  title: 0.10
  description: 0.15
  preconditions: 0.10
  configurations: 0.05
  test_data: 0.10
  steps: 0.25
  expected_results: 0.20
  coherence: 0.05

severity_coefficients:
  error: 0.0
  no_issues: 1.0
  recommendation: 0.9
  warning: 0.6

thresholds:
  ready_for_review: 90
  rating_5: 90
  rating_4: 75
  rating_3: 60
  rating_2: 40
  rating_1: 0

max_iterations: 3
max_step_length: 2000
max_expected_result_length: 2000`;

const statusMapping = `# doqa_status_mapping.yaml
# Маппинг внутренних статусов на статусы DoQA
# ID статусов берутся из конфигурации DoQA

statuses:
  review:
    internal_name: "review"
    doqa_name: "Ревью"
    doqa_id: null  # TBD: получить из DoQA API
    description: "Кейс готов к ревью"

  archive:
    internal_name: "archive"
    doqa_name: "Архив"
    doqa_id: null  # TBD: получить из DoQA API
    description: "Кейс устарел и архивирован"

  draft:
    internal_name: "draft"
    doqa_name: null
    doqa_id: null
    description: "Кейс в процессе генерации"

  needs_changes:
    internal_name: "needs_changes"
    doqa_name: null
    doqa_id: null
    description: "Кейс требует доработки после ревью"`;

export default function Configuration() {
  const [activeTab, setActiveTab] = useState<"env" | "scoring" | "status">("env");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Конфигурация
          </span>
        </h1>
        <p className="text-gray-400">
          Все параметры задаются через конфигурацию. Запрещено хардкодить модель, ключи, статусы и адреса.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {[
          { id: "env" as const, label: ".env.example", icon: "fa-solid fa-key" },
          { id: "scoring" as const, label: "doqa_scoring.yaml", icon: "fa-solid fa-chart-simple" },
          { id: "status" as const, label: "doqa_status_mapping.yaml", icon: "fa-solid fa-tags" },
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

      {activeTab === "env" && (
        <div className="space-y-4">
          {envVars.map((group) => (
            <div key={group.group} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-white">{group.group}</h3>
              </div>
              <div className="divide-y divide-gray-800/50">
                {group.vars.map((v) => (
                  <div key={v.key} className="px-4 py-2.5 flex items-center gap-4">
                    <code className="text-xs font-mono text-emerald-400 min-w-[240px]">{v.key}</code>
                    <span className="text-xs text-gray-400 flex-1">{v.desc}</span>
                    {v.secret ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        <i className="fa-solid fa-lock text-[8px] mr-1" />secret
                      </span>
                    ) : v.default ? (
                      <code className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">
                        = {v.default}
                      </code>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "scoring" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-simple text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Параметры оценки тест-кейсов</h3>
          </div>
          <pre className="bg-gray-950 rounded-lg p-4 border border-gray-800 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
            {scoringConfig}
          </pre>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-xs font-semibold text-white mb-2">Веса областей оценки</h4>
              <div className="space-y-1.5">
                {[
                  { name: "Название", weight: 10 },
                  { name: "Описание", weight: 15 },
                  { name: "Предусловия", weight: 10 },
                  { name: "Конфигурации", weight: 5 },
                  { name: "Тестовые данные", weight: 10 },
                  { name: "Инструкции шагов", weight: 25 },
                  { name: "Ожидаемые результаты", weight: 20 },
                  { name: "Общая связность", weight: 5 },
                ].map((w) => (
                  <div key={w.name} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 w-36">{w.name}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        style={{ width: `${w.weight * 4}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 w-8 text-right">{w.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-xs font-semibold text-white mb-2">Коэффициенты серьёзности</h4>
              <div className="space-y-2">
                {[
                  { name: "Ошибка", coeff: 0, color: "bg-red-500" },
                  { name: "Без замечаний", coeff: 1.0, color: "bg-emerald-500" },
                  { name: "Рекомендация", coeff: 0.9, color: "bg-cyan-500" },
                  { name: "Предупреждение", coeff: 0.6, color: "bg-amber-500" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${c.color}`} />
                    <span className="text-xs text-gray-400 flex-1">{c.name}</span>
                    <code className="text-xs font-mono text-white">{c.coeff}</code>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <h4 className="text-xs font-semibold text-white mb-2">Пороги рейтинга</h4>
                <div className="flex gap-2">
                  {[
                    { min: 90, rating: 5 },
                    { min: 75, rating: 4 },
                    { min: 60, rating: 3 },
                    { min: 40, rating: 2 },
                    { min: 0, rating: 1 },
                  ].map((t) => (
                    <div key={t.rating} className="flex-1 text-center bg-gray-800 rounded p-1.5">
                      <div className="text-xs font-bold text-white">★{t.rating}</div>
                      <div className="text-[10px] text-gray-500">≥{t.min}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "status" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-tags text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Маппинг статусов</h3>
          </div>
          <pre className="bg-gray-950 rounded-lg p-4 border border-gray-800 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
            {statusMapping}
          </pre>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "review", doqa: "Ревью", color: "emerald", icon: "fa-solid fa-eye" },
              { name: "archive", doqa: "Архив", color: "gray", icon: "fa-solid fa-box-archive" },
              { name: "draft", doqa: "—", color: "cyan", icon: "fa-solid fa-pen" },
              { name: "needs_changes", doqa: "—", color: "amber", icon: "fa-solid fa-pen-to-square" },
            ].map((s) => {
              const colorMap: Record<string, string> = {
                emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
                gray: "border-gray-500/20 bg-gray-500/5 text-gray-400",
                cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
                amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
              };
              return (
                <div key={s.name} className={`rounded-lg p-3 border ${colorMap[s.color]}`}>
                  <i className={`${s.icon} text-sm mb-1`} />
                  <p className="text-xs font-mono font-bold">{s.name}</p>
                  <p className="text-[10px] text-gray-500">DoQA: {s.doqa}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
