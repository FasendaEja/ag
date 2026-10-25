import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  file: string;
  description: string;
  stage: number;
  temperature: string;
  inputSchemas: string[];
  outputSchemas: string[];
  tools: string[];
  connectsTo: string[];
}

const agents: Agent[] = [
  {
    id: "intake",
    name: "Requirement Intake",
    file: "agents/requirement_intake_agent.py",
    description: "Получает требования из различных источников: текст, файл, папка, репозиторий, Redmine.",
    stage: 1,
    temperature: "—",
    inputSchemas: ["SourceConfig"],
    outputSchemas: ["RequirementVersion"],
    tools: ["folder_input_adapter", "repository_input_adapter", "redmine_adapter", "parsers/*"],
    connectsTo: ["diff"],
  },
  {
    id: "diff",
    name: "Requirement Diff",
    file: "agents/requirement_diff_agent.py",
    description: "Смысловое сравнение старой и новой версии. Определяет типы изменений.",
    stage: 2,
    temperature: "0.2",
    inputSchemas: ["RequirementVersion", "RequirementVersion"],
    outputSchemas: ["RequirementDelta"],
    tools: ["llm_client", "json_parser"],
    connectsTo: ["analysis"],
  },
  {
    id: "analysis",
    name: "Requirement Analysis",
    file: "agents/requirement_analysis_agent.py",
    description: "Анализ требований: полнота, тестируемость, противоречия, отсутствующие сценарии.",
    stage: 4,
    temperature: "0.2",
    inputSchemas: ["RequirementDelta"],
    outputSchemas: ["AnalysisReport"],
    tools: ["llm_client", "json_parser"],
    connectsTo: ["mindmap"],
  },
  {
    id: "mindmap",
    name: "MindMap Builder",
    file: "agents/mindmap_agent.py",
    description: "Формирует mind-map доработки в Markdown, Mermaid и JSON.",
    stage: 5,
    temperature: "0.3",
    inputSchemas: ["RequirementDelta", "AnalysisReport"],
    outputSchemas: ["MindMap"],
    tools: ["llm_client", "markdown_service"],
    connectsTo: ["checklist"],
  },
  {
    id: "checklist",
    name: "Checklist Builder",
    file: "agents/checklist_agent.py",
    description: "Формирует чек-лист проверок по всем категориям.",
    stage: 6,
    temperature: "0.2",
    inputSchemas: ["MindMap", "RequirementDelta", "AnalysisReport"],
    outputSchemas: ["Checklist"],
    tools: ["llm_client", "json_parser"],
    connectsTo: ["doqa_ctx", "codebase_ctx"],
  },
  {
    id: "doqa_ctx",
    name: "DoQA Context",
    file: "agents/doqa_context_agent.py",
    description: "Собирает существующие кейсы, связи, дубликаты из DoQA.",
    stage: 7,
    temperature: "—",
    inputSchemas: ["DoQAConfig"],
    outputSchemas: ["DoQATestCase[]"],
    tools: ["doqa_api_adapter", "doqa_file_export_adapter"],
    connectsTo: ["impact"],
  },
  {
    id: "codebase_ctx",
    name: "Codebase Context",
    file: "agents/codebase_context_agent.py",
    description: "Собирает контекст из кодовой базы через адаптер.",
    stage: 7,
    temperature: "—",
    inputSchemas: ["CodebaseConfig"],
    outputSchemas: ["CodebaseContext"],
    tools: ["external_codebase_agent_adapter"],
    connectsTo: ["impact"],
  },
  {
    id: "impact",
    name: "Impact Analysis",
    file: "agents/impact_analysis_agent.py",
    description: "Сопоставляет дельту с кейсами и кодом. Определяет влияние.",
    stage: 8,
    temperature: "0.15",
    inputSchemas: ["RequirementDelta", "DoQATestCase[]", "CodebaseContext"],
    outputSchemas: ["DeltaImpact"],
    tools: ["llm_client", "json_parser"],
    connectsTo: ["authoring"],
  },
  {
    id: "authoring",
    name: "Test Case Authoring",
    file: "agents/test_case_authoring_agent.py",
    description: "Генерирует тест-кейсы строго по правилам DoQA.",
    stage: 10,
    temperature: "0.1",
    inputSchemas: ["RequirementDelta", "MindMap", "Checklist", "DoQATestCase[]"],
    outputSchemas: ["DoQATestCase"],
    tools: ["llm_client", "rules_loader", "json_parser"],
    connectsTo: ["review"],
  },
  {
    id: "review",
    name: "DoQA Review",
    file: "agents/doqa_review_agent.py",
    description: "Внутреннее ревью тест-кейсов по правилам DoQA. Цикл до 3 итераций.",
    stage: 10,
    temperature: "0.0",
    inputSchemas: ["DoQATestCase", "Rules"],
    outputSchemas: ["DoQAReview"],
    tools: ["llm_client", "rules_loader", "review_score_service"],
    connectsTo: ["structure"],
  },
  {
    id: "structure",
    name: "DoQA Structure",
    file: "agents/doqa_structure_agent.py",
    description: "Предложения по корректировке структуры кейсов в DoQA.",
    stage: 11,
    temperature: "0.2",
    inputSchemas: ["MindMap", "DoQATestCase[]"],
    outputSchemas: ["StructureChangeProposal"],
    tools: ["llm_client", "doqa_structure_service"],
    connectsTo: [],
  },
];

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<string>("intake");
  const current = agents.find((a) => a.id === selectedAgent)!;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Агенты системы
          </span>
        </h1>
        <p className="text-gray-400">
          11 агентов, каждый отвечает за свой этап пайплайна. Оркестрация через LangGraph.
        </p>
      </div>

      {/* Agent flow diagram */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-diagram-project text-cyan-400" />
          Граф агентов (LangGraph)
        </h2>
        <div className="flex items-center gap-2 min-w-max pb-4">
          {agents.map((agent, i) => (
            <div key={agent.id} className="flex items-center">
              <button
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all min-w-[100px] ${
                  selectedAgent === agent.id
                    ? "bg-emerald-500/15 border border-emerald-500/30 scale-105"
                    : "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600"
                }`}
              >
                <span className={`text-[10px] font-mono mb-1 ${
                  selectedAgent === agent.id ? "text-emerald-400" : "text-gray-600"
                }`}>
                  S{agent.stage}
                </span>
                <span className={`text-xs font-medium text-center leading-tight ${
                  selectedAgent === agent.id ? "text-emerald-300" : "text-gray-400"
                }`}>
                  {agent.name}
                </span>
                {agent.temperature !== "—" && (
                  <span className="text-[9px] text-violet-400 mt-1 font-mono">t={agent.temperature}</span>
                )}
              </button>
              {i < agents.length - 1 && (
                <div className="flex items-center mx-0.5">
                  <i className="fa-solid fa-arrow-right text-[10px] text-gray-700" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/50" /> Выбранный</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-700" /> Неактивный</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-arrow-right text-[8px]" /> Поток данных</span>
          <span className="flex items-center gap-1"><span className="px-1 py-0.5 rounded bg-violet-500/20 text-violet-400 font-mono">t=</span> Температура LLM</span>
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            className={`text-left bg-gray-900 rounded-xl border p-4 transition-all hover:border-emerald-500/30 ${
              selectedAgent === agent.id
                ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                : "border-gray-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {agent.stage}
              </span>
              <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{agent.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {agent.outputSchemas.slice(0, 2).map((s) => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  → {s}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Agent detail */}
      <div className="bg-gray-900 rounded-xl border border-emerald-500/20 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
              <i className="fa-solid fa-robot text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{current.name}</h2>
              <code className="text-xs text-gray-500 font-mono">{current.file}</code>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
              Этап {current.stage}
            </span>
            {current.temperature !== "—" && (
              <span className="text-xs px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
                temp={current.temperature}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-300">{current.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/20">
            <h4 className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1">
              <i className="fa-solid fa-right-to-bracket text-[10px]" /> Вход
            </h4>
            <div className="space-y-1">
              {current.inputSchemas.map((s) => (
                <code key={s} className="block text-[11px] text-gray-300 font-mono">{s}</code>
              ))}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-violet-500/20">
            <h4 className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1">
              <i className="fa-solid fa-right-from-bracket text-[10px]" /> Выход
            </h4>
            <div className="space-y-1">
              {current.outputSchemas.map((s) => (
                <code key={s} className="block text-[11px] text-gray-300 font-mono">{s}</code>
              ))}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-amber-500/20">
            <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
              <i className="fa-solid fa-wrench text-[10px]" /> Инструменты
            </h4>
            <div className="space-y-1">
              {current.tools.map((t) => (
                <code key={t} className="block text-[11px] text-gray-300 font-mono">{t}</code>
              ))}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-emerald-500/20">
            <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
              <i className="fa-solid fa-arrow-right text-[10px]" /> Связи
            </h4>
            <div className="space-y-1">
              {current.connectsTo.length > 0 ? current.connectsTo.map((c) => {
                const target = agents.find((a) => a.id === c);
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedAgent(c)}
                    className="block text-[11px] text-emerald-400 font-mono hover:underline text-left"
                  >
                    → {target?.name || c}
                  </button>
                );
              }) : (
                <span className="text-[11px] text-gray-500">Финальный агент</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Human gate info */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-user-check text-amber-400" />
          Human Gate между агентами
        </h2>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <i className="fa-solid fa-robot mr-1" />Агент завершил
            </span>
            <i className="fa-solid fa-arrow-right text-gray-600" />
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <i className="fa-solid fa-pause mr-1" />Ожидание человека
            </span>
            <i className="fa-solid fa-arrow-right text-gray-600" />
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <i className="fa-solid fa-user mr-1" />Решение: approve / reject / rerun
            </span>
            <i className="fa-solid fa-arrow-right text-gray-600" />
            <span className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <i className="fa-solid fa-play mr-1" />Следующий агент
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Автоматический переход к следующему этапу запрещён. Каждый этап требует явного подтверждения.
          </p>
        </div>
      </section>
    </div>
  );
}
