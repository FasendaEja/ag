import { useState } from "react";

const projectTree = [
  { name: "qa-agent-system/", type: "root", children: [
    { name: "main.py", type: "file", desc: "Точка входа" },
    { name: "config.py", type: "file", desc: "Загрузка конфигурации" },
    { name: "pyproject.toml", type: "file", desc: "Зависимости проекта" },
    { name: ".env.example", type: "file", desc: "Шаблон переменных окружения" },
    { name: "Dockerfile", type: "file", desc: "Контейнеризация" },
    { name: "docker-compose.yml", type: "file", desc: "Оркестрация контейнеров" },
    { name: "README.md", type: "file", desc: "Документация" },
    { name: "rules/", type: "dir", desc: "Правила DoQA", children: [
      { name: "doqa_rules.md", type: "file", desc: "Правила ревью v1.10.0" },
    ]},
    { name: "config/", type: "dir", desc: "Конфигурация", children: [
      { name: "doqa_scoring.yaml", type: "file", desc: "Параметры оценки" },
      { name: "doqa_status_mapping.yaml", type: "file", desc: "Маппинг статусов" },
      { name: "app_settings.yaml", type: "file", desc: "Настройки приложения" },
    ]},
    { name: "integrations/doqa/", type: "dir", desc: "Интеграция с DoQA", children: [
      { name: "api_contract.yaml", type: "file", desc: "Контракт API (TBD)" },
      { name: "doqa_api_adapter.py", type: "file", desc: "API адаптер" },
      { name: "doqa_file_export_adapter.py", type: "file", desc: "Экспорт в файл" },
      { name: "doqa_import_service.py", type: "file", desc: "Сервис импорта" },
      { name: "doqa_structure_service.py", type: "file", desc: "Управление структурой" },
    ]},
    { name: "schemas/", type: "dir", desc: "Pydantic-схемы (15 шт.)", children: [
      { name: "requirement_version.py", type: "file", desc: "" },
      { name: "requirement_delta.py", type: "file", desc: "" },
      { name: "delta_impact.py", type: "file", desc: "" },
      { name: "stage_state.py", type: "file", desc: "" },
      { name: "human_review.py", type: "file", desc: "" },
      { name: "rationale.py", type: "file", desc: "" },
      { name: "analysis_report.py", type: "file", desc: "" },
      { name: "mindmap.py", type: "file", desc: "" },
      { name: "checklist.py", type: "file", desc: "" },
      { name: "doqa_test_case.py", type: "file", desc: "" },
      { name: "doqa_review.py", type: "file", desc: "" },
      { name: "doqa_import_result.py", type: "file", desc: "" },
      { name: "structure_change.py", type: "file", desc: "" },
      { name: "codebase_context.py", type: "file", desc: "" },
      { name: "redmine_issue.py", type: "file", desc: "" },
    ]},
    { name: "agents/", type: "dir", desc: "Агенты (11 шт.)", children: [
      { name: "requirement_intake_agent.py", type: "file", desc: "" },
      { name: "requirement_diff_agent.py", type: "file", desc: "" },
      { name: "requirement_analysis_agent.py", type: "file", desc: "" },
      { name: "mindmap_agent.py", type: "file", desc: "" },
      { name: "checklist_agent.py", type: "file", desc: "" },
      { name: "doqa_context_agent.py", type: "file", desc: "" },
      { name: "codebase_context_agent.py", type: "file", desc: "" },
      { name: "impact_analysis_agent.py", type: "file", desc: "" },
      { name: "test_case_authoring_agent.py", type: "file", desc: "" },
      { name: "doqa_review_agent.py", type: "file", desc: "" },
      { name: "doqa_structure_agent.py", type: "file", desc: "" },
    ]},
    { name: "graph/", type: "dir", desc: "LangGraph", children: [
      { name: "state.py", type: "file", desc: "Состояние графа" },
      { name: "nodes.py", type: "file", desc: "Узлы этапов" },
      { name: "edges.py", type: "file", desc: "Переходы" },
      { name: "pipeline.py", type: "file", desc: "Сборка пайплайна" },
    ]},
    { name: "adapters/", type: "dir", desc: "Адаптеры внешних систем", children: [
      { name: "redmine_adapter.py", type: "file", desc: "" },
      { name: "folder_input_adapter.py", type: "file", desc: "" },
      { name: "repository_input_adapter.py", type: "file", desc: "" },
      { name: "external_codebase_agent_adapter.py", type: "file", desc: "" },
    ]},
    { name: "parsers/", type: "dir", desc: "Парсеры документов (10 шт.)", children: [
      { name: "base.py", type: "file", desc: "Базовый интерфейс" },
      { name: "txt_parser.py", type: "file", desc: "" },
      { name: "markdown_parser.py", type: "file", desc: "" },
      { name: "doc_parser.py", type: "file", desc: "через pandoc/antiword" },
      { name: "docx_parser.py", type: "file", desc: "" },
      { name: "excel_parser.py", type: "file", desc: "" },
      { name: "csv_parser.py", type: "file", desc: "" },
      { name: "json_parser.py", type: "file", desc: "" },
      { name: "yaml_parser.py", type: "file", desc: "" },
      { name: "html_parser.py", type: "file", desc: "" },
      { name: "xml_parser.py", type: "file", desc: "" },
    ]},
    { name: "human/", type: "dir", desc: "Human-in-the-loop", children: [
      { name: "review_service.py", type: "file", desc: "Сервис подтверждения" },
      { name: "stage_gate.py", type: "file", desc: "Gate между этапами" },
      { name: "history_store.py", type: "file", desc: "Хранение истории" },
      { name: "web_ui_service.py", type: "file", desc: "Web UI endpoint" },
      { name: "cli_service.py", type: "file", desc: "CLI интерфейс" },
    ]},
    { name: "llm/", type: "dir", desc: "LLM-клиент", children: [
      { name: "client.py", type: "file", desc: "OpenAI-compatible клиент" },
      { name: "prompts.py", type: "file", desc: "Шаблоны промптов" },
      { name: "json_parser.py", type: "file", desc: "Парсинг JSON ответов" },
    ]},
    { name: "services/", type: "dir", desc: "Сервисы", children: [
      { name: "rules_loader.py", type: "file", desc: "Загрузка правил" },
      { name: "requirement_snapshot_service.py", type: "file", desc: "" },
      { name: "review_score_service.py", type: "file", desc: "Расчёт оценки" },
      { name: "rationale_service.py", type: "file", desc: "" },
      { name: "report_service.py", type: "file", desc: "" },
      { name: "markdown_service.py", type: "file", desc: "" },
    ]},
    { name: "workspace/", type: "dir", desc: "Рабочее пространство" },
    { name: "tests/", type: "dir", desc: "Тесты", children: [
      { name: "test_rules_loader.py", type: "file", desc: "" },
      { name: "test_review_score.py", type: "file", desc: "" },
      { name: "test_requirement_diff.py", type: "file", desc: "" },
      { name: "test_doqa_adapter_mock.py", type: "file", desc: "" },
      { name: "test_stage_gate.py", type: "file", desc: "" },
      { name: "test_parsers.py", type: "file", desc: "" },
      { name: "test_pipeline_smoke.py", type: "file", desc: "" },
    ]},
  ]},
];

const layers = [
  { name: "schemas", desc: "Pydantic-модели данных", color: "emerald", count: 15, icon: "fa-solid fa-cube" },
  { name: "agents", desc: "LLM-агенты для каждого этапа", color: "cyan", count: 11, icon: "fa-solid fa-robot" },
  { name: "graph", desc: "LangGraph оркестрация", color: "violet", count: 4, icon: "fa-solid fa-diagram-project" },
  { name: "adapters", desc: "Адаптеры внешних систем", color: "amber", count: 4, icon: "fa-solid fa-plug" },
  { name: "parsers", desc: "Парсеры документов", color: "pink", count: 11, icon: "fa-solid fa-file-lines" },
  { name: "human", desc: "Human-in-the-loop", color: "blue", count: 5, icon: "fa-solid fa-user-check" },
  { name: "llm", desc: "LLM-клиент и промпты", color: "orange", count: 3, icon: "fa-solid fa-brain" },
  { name: "services", desc: "Бизнес-сервисы", color: "teal", count: 6, icon: "fa-solid fa-cogs" },
  { name: "integrations", desc: "DoQA интеграция", color: "red", count: 5, icon: "fa-solid fa-server" },
  { name: "tests", desc: "Unit-тесты", color: "gray", count: 7, icon: "fa-solid fa-vial" },
];

export default function Architecture() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["qa-agent-system/"]));
  const [viewMode, setViewMode] = useState<"tree" | "layers">("tree");

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Архитектура проекта
          </span>
        </h1>
        <p className="text-gray-400">
          Модульная структура с разделением на слои. Запрещено смешивать бизнес-логику, LLM-клиент, адаптеры и UI.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("tree")}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            viewMode === "tree"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
          }`}
        >
          <i className="fa-solid fa-folder-tree mr-2" />Дерево файлов
        </button>
        <button
          onClick={() => setViewMode("layers")}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            viewMode === "layers"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
          }`}
        >
          <i className="fa-solid fa-layer-group mr-2" />Слои архитектуры
        </button>
      </div>

      {viewMode === "tree" ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 overflow-x-auto">
          <div className="font-mono text-sm">
            {projectTree.map((node) => (
              <TreeNode key={node.name} node={node} depth={0} path={node.name} expanded={expandedNodes} onToggle={toggleNode} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((layer) => {
            const colorMap: Record<string, string> = {
              emerald: "from-emerald-500/10 border-emerald-500/20 text-emerald-400",
              cyan: "from-cyan-500/10 border-cyan-500/20 text-cyan-400",
              violet: "from-violet-500/10 border-violet-500/20 text-violet-400",
              amber: "from-amber-500/10 border-amber-500/20 text-amber-400",
              pink: "from-pink-500/10 border-pink-500/20 text-pink-400",
              blue: "from-blue-500/10 border-blue-500/20 text-blue-400",
              orange: "from-orange-500/10 border-orange-500/20 text-orange-400",
              teal: "from-teal-500/10 border-teal-500/20 text-teal-400",
              red: "from-red-500/10 border-red-500/20 text-red-400",
              gray: "from-gray-500/10 border-gray-500/20 text-gray-400",
            };
            return (
              <div key={layer.name} className={`bg-gradient-to-br ${colorMap[layer.color]} to-transparent border rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className={`${layer.icon} ${colorMap[layer.color].split(" ").pop()}`} />
                    <span className="text-sm font-bold text-white">{layer.name}/</span>
                  </div>
                  <span className="text-xs text-gray-500">{layer.count} файлов</span>
                </div>
                <p className="text-xs text-gray-400">{layer.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Data flow */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-arrows-spin text-cyan-400" />
          Трассируемость данных
        </h2>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">delta_id</span>
            <i className="fa-solid fa-arrow-right text-gray-600 text-[10px]" />
            <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">checklist_item</span>
            <i className="fa-solid fa-arrow-right text-gray-600 text-[10px]" />
            <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-400">test_case</span>
            <i className="fa-solid fa-arrow-right text-gray-600 text-[10px]" />
            <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">doqa_action</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Каждый тест-кейс имеет полную трассировку до исходного изменения требования.
          </p>
        </div>
      </section>

      {/* Generation steps */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-list-ol text-violet-400" />
          Порядок генерации кода
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { step: "A", title: "Каркас и данные", items: ["Структура проекта", "pyproject.toml", ".env.example", "config.py", "Pydantic-схемы", "rules/doqa_rules.md", "Конфигурации", "Заглушки адаптеров"] },
            { step: "B", title: "Доменная логика", items: ["Парсеры документов", "Сервис снимков требований", "Сервис дельты", "Сервис анализа", "Сервис mind-map", "Сервис чек-листов", "Impact analysis"] },
            { step: "C", title: "Агенты и граф", items: ["LangGraph state", "Узлы этапов", "Переходы", "Цикл генерации/ревью", "Агенты", "Human gates"] },
            { step: "D", title: "Интерфейсы и интеграции", items: ["FastAPI backend", "Web UI", "CLI", "DoQA mock/dry-run", "Экспорт файла", "Redmine адаптер", "Dockerfile", "docker-compose.yml", "Тесты"] },
          ].map((s) => (
            <div key={s.step} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {s.step}
                </span>
                <span className="text-sm font-semibold text-white">{s.title}</span>
              </div>
              <ul className="space-y-1">
                {s.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface TreeNodeData {
  name: string;
  type: string;
  desc?: string;
  children?: TreeNodeData[];
}

function TreeNode({ node, depth, path, expanded, onToggle }: {
  node: TreeNodeData; depth: number; path: string; expanded: Set<string>; onToggle: (p: string) => void;
}) {
  const isExpanded = expanded.has(path);
  const hasChildren = node.children && node.children.length > 0;

  const iconColor = node.type === "dir" || node.type === "root" ? "text-amber-400" : "text-gray-500";
  const icon = node.type === "file"
    ? "fa-solid fa-file-code"
    : isExpanded ? "fa-solid fa-folder-open" : "fa-solid fa-folder";

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-0.5 cursor-pointer hover:bg-gray-800/50 rounded px-1 ${
          node.type === "root" ? "font-bold text-white" : ""
        }`}
        style={{ paddingLeft: `${depth * 20 + 4}px` }}
        onClick={() => hasChildren && onToggle(path)}
      >
        {hasChildren ? (
          <i className={`fa-solid fa-chevron-${isExpanded ? "down" : "right"} text-[8px] text-gray-600 w-3`} />
        ) : (
          <span className="w-3" />
        )}
        <i className={`${icon} ${iconColor} text-xs w-4 text-center`} />
        <span className={`${node.type === "dir" ? "text-amber-300" : "text-gray-300"}`}>{node.name}</span>
        {node.desc && <span className="text-[10px] text-gray-600 ml-2">{node.desc}</span>}
      </div>
      {isExpanded && hasChildren && node.children?.map((child) => (
        <TreeNode
          key={child.name}
          node={child}
          depth={depth + 1}
          path={`${path}${child.name}`}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
