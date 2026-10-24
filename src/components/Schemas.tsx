import { useState } from "react";

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface Schema {
  name: string;
  description: string;
  file: string;
  fields: SchemaField[];
}

const schemas: Schema[] = [
  {
    name: "RequirementVersion",
    description: "Снимок версии требований из определённого источника",
    file: "schemas/requirement_version.py",
    fields: [
      { name: "version_id", type: "str", required: true, description: "Уникальный идентификатор версии" },
      { name: "source_type", type: "Literal['text','file','folder','repo','redmine']", required: true, description: "Тип источника" },
      { name: "source_ref", type: "str", required: true, description: "Ссылка на источник" },
      { name: "content", type: "str", required: true, description: "Текстовое содержимое требований" },
      { name: "sections", type: "list[RequirementSection]", required: true, description: "Структурированные разделы" },
      { name: "metadata", type: "dict[str, Any]", required: false, description: "Метаданные источника" },
      { name: "received_at", type: "datetime", required: true, description: "Время получения" },
    ],
  },
  {
    name: "RequirementDelta",
    description: "Результат сравнения двух версий требований",
    file: "schemas/requirement_delta.py",
    fields: [
      { name: "delta_id", type: "str", required: true, description: "ID элемента дельты" },
      { name: "change_type", type: "Literal['added','changed','removed','unchanged','moved','renamed']", required: true, description: "Тип изменения" },
      { name: "title", type: "str", required: true, description: "Заголовок требования" },
      { name: "old_text", type: "str | None", required: false, description: "Старый текст" },
      { name: "new_text", type: "str | None", required: false, description: "Новый текст" },
      { name: "semantic_change", type: "bool", required: true, description: "Смысловое изменение" },
      { name: "format_only", type: "bool", required: true, description: "Только форматирование" },
      { name: "affected_areas", type: "list[str]", required: true, description: "Затронутые области" },
      { name: "explanation", type: "str", required: true, description: "Объяснение изменения" },
      { name: "recommended_action", type: "str", required: true, description: "Рекомендуемое действие" },
      { name: "human_decision", type: "HumanDecision | None", required: false, description: "Решение человека" },
    ],
  },
  {
    name: "DeltaImpact",
    description: "Влияние изменений на существующие тест-кейсы",
    file: "schemas/delta_impact.py",
    fields: [
      { name: "impact_id", type: "str", required: true, description: "ID записи влияния" },
      { name: "delta_id", type: "str", required: true, description: "Связанный элемент дельты" },
      { name: "action", type: "Literal['create','update','archive','skip','manual_review']", required: true, description: "Действие над кейсами" },
      { name: "affected_case_ids", type: "list[str]", required: true, description: "Затронутые кейсы DoQA" },
      { name: "reason", type: "str", required: true, description: "Причина действия" },
      { name: "priority", type: "Literal['critical','high','medium','low']", required: true, description: "Приоритет" },
      { name: "confidence", type: "float", required: true, description: "Уверенность (0-1)" },
    ],
  },
  {
    name: "StageState",
    description: "Состояние этапа пайплайна",
    file: "schemas/stage_state.py",
    fields: [
      { name: "stage_id", type: "int", required: true, description: "Номер этапа (1-12)" },
      { name: "stage_name", type: "str", required: true, description: "Название этапа" },
      { name: "status", type: "Literal['pending','running','waiting_for_human','approved','rejected','needs_rerun','failed','skipped']", required: true, description: "Текущий статус" },
      { name: "iteration", type: "int", required: true, description: "Номер итерации" },
      { name: "result", type: "Any", required: false, description: "Результат этапа" },
      { name: "rationale", type: "Rationale", required: false, description: "Объяснение результата" },
      { name: "human_comments", type: "list[str]", required: true, description: "Комментарии человека" },
      { name: "started_at", type: "datetime | None", required: false, description: "Время начала" },
      { name: "completed_at", type: "datetime | None", required: false, description: "Время завершения" },
    ],
  },
  {
    name: "Rationale",
    description: "Объяснение результата этапа",
    file: "schemas/rationale.py",
    fields: [
      { name: "summary", type: "str", required: true, description: "Краткое резюме" },
      { name: "used_sources", type: "list[str]", required: true, description: "Использованные источники" },
      { name: "used_fragments", type: "list[str]", required: true, description: "Использованные фрагменты" },
      { name: "applied_rules", type: "list[str]", required: true, description: "Применённые правила" },
      { name: "assumptions", type: "list[str]", required: true, description: "Допущения" },
      { name: "missing_information", type: "list[str]", required: true, description: "Недостающие данные" },
      { name: "alternatives", type: "list[str]", required: true, description: "Рассмотренные альтернативы" },
      { name: "risks", type: "list[str]", required: true, description: "Риски" },
      { name: "confidence", type: "Literal['high','medium','low']", required: true, description: "Уровень уверенности" },
      { name: "changes_from_previous", type: "list[str]", required: true, description: "Изменения от прошлой итерации" },
    ],
  },
  {
    name: "AnalysisReport",
    description: "Отчёт об анализе требований",
    file: "schemas/analysis_report.py",
    fields: [
      { name: "report_id", type: "str", required: true, description: "ID отчёта" },
      { name: "summary", type: "str", required: true, description: "Краткое резюме" },
      { name: "issues", type: "list[AnalysisIssue]", required: true, description: "Список проблем" },
      { name: "questions", type: "list[str]", required: true, description: "Вопросы для уточнения" },
      { name: "risks", type: "list[str]", required: true, description: "Риски" },
      { name: "missing_scenarios", type: "list[str]", required: true, description: "Отсутствующие сценарии" },
      { name: "testability_score", type: "float", required: true, description: "Оценка тестируемости (0-1)" },
      { name: "delta_refs", type: "list[str]", required: true, description: "Привязка к delta_id" },
    ],
  },
  {
    name: "MindMap",
    description: "Mind-map доработки",
    file: "schemas/mindmap.py",
    fields: [
      { name: "root", type: "MindMapNode", required: true, description: "Корневой узел" },
      { name: "format_markdown", type: "str", required: true, description: "Markdown-представление" },
      { name: "format_mermaid", type: "str | None", required: false, description: "Mermaid-представление" },
      { name: "format_json", type: "dict", required: true, description: "JSON-представление" },
      { name: "version", type: "int", required: true, description: "Версия mind-map" },
    ],
  },
  {
    name: "Checklist",
    description: "Чек-лист проверок",
    file: "schemas/checklist.py",
    fields: [
      { name: "checklist_id", type: "str", required: true, description: "ID чек-листа" },
      { name: "items", type: "list[ChecklistItem]", required: true, description: "Пункты чек-листа" },
      { name: "total_count", type: "int", required: true, description: "Общее количество" },
    ],
  },
  {
    name: "DoQATestCase",
    description: "Тест-кейс по правилам DoQA",
    file: "schemas/doqa_test_case.py",
    fields: [
      { name: "case_id", type: "str | None", required: false, description: "ID в DoQA (null для новых)" },
      { name: "title", type: "str", required: true, description: "Название тест-кейса" },
      { name: "description", type: "str", required: true, description: "Описание" },
      { name: "test_type", type: "str", required: true, description: "Тип теста" },
      { name: "requirement_reference", type: "str | None", required: false, description: "Ссылка на требование" },
      { name: "related_delta_ids", type: "list[str]", required: true, description: "Связанные delta_id" },
      { name: "preconditions", type: "str", required: true, description: "Предусловия" },
      { name: "test_data", type: "str", required: true, description: "Тестовые данные" },
      { name: "configurations", type: "list[dict]", required: true, description: "Конфигурации прогона" },
      { name: "steps", type: "list[TestStep]", required: true, description: "Шаги тест-кейса" },
      { name: "automation_status", type: "Literal['automatable','manual']", required: true, description: "Статус автоматизации" },
      { name: "priority", type: "Literal['critical','high','medium','low']", required: true, description: "Приоритет" },
      { name: "tags", type: "list[str]", required: true, description: "Теги" },
      { name: "source", type: "str", required: true, description: "Источник генерации" },
    ],
  },
  {
    name: "DoQAReview",
    description: "Результат внутреннего ревью тест-кейса",
    file: "schemas/doqa_review.py",
    fields: [
      { name: "review_id", type: "str", required: true, description: "ID ревью" },
      { name: "case_id", type: "str", required: true, description: "ID ревьюируемого кейса" },
      { name: "score", type: "float", required: true, description: "Итоговая оценка (0-100)" },
      { name: "rating", type: "int", required: true, description: "Рейтинг (1-5)" },
      { name: "status", type: "Literal['ready-for-review','needs-changes']", required: true, description: "Статус после ревью" },
      { name: "findings", type: "list[ReviewFinding]", required: true, description: "Замечания" },
      { name: "iteration", type: "int", required: true, description: "Номер итерации ревью" },
      { name: "area_scores", type: "dict[str, float]", required: true, description: "Оценки по областям" },
    ],
  },
  {
    name: "DoQAImportResult",
    description: "Результат импорта в DoQA",
    file: "schemas/doqa_import_result.py",
    fields: [
      { name: "import_id", type: "str", required: true, description: "ID операции импорта" },
      { name: "mode", type: "Literal['file','api']", required: true, description: "Режим импорта" },
      { name: "created_ids", type: "list[str]", required: true, description: "ID созданных кейсов" },
      { name: "updated_ids", type: "list[str]", required: true, description: "ID обновлённых кейсов" },
      { name: "archived_ids", type: "list[str]", required: true, description: "ID архивированных кейсов" },
      { name: "errors", type: "list[ImportError]", required: true, description: "Ошибки импорта" },
      { name: "success", type: "bool", required: true, description: "Общий успех" },
    ],
  },
  {
    name: "StructureChangeProposal",
    description: "Предложение по корректировке структуры DoQA",
    file: "schemas/structure_change.py",
    fields: [
      { name: "proposal_id", type: "str", required: true, description: "ID предложения" },
      { name: "change_type", type: "Literal['create_folder','create_section','move_case','update_tags','rename','restructure']", required: true, description: "Тип изменения" },
      { name: "target", type: "str", required: true, description: "Целевой объект" },
      { name: "current_value", type: "str | None", required: false, description: "Текущее значение" },
      { name: "new_value", type: "str", required: true, description: "Новое значение" },
      { name: "reason", type: "str", required: true, description: "Причина" },
      { name: "delta_id", type: "str | None", required: false, description: "Связанный delta_id" },
    ],
  },
  {
    name: "CodebaseContext",
    description: "Контекст из кодовой базы",
    file: "schemas/codebase_context.py",
    fields: [
      { name: "mode", type: "Literal['none','local_folder','git_repository','external_agent']", required: true, description: "Режим доступа" },
      { name: "changed_files", type: "list[str]", required: true, description: "Изменённые файлы" },
      { name: "affected_modules", type: "list[str]", required: true, description: "Затронутые модули" },
      { name: "existing_tests", type: "list[str]", required: true, description: "Существующие автотесты" },
      { name: "api_methods", type: "list[str]", required: true, description: "API-методы" },
      { name: "regression_zones", type: "list[str]", required: true, description: "Зоны регрессии" },
      { name: "available", type: "bool", required: true, description: "Доступен ли контекст" },
    ],
  },
  {
    name: "RedmineIssue",
    description: "Задача из Redmine",
    file: "schemas/redmine_issue.py",
    fields: [
      { name: "issue_id", type: "int", required: true, description: "ID задачи" },
      { name: "subject", type: "str", required: true, description: "Тема" },
      { name: "description", type: "str", required: true, description: "Описание" },
      { name: "tracker", type: "str", required: true, description: "Трекер" },
      { name: "status", type: "str", required: true, description: "Статус" },
      { name: "comments", type: "list[str]", required: true, description: "Комментарии" },
      { name: "related_bugs", type: "list[int]", required: true, description: "Связанные баги" },
      { name: "custom_fields", type: "dict[str, Any]", required: true, description: "Custom fields" },
    ],
  },
  {
    name: "HumanReview",
    description: "Решение человека по этапу",
    file: "schemas/human_review.py",
    fields: [
      { name: "review_id", type: "str", required: true, description: "ID ревью" },
      { name: "stage_id", type: "int", required: true, description: "ID этапа" },
      { name: "decision", type: "Literal['approve','reject','rerun','edit']", required: true, description: "Решение" },
      { name: "comments", type: "list[str]", required: true, description: "Комментарии" },
      { name: "reviewed_at", type: "datetime", required: true, description: "Время ревью" },
      { name: "reviewer", type: "str", required: true, description: "Кто принял решение" },
    ],
  },
];

export default function Schemas() {
  const [selectedSchema, setSelectedSchema] = useState<string>("RequirementVersion");
  const [searchQuery, setSearchQuery] = useState("");

  const current = schemas.find((s) => s.name === selectedSchema)!;

  const filtered = schemas.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Pydantic-схемы
          </span>
        </h1>
        <p className="text-gray-400">
          15 моделей данных для всех сущностей системы. Все ответы LLM валидируются через Pydantic v2.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Schema list */}
        <div className="w-72 flex-shrink-0 space-y-3">
          <input
            type="text"
            placeholder="Поиск схемы..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
          <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filtered.map((schema) => (
              <button
                key={schema.name}
                onClick={() => setSelectedSchema(schema.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  selectedSchema === schema.name
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <p className="font-mono font-semibold">{schema.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{schema.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Schema detail */}
        <div className="flex-1 space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">{current.name}</h2>
                <p className="text-xs text-gray-500 mt-1">{current.description}</p>
              </div>
              <code className="text-[10px] text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
                {current.file}
              </code>
            </div>

            {/* Fields table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Поле</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Тип</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Req</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {current.fields.map((field) => (
                    <tr key={field.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 px-2 font-mono text-cyan-400">{field.name}</td>
                      <td className="py-2 px-2 font-mono text-violet-400">{field.type}</td>
                      <td className="py-2 px-2 text-center">
                        {field.required ? (
                          <span className="text-emerald-400">●</span>
                        ) : (
                          <span className="text-gray-600">○</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-gray-400">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Python preview */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <i className="fa-brands fa-python text-yellow-400" />
              Python-представление
            </h3>
            <pre className="bg-gray-950 rounded-lg p-4 border border-gray-800 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
              <code>{generatePythonPreview(current)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePythonPreview(schema: Schema): string {
  const lines: string[] = [];
  lines.push(`from pydantic import BaseModel, Field`);
  lines.push(`from datetime import datetime`);
  lines.push(`from typing import Any, Literal`);
  lines.push(``);
  lines.push(``);
  lines.push(`class ${schema.name}(BaseModel):`);
  lines.push(`    """${schema.description}"""`);
  lines.push(``);
  for (const field of schema.fields) {
    const req = field.required ? "" : " | None = None";
    const desc = field.description;
    lines.push(`    ${field.name}: ${field.type}${field.required ? "" : " | None"} = Field(`);
    if (!field.required) lines.push(`        default=None,`);
    lines.push(`        description="${desc}",`);
    lines.push(`    )`);
    lines.push(``);
  }
  return lines.join("\n");
}
