import { useState } from "react";

interface Stage {
  id: number;
  title: string;
  description: string;
  agent: string;
  temperature: string;
  inputs: string[];
  outputs: string[];
  humanActions: string[];
  schemas: string[];
}

const stages: Stage[] = [
  {
    id: 1,
    title: "Получение требований",
    description: "Получение новой и старой версии требований из различных источников: текст, файл, папка, репозиторий, Redmine.",
    agent: "requirement_intake_agent",
    temperature: "—",
    inputs: ["Текст / файл / папка / репозиторий / задача Redmine"],
    outputs: ["RequirementVersion (новая)", "RequirementVersion (старая)"],
    humanActions: ["Подтвердить источник", "Загрузить базовую версию"],
    schemas: ["RequirementVersion"],
  },
  {
    id: 2,
    title: "Сравнение и дельта",
    description: "Смысловое сравнение старой и новой версии. Определение типов изменений: added, changed, removed, unchanged, moved, renamed.",
    agent: "requirement_diff_agent",
    temperature: "0.2",
    inputs: ["RequirementVersion (новая)", "RequirementVersion (старая)"],
    outputs: ["RequirementDelta"],
    humanActions: ["Подтвердить дельту", "Исправить тип", "Объединить/разделить"],
    schemas: ["RequirementDelta"],
  },
  {
    id: 3,
    title: "Подтверждение дельты",
    description: "Человек просматривает дельту, может исправить, объединить, разделить изменения, пометить как критичное или незначимое.",
    agent: "—",
    temperature: "—",
    inputs: ["RequirementDelta"],
    outputs: ["Подтверждённая RequirementDelta"],
    humanActions: ["approve", "reject", "rerun_with_comments", "edit"],
    schemas: ["HumanReview"],
  },
  {
    id: 4,
    title: "Анализ требований",
    description: "Проверка полноты, однозначности, тестируемости, критериев приёмки, позитивных/негативных сценариев, граничных условий.",
    agent: "requirement_analysis_agent",
    temperature: "0.2",
    inputs: ["RequirementDelta", "Подтверждённая дельта"],
    outputs: ["AnalysisReport"],
    humanActions: ["Подтвердить отчёт", "Добавить вопросы"],
    schemas: ["AnalysisReport", "Rationale"],
  },
  {
    id: 5,
    title: "Mind-map доработки",
    description: "Формирование mind-map: добавленные, изменённые, удалённые области, связи, затронутые модули, риски.",
    agent: "mindmap_agent",
    temperature: "0.3",
    inputs: ["RequirementDelta", "AnalysisReport"],
    outputs: ["MindMap (Markdown, Mermaid, JSON)"],
    humanActions: ["Подтвердить mind-map", "Скорректировать структуру"],
    schemas: ["MindMap"],
  },
  {
    id: 6,
    title: "Чек-лист проверок",
    description: "Позитивные, негативные, граничные, регрессионные проверки, проверки прав, интеграций, данных.",
    agent: "checklist_agent",
    temperature: "0.2",
    inputs: ["MindMap", "RequirementDelta", "AnalysisReport"],
    outputs: ["Checklist"],
    humanActions: ["Подтвердить чек-лист", "Добавить проверки"],
    schemas: ["Checklist"],
  },
  {
    id: 7,
    title: "Сбор контекста",
    description: "Из DoQA: существующие кейсы, связи, дубликаты. Из кодовой базы: изменённые файлы, модули, автотесты, API.",
    agent: "doqa_context_agent + codebase_context_agent",
    temperature: "—",
    inputs: ["DoQA API", "Codebase adapter"],
    outputs: ["Контекст DoQA", "CodebaseContext"],
    humanActions: ["Подтвердить контекст", "Дополнить данные"],
    schemas: ["CodebaseContext", "DoQATestCase"],
  },
  {
    id: 8,
    title: "Влияние изменений",
    description: "Сопоставление дельты с кейсами и кодом. Определение: создать, актуализировать, архивировать, оставить.",
    agent: "impact_analysis_agent",
    temperature: "0.15",
    inputs: ["RequirementDelta", "Контекст DoQA", "CodebaseContext"],
    outputs: ["DeltaImpact"],
    humanActions: ["Подтвердить влияние", "Скорректировать действия"],
    schemas: ["DeltaImpact"],
  },
  {
    id: 9,
    title: "Списки кейсов",
    description: "Формирование списков: новые, актуализируемые, устаревшие, дубликаты, без изменений.",
    agent: "—",
    temperature: "—",
    inputs: ["DeltaImpact", "Checklist", "Контекст"],
    outputs: ["Списки кейсов по действию"],
    humanActions: ["Подтвердить списки", "Изменить приоритеты"],
    schemas: ["DoQATestCase"],
  },
  {
    id: 10,
    title: "Генерация + ревью",
    description: "Генерация тест-кейсов по правилам DoQA. Цикл: генерация → ревью → если ≥90 и нет блокирующих → принят. Макс. 3 итерации.",
    agent: "test_case_authoring_agent + doqa_review_agent",
    temperature: "0.1 / 0.0",
    inputs: ["Требования", "MindMap", "Checklist", "Контекст", "rules/doqa_rules.md"],
    outputs: ["DoQATestCase (готовые)", "DoQAReview"],
    humanActions: ["Подтвердить кейсы", "Отправить на доработку"],
    schemas: ["DoQATestCase", "DoQAReview"],
  },
  {
    id: 11,
    title: "Корректировка структуры",
    description: "Предложения по изменению структуры DoQA: создать папку, переместить кейс, обновить теги и связи.",
    agent: "doqa_structure_agent",
    temperature: "0.2",
    inputs: ["MindMap (обновлённый)", "Структура DoQA"],
    outputs: ["StructureChangeProposal"],
    humanActions: ["Подтвердить изменения", "Отклонить"],
    schemas: ["StructureChangeProposal"],
  },
  {
    id: 12,
    title: "Экспорт / импорт в DoQA",
    description: "Два режима: генерация файла для импорта или прямая отправка через API. Новые → Ревью, устаревшие → Архив.",
    agent: "doqa_import_service",
    temperature: "—",
    inputs: ["DoQATestCase", "StructureChangeProposal", "DoQA API контракт"],
    outputs: ["DoQAImportResult"],
    humanActions: ["Выбрать режим", "Подтвердить импорт"],
    schemas: ["DoQAImportResult"],
  },
];

export default function Pipeline() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Пайплайн обработки
          </span>
        </h1>
        <p className="text-gray-400">
          12 этапов с human-in-the-loop на каждом. После каждого этапа — остановка и ожидание подтверждения.
        </p>
      </div>

      {/* Stage flow visualization */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max pb-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => setSelectedStage(stage)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedStage?.id === stage.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 scale-105"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white">
                  {stage.id}
                </span>
                <span className="hidden lg:inline">{stage.title}</span>
              </button>
              {i < stages.length - 1 && (
                <div className="flex items-center mx-1">
                  <i className="fa-solid fa-chevron-right text-[8px] text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage)}
            className={`text-left bg-gray-900 rounded-xl border p-4 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 ${
              selectedStage?.id === stage.id
                ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                : "border-gray-800"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                {stage.id}
              </span>
              <h3 className="text-sm font-semibold text-white">{stage.title}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{stage.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                {stage.agent !== "—" ? stage.agent.split(" + ")[0] : "human"}
              </span>
              {stage.temperature !== "—" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  t={stage.temperature}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Stage detail panel */}
      {selectedStage && (
        <div className="bg-gray-900 rounded-xl border border-emerald-500/20 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-lg font-bold text-emerald-400">
                {selectedStage.id}
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">{selectedStage.title}</h2>
                <p className="text-xs text-gray-500">Этап {selectedStage.id} из 12</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">{selectedStage.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DetailBlock
              title="Агент"
              icon="fa-solid fa-robot"
              items={[selectedStage.agent]}
              color="emerald"
            />
            <DetailBlock
              title="Входные данные"
              icon="fa-solid fa-right-to-bracket"
              items={selectedStage.inputs}
              color="cyan"
            />
            <DetailBlock
              title="Результат"
              icon="fa-solid fa-right-from-bracket"
              items={selectedStage.outputs}
              color="violet"
            />
            <DetailBlock
              title="Действия человека"
              icon="fa-solid fa-user-check"
              items={selectedStage.humanActions}
              color="amber"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Схемы:</span>
            {selectedStage.schemas.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-cyan-400 border border-gray-700 font-mono">
                {s}
              </span>
            ))}
            {selectedStage.temperature !== "—" && (
              <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
                temperature: {selectedStage.temperature}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stage statuses */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-circle-dot text-emerald-400" />
          Статусы этапов
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { status: "pending", color: "bg-gray-700 text-gray-300" },
            { status: "running", color: "bg-blue-500/20 text-blue-400" },
            { status: "waiting_for_human", color: "bg-amber-500/20 text-amber-400" },
            { status: "approved", color: "bg-emerald-500/20 text-emerald-400" },
            { status: "rejected", color: "bg-red-500/20 text-red-400" },
            { status: "needs_rerun", color: "bg-orange-500/20 text-orange-400" },
            { status: "failed", color: "bg-red-500/20 text-red-400" },
            { status: "skipped", color: "bg-gray-600 text-gray-400" },
          ].map((s) => (
            <span key={s.status} className={`text-xs px-3 py-1 rounded-full font-mono ${s.color}`}>
              {s.status}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailBlock({ title, icon, items, color }: { title: string; icon: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/20",
    cyan: "text-cyan-400 border-cyan-500/20",
    violet: "text-violet-400 border-violet-500/20",
    amber: "text-amber-400 border-amber-500/20",
  };
  return (
    <div className={`bg-gray-800/50 rounded-lg p-3 border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} text-xs ${colorMap[color].split(" ")[0]}`} />
        <span className="text-xs font-semibold text-gray-300">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-400 font-mono truncate">{item}</li>
        ))}
      </ul>
    </div>
  );
}
