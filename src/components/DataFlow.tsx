import { useState } from "react";

interface FlowNode {
  id: string;
  label: string;
  type: "input" | "process" | "data" | "output" | "decision";
  stage?: number;
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  data?: string;
}

const nodes: FlowNode[] = [
  { id: "req_source", label: "Источник требований", type: "input" },
  { id: "req_version", label: "RequirementVersion", type: "data" },
  { id: "diff_agent", label: "Diff Agent", type: "process", stage: 2 },
  { id: "delta", label: "RequirementDelta", type: "data" },
  { id: "human_gate", label: "Human Gate", type: "decision", stage: 3 },
  { id: "analysis_agent", label: "Analysis Agent", type: "process", stage: 4 },
  { id: "report", label: "AnalysisReport", type: "data" },
  { id: "mindmap_agent", label: "MindMap Agent", type: "process", stage: 5 },
  { id: "mindmap", label: "MindMap", type: "data" },
  { id: "checklist_agent", label: "Checklist Agent", type: "process", stage: 6 },
  { id: "checklist", label: "Checklist", type: "data" },
  { id: "doqa_api", label: "DoQA API", type: "input" },
  { id: "doqa_ctx", label: "DoQA Context Agent", type: "process", stage: 7 },
  { id: "doqa_cases", label: "DoQATestCase[]", type: "data" },
  { id: "codebase", label: "Codebase Agent", type: "input" },
  { id: "code_ctx", label: "CodebaseContext", type: "data" },
  { id: "impact_agent", label: "Impact Agent", type: "process", stage: 8 },
  { id: "impact", label: "DeltaImpact", type: "data" },
  { id: "authoring_agent", label: "Authoring Agent", type: "process", stage: 10 },
  { id: "test_case", label: "DoQATestCase", type: "data" },
  { id: "review_agent", label: "Review Agent", type: "process", stage: 10 },
  { id: "review", label: "DoQAReview", type: "data" },
  { id: "structure_agent", label: "Structure Agent", type: "process", stage: 11 },
  { id: "proposal", label: "StructureChangeProposal", type: "data" },
  { id: "import_service", label: "Import Service", type: "process", stage: 12 },
  { id: "doqa_output", label: "DoQA (Ревью/Архив)", type: "output" },
];

const connections: FlowConnection[] = [
  { from: "req_source", to: "req_version", label: "parse" },
  { from: "req_version", to: "diff_agent", data: "old + new" },
  { from: "diff_agent", to: "delta" },
  { from: "delta", to: "human_gate" },
  { from: "human_gate", to: "analysis_agent", label: "approved" },
  { from: "analysis_agent", to: "report" },
  { from: "report", to: "mindmap_agent" },
  { from: "delta", to: "mindmap_agent" },
  { from: "mindmap_agent", to: "mindmap" },
  { from: "mindmap", to: "checklist_agent" },
  { from: "report", to: "checklist_agent" },
  { from: "checklist_agent", to: "checklist" },
  { from: "doqa_api", to: "doqa_ctx", label: "fetch" },
  { from: "doqa_ctx", to: "doqa_cases" },
  { from: "codebase", to: "code_ctx", label: "analyze" },
  { from: "doqa_cases", to: "impact_agent" },
  { from: "code_ctx", to: "impact_agent" },
  { from: "delta", to: "impact_agent" },
  { from: "impact_agent", to: "impact" },
  { from: "impact", to: "authoring_agent" },
  { from: "checklist", to: "authoring_agent" },
  { from: "mindmap", to: "authoring_agent" },
  { from: "authoring_agent", to: "test_case" },
  { from: "test_case", to: "review_agent" },
  { from: "review_agent", to: "review" },
  { from: "review", to: "authoring_agent", label: "rerun if <90" },
  { from: "test_case", to: "structure_agent" },
  { from: "mindmap", to: "structure_agent" },
  { from: "structure_agent", to: "proposal" },
  { from: "test_case", to: "import_service" },
  { from: "proposal", to: "import_service" },
  { from: "import_service", to: "doqa_output", label: "import" },
];

const typeConfig = {
  input: { color: "bg-blue-500/20 border-blue-500/30 text-blue-400", icon: "fa-solid fa-right-to-bracket" },
  process: { color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400", icon: "fa-solid fa-robot" },
  data: { color: "bg-violet-500/20 border-violet-500/30 text-violet-400", icon: "fa-solid fa-database" },
  output: { color: "bg-amber-500/20 border-amber-500/30 text-amber-400", icon: "fa-solid fa-right-from-bracket" },
  decision: { color: "bg-pink-500/20 border-pink-500/30 text-pink-400", icon: "fa-solid fa-user-check" },
};

export default function DataFlow() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"diagram" | "list">("diagram");

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);
  const incomingConnections = connections.filter((c) => c.to === selectedNode);
  const outgoingConnections = connections.filter((c) => c.from === selectedNode);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Диаграмма потоков данных
          </span>
        </h1>
        <p className="text-gray-400">
          Как данные текут от требований к DoQA. Трассируемость: delta_id → checklist_item → test_case → doqa_action.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("diagram")}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            viewMode === "diagram"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
          }`}
        >
          <i className="fa-solid fa-diagram-project mr-2" />Диаграмма
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            viewMode === "list"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
          }`}
        >
          <i className="fa-solid fa-list mr-2" />Список потоков
        </button>
      </div>

      {viewMode === "diagram" ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-800">
            {Object.entries(typeConfig).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${cfg.color.split(" ")[0]} border ${cfg.color.split(" ")[1]}`} />
                <span className="text-gray-400 capitalize">{type}</span>
              </div>
            ))}
          </div>

          {/* Flow visualization */}
          <div className="space-y-8">
            {/* Stage 1-3: Requirements intake */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Этапы 1-3: Получение и сравнение</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <FlowNodeBox node={nodes[0]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[1]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[2]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[3]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[4]} onClick={setSelectedNode} selected={selectedNode} />
              </div>
            </div>

            {/* Stage 4-6: Analysis */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Этапы 4-6: Анализ и планирование</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <FlowNodeBox node={nodes[5]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[6]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[7]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[8]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[9]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[10]} onClick={setSelectedNode} selected={selectedNode} />
              </div>
            </div>

            {/* Stage 7: Context */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Этап 7: Сбор контекста</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <FlowNodeBox node={nodes[11]} onClick={setSelectedNode} selected={selectedNode} />
                  <FlowArrow />
                  <FlowNodeBox node={nodes[12]} onClick={setSelectedNode} selected={selectedNode} />
                  <FlowArrow />
                  <FlowNodeBox node={nodes[13]} onClick={setSelectedNode} selected={selectedNode} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <FlowNodeBox node={nodes[14]} onClick={setSelectedNode} selected={selectedNode} />
                  <FlowArrow />
                  <FlowNodeBox node={nodes[15]} onClick={setSelectedNode} selected={selectedNode} />
                </div>
              </div>
            </div>

            {/* Stage 8-10: Impact and generation */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Этапы 8-10: Влияние и генерация</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <FlowNodeBox node={nodes[16]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[17]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[18]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[19]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[20]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[21]} onClick={setSelectedNode} selected={selectedNode} />
              </div>
            </div>

            {/* Stage 11-12: Structure and export */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Этапы 11-12: Структура и экспорт</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <FlowNodeBox node={nodes[22]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[23]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[24]} onClick={setSelectedNode} selected={selectedNode} />
                <FlowArrow />
                <FlowNodeBox node={nodes[25]} onClick={setSelectedNode} selected={selectedNode} />
              </div>
            </div>
          </div>

          {/* Selected node details */}
          {selectedNodeData && (
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 space-y-3">
              <div className="flex items-center gap-2">
                <i className={`${typeConfig[selectedNodeData.type].icon} ${typeConfig[selectedNodeData.type].color.split(" ")[2]}`} />
                <h3 className="text-sm font-semibold text-white">{selectedNodeData.label}</h3>
                {selectedNodeData.stage && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400">
                    Этап {selectedNodeData.stage}
                  </span>
                )}
              </div>
              {incomingConnections.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Входящие потоки:</p>
                  <div className="flex flex-wrap gap-2">
                    {incomingConnections.map((c, i) => {
                      const fromNode = nodes.find((n) => n.id === c.from);
                      return (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ← {fromNode?.label} {c.data && <span className="text-gray-500">({c.data})</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {outgoingConnections.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Исходящие потоки:</p>
                  <div className="flex flex-wrap gap-2">
                    {outgoingConnections.map((c, i) => {
                      const toNode = nodes.find((n) => n.id === c.to);
                      return (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          → {toNode?.label} {c.label && <span className="text-gray-500">({c.label})</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="space-y-2">
            {connections.map((conn, i) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              return (
                <div key={i} className="flex items-center gap-3 text-xs bg-gray-800/30 rounded-lg p-2">
                  <span className={`px-2 py-1 rounded ${typeConfig[fromNode!.type].color} font-medium`}>
                    {fromNode?.label}
                  </span>
                  <i className="fa-solid fa-arrow-right text-gray-600" />
                  <span className={`px-2 py-1 rounded ${typeConfig[toNode!.type].color} font-medium`}>
                    {toNode?.label}
                  </span>
                  {(conn.label || conn.data) && (
                    <span className="text-gray-500 ml-auto">
                      {conn.label || conn.data}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traceability */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-link text-cyan-400" />
          Трассируемость данных
        </h2>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <span className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              delta_id
            </span>
            <i className="fa-solid fa-arrow-right text-gray-600" />
            <span className="px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              checklist_item
            </span>
            <i className="fa-solid fa-arrow-right text-gray-600" />
            <span className="px-3 py-1.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
              test_case
            </span>
            <i className="fa-solid fa-arrow-right text-gray-600" />
            <span className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              doqa_action
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Каждый тест-кейс имеет полную трассировку до исходного изменения требования.
            Это позволяет понять, почему был создан или изменён каждый кейс.
          </p>
        </div>
      </section>
    </div>
  );
}

function FlowNodeBox({ node, onClick, selected }: { node: FlowNode; onClick: (id: string) => void; selected: string | null }) {
  const cfg = typeConfig[node.type];
  const isSelected = selected === node.id;

  return (
    <button
      onClick={() => onClick(node.id)}
      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
        cfg.color
      } ${
        isSelected ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-emerald-500/50 scale-105" : "hover:scale-105"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <i className={`${cfg.icon} text-[10px]`} />
        <span>{node.label}</span>
      </div>
      {node.stage && (
        <div className="text-[9px] text-gray-500 mt-0.5">S{node.stage}</div>
      )}
    </button>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center">
      <i className="fa-solid fa-arrow-right text-gray-600 text-xs" />
    </div>
  );
}
