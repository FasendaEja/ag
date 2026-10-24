import { useState, useMemo } from "react";

type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR";

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  stage: number | null;
  stageName: string | null;
  iteration: number | null;
  module: string;
  message: string;
  details?: string;
}

const logData: LogEntry[] = [
  { id: 1, timestamp: "2024-01-15 10:00:01.234", level: "INFO", stage: null, stageName: null, iteration: null, module: "main", message: "QA Agent System started" },
  { id: 2, timestamp: "2024-01-15 10:00:01.456", level: "INFO", stage: null, stageName: null, iteration: null, module: "config", message: "Configuration loaded: LLM_MODEL=qwen3.8, RULES_FILE_PATH=rules/doqa_rules.md" },
  { id: 3, timestamp: "2024-01-15 10:00:01.789", level: "INFO", stage: null, stageName: null, iteration: null, module: "rules_loader", message: "Loaded rules: rules/doqa_rules.md (version=1.10.0, hash=a3f8c2d1)" },
  { id: 4, timestamp: "2024-01-15 10:00:02.012", level: "INFO", stage: 1, stageName: "requirement_intake", iteration: 1, module: "stage_gate", message: "Stage 1 started: requirement_intake" },
  { id: 5, timestamp: "2024-01-15 10:00:02.345", level: "DEBUG", stage: 1, stageName: "requirement_intake", iteration: 1, module: "folder_input_adapter", message: "Scanning folder: ./requirements/ (recursive=true)" },
  { id: 6, timestamp: "2024-01-15 10:00:02.567", level: "INFO", stage: 1, stageName: "requirement_intake", iteration: 1, module: "folder_input_adapter", message: "Found 2 files: requirements_v1.md, requirements_v2.md" },
  { id: 7, timestamp: "2024-01-15 10:00:02.890", level: "DEBUG", stage: 1, stageName: "requirement_intake", iteration: 1, module: "markdown_parser", message: "Parsing: requirements_v1.md (45 sections)" },
  { id: 8, timestamp: "2024-01-15 10:00:03.123", level: "DEBUG", stage: 1, stageName: "requirement_intake", iteration: 1, module: "markdown_parser", message: "Parsing: requirements_v2.md (52 sections)" },
  { id: 9, timestamp: "2024-01-15 10:00:03.456", level: "INFO", stage: 1, stageName: "requirement_intake", iteration: 1, module: "requirement_intake_agent", message: "RequirementVersion created: old (v1, 39 items), new (v2, 47 items)" },
  { id: 10, timestamp: "2024-01-15 10:00:03.789", level: "INFO", stage: 1, stageName: "requirement_intake", iteration: 1, module: "stage_gate", message: "Stage 1 completed. Status: waiting_for_human" },
  { id: 11, timestamp: "2024-01-15 10:01:15.012", level: "INFO", stage: 1, stageName: "requirement_intake", iteration: 1, module: "human_review", message: "Human decision: approve (reviewer=admin)" },
  { id: 12, timestamp: "2024-01-15 10:01:15.345", level: "INFO", stage: 2, stageName: "requirement_diff", iteration: 1, module: "stage_gate", message: "Stage 2 started: requirement_diff" },
  { id: 13, timestamp: "2024-01-15 10:01:15.678", level: "DEBUG", stage: 2, stageName: "requirement_diff", iteration: 1, module: "llm_client", message: "LLM request: model=qwen3.8, temperature=0.2, max_tokens=8000" },
  { id: 14, timestamp: "2024-01-15 10:01:18.901", level: "DEBUG", stage: 2, stageName: "requirement_diff", iteration: 1, module: "llm_client", message: "LLM response received: 4523 tokens, latency=3223ms" },
  { id: 15, timestamp: "2024-01-15 10:01:19.234", level: "INFO", stage: 2, stageName: "requirement_diff", iteration: 1, module: "requirement_diff_agent", message: "RequirementDelta created: 15 items (added=4, changed=6, removed=1, unchanged=3, renamed=1)" },
  { id: 16, timestamp: "2024-01-15 10:01:19.567", level: "INFO", stage: 2, stageName: "requirement_diff", iteration: 1, module: "stage_gate", message: "Stage 2 completed. Status: waiting_for_human" },
  { id: 17, timestamp: "2024-01-15 10:02:30.890", level: "INFO", stage: 2, stageName: "requirement_diff", iteration: 1, module: "human_review", message: "Human decision: approve with comments: «Объединить delta-003 и delta-007»" },
  { id: 18, timestamp: "2024-01-15 10:02:31.123", level: "INFO", stage: 3, stageName: "human_gate_delta", iteration: 1, module: "stage_gate", message: "Stage 3: delta confirmed by human" },
  { id: 19, timestamp: "2024-01-15 10:02:31.456", level: "INFO", stage: 4, stageName: "requirement_analysis", iteration: 1, module: "stage_gate", message: "Stage 4 started: requirement_analysis" },
  { id: 20, timestamp: "2024-01-15 10:02:31.789", level: "DEBUG", stage: 4, stageName: "requirement_analysis", iteration: 1, module: "llm_client", message: "LLM request: model=qwen3.8, temperature=0.2" },
  { id: 21, timestamp: "2024-01-15 10:02:35.012", level: "INFO", stage: 4, stageName: "requirement_analysis", iteration: 1, module: "requirement_analysis_agent", message: "AnalysisReport: testability=0.82, issues=3, questions=5, risks=2" },
  { id: 22, timestamp: "2024-01-15 10:02:35.345", level: "WARNING", stage: 4, stageName: "requirement_analysis", iteration: 1, module: "requirement_analysis_agent", message: "Missing boundary conditions for 2 fields in delta-005, delta-009" },
  { id: 23, timestamp: "2024-01-15 10:02:35.678", level: "INFO", stage: 4, stageName: "requirement_analysis", iteration: 1, module: "stage_gate", message: "Stage 4 completed. Status: waiting_for_human" },
  { id: 24, timestamp: "2024-01-15 10:03:10.901", level: "INFO", stage: 4, stageName: "requirement_analysis", iteration: 1, module: "human_review", message: "Human decision: approve" },
  { id: 25, timestamp: "2024-01-15 10:03:11.234", level: "INFO", stage: 5, stageName: "mindmap", iteration: 1, module: "stage_gate", message: "Stage 5 started: mindmap" },
  { id: 26, timestamp: "2024-01-15 10:03:14.567", level: "INFO", stage: 5, stageName: "mindmap", iteration: 1, module: "mindmap_agent", message: "MindMap created: 5 branches, 23 nodes, formats: markdown+mermaid+json" },
  { id: 27, timestamp: "2024-01-15 10:03:14.890", level: "INFO", stage: 5, stageName: "mindmap", iteration: 1, module: "stage_gate", message: "Stage 5 completed. Status: waiting_for_human" },
  { id: 28, timestamp: "2024-01-15 10:03:45.123", level: "INFO", stage: 5, stageName: "mindmap", iteration: 1, module: "human_review", message: "Human decision: approve" },
  { id: 29, timestamp: "2024-01-15 10:03:45.456", level: "INFO", stage: 6, stageName: "checklist", iteration: 1, module: "stage_gate", message: "Stage 6 started: checklist" },
  { id: 30, timestamp: "2024-01-15 10:03:48.789", level: "INFO", stage: 6, stageName: "checklist", iteration: 1, module: "checklist_agent", message: "Checklist created: 34 items (positive=12, negative=8, boundary=6, regression=4, access=2, integration=2)" },
  { id: 31, timestamp: "2024-01-15 10:03:49.012", level: "INFO", stage: 7, stageName: "context", iteration: 1, module: "stage_gate", message: "Stage 7 started: context collection" },
  { id: 32, timestamp: "2024-01-15 10:03:49.345", level: "INFO", stage: 7, stageName: "context", iteration: 1, module: "doqa_context_agent", message: "DoQA context: 156 existing cases, 12 related to filter module (dry-run mode)" },
  { id: 33, timestamp: "2024-01-15 10:03:49.678", level: "WARNING", stage: 7, stageName: "context", iteration: 1, module: "codebase_context_agent", message: "Codebase agent unavailable (mode=external_agent). Context partially collected." },
  { id: 34, timestamp: "2024-01-15 10:03:50.012", level: "INFO", stage: 7, stageName: "context", iteration: 1, module: "stage_gate", message: "Stage 7 completed (partial). Status: waiting_for_human" },
  { id: 35, timestamp: "2024-01-15 10:04:20.345", level: "INFO", stage: 7, stageName: "context", iteration: 1, module: "human_review", message: "Human decision: approve (noted: codebase unavailable)" },
  { id: 36, timestamp: "2024-01-15 10:04:20.678", level: "INFO", stage: 8, stageName: "impact_analysis", iteration: 1, module: "stage_gate", message: "Stage 8 started: impact_analysis" },
  { id: 37, timestamp: "2024-01-15 10:04:23.901", level: "INFO", stage: 8, stageName: "impact_analysis", iteration: 1, module: "impact_analysis_agent", message: "DeltaImpact: create=4, update=6, archive=1, skip=3, manual_review=1" },
  { id: 38, timestamp: "2024-01-15 10:04:24.234", level: "INFO", stage: 9, stageName: "case_lists", iteration: 1, module: "stage_gate", message: "Stage 9: case lists formed (new=4, update=6, archive=1, unchanged=3)" },
  { id: 39, timestamp: "2024-01-15 10:04:24.567", level: "INFO", stage: 10, stageName: "authoring", iteration: 1, module: "stage_gate", message: "Stage 10 started: test_case_authoring" },
  { id: 40, timestamp: "2024-01-15 10:04:24.890", level: "DEBUG", stage: 10, stageName: "authoring", iteration: 1, module: "rules_loader", message: "Using rules: doqa_rules.md v1.10.0" },
  { id: 41, timestamp: "2024-01-15 10:04:28.123", level: "INFO", stage: 10, stageName: "authoring", iteration: 1, module: "test_case_authoring_agent", message: "Generated 10 test cases (4 new + 6 updated)" },
  { id: 42, timestamp: "2024-01-15 10:04:28.456", level: "INFO", stage: 10, stageName: "review", iteration: 1, module: "doqa_review_agent", message: "Review iteration 1: avg_score=87.5, ready=6, needs_changes=4" },
  { id: 43, timestamp: "2024-01-15 10:04:28.789", level: "DEBUG", stage: 10, stageName: "review", iteration: 1, module: "review_score_service", message: "Case TC-001: score=95.2, rating=5, status=ready-for-review" },
  { id: 44, timestamp: "2024-01-15 10:04:29.012", level: "DEBUG", stage: 10, stageName: "review", iteration: 1, module: "review_score_service", message: "Case TC-005: score=72.3, rating=3, status=needs-changes (findings: 3)" },
  { id: 45, timestamp: "2024-01-15 10:04:29.345", level: "INFO", stage: 10, stageName: "authoring", iteration: 2, module: "test_case_authoring_agent", message: "Review iteration 2: regenerating 4 cases with feedback" },
  { id: 46, timestamp: "2024-01-15 10:04:32.678", level: "INFO", stage: 10, stageName: "review", iteration: 2, module: "doqa_review_agent", message: "Review iteration 2: avg_score=93.1, ready=9, needs_changes=1" },
  { id: 47, timestamp: "2024-01-15 10:04:33.012", level: "INFO", stage: 10, stageName: "authoring", iteration: 3, module: "test_case_authoring_agent", message: "Review iteration 3: regenerating 1 case" },
  { id: 48, timestamp: "2024-01-15 10:04:35.345", level: "WARNING", stage: 10, stageName: "review", iteration: 3, module: "doqa_review_agent", message: "Case TC-008: score=88.5 after 3 iterations. Status: needs-changes (requires manual review)" },
  { id: 49, timestamp: "2024-01-15 10:04:35.678", level: "INFO", stage: 10, stageName: "authoring", iteration: 3, module: "stage_gate", message: "Stage 10 completed: ready=9, needs_changes=1" },
  { id: 50, timestamp: "2024-01-15 10:05:00.901", level: "INFO", stage: 10, stageName: "authoring", iteration: 3, module: "human_review", message: "Human decision: approve (accepted TC-008 with manual changes)" },
  { id: 51, timestamp: "2024-01-15 10:05:01.234", level: "INFO", stage: 11, stageName: "structure", iteration: 1, module: "stage_gate", message: "Stage 11 started: doqa_structure" },
  { id: 52, timestamp: "2024-01-15 10:05:04.567", level: "INFO", stage: 11, stageName: "structure", iteration: 1, module: "doqa_structure_agent", message: "StructureChangeProposal: 3 changes (create_folder=1, move_case=1, update_tags=1)" },
  { id: 53, timestamp: "2024-01-15 10:05:30.890", level: "INFO", stage: 11, stageName: "structure", iteration: 1, module: "human_review", message: "Human decision: approve" },
  { id: 54, timestamp: "2024-01-15 10:05:31.123", level: "INFO", stage: 12, stageName: "import", iteration: 1, module: "stage_gate", message: "Stage 12 started: doqa_import" },
  { id: 55, timestamp: "2024-01-15 10:05:31.456", level: "INFO", stage: 12, stageName: "import", iteration: 1, module: "doqa_import_service", message: "Import mode: file (selected by human)" },
  { id: 56, timestamp: "2024-01-15 10:05:31.789", level: "WARNING", stage: 12, stageName: "import", iteration: 1, module: "doqa_api_adapter", message: "DoQA API contract contains TBD values. Running in dry-run mode." },
  { id: 57, timestamp: "2024-01-15 10:05:32.012", level: "INFO", stage: 12, stageName: "import", iteration: 1, module: "doqa_import_service", message: "Export file generated: workspace/import_2024-01-15.json" },
  { id: 58, timestamp: "2024-01-15 10:05:32.345", level: "INFO", stage: 12, stageName: "import", iteration: 1, module: "doqa_import_service", message: "DoQAImportResult: created=4, updated=6, archived=1, errors=0" },
  { id: 59, timestamp: "2024-01-15 10:05:50.678", level: "INFO", stage: 12, stageName: "import", iteration: 1, module: "human_review", message: "Human decision: approve import" },
  { id: 60, timestamp: "2024-01-15 10:05:50.901", level: "INFO", stage: null, stageName: null, iteration: null, module: "main", message: "Pipeline completed successfully. Total time: 5m 49s" },
];

const levelConfig: Record<LogLevel, { color: string; bg: string; icon: string }> = {
  DEBUG: { color: "text-gray-500", bg: "bg-gray-800/50", icon: "fa-solid fa-bug" },
  INFO: { color: "text-blue-400", bg: "bg-blue-500/10", icon: "fa-solid fa-info-circle" },
  WARNING: { color: "text-amber-400", bg: "bg-amber-500/10", icon: "fa-solid fa-triangle-exclamation" },
  ERROR: { color: "text-red-400", bg: "bg-red-500/10", icon: "fa-solid fa-circle-xmark" },
};

export default function LogViewer() {
  const [levelFilter, setLevelFilter] = useState<Set<LogLevel>>(new Set(["DEBUG", "INFO", "WARNING", "ERROR"]));
  const [stageFilter, setStageFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = useMemo(() => {
    return logData.filter((log) => {
      if (!levelFilter.has(log.level)) return false;
      if (stageFilter !== null && log.stage !== stageFilter) return false;
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && !log.module.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [levelFilter, stageFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: logData.length,
    debug: logData.filter((l) => l.level === "DEBUG").length,
    info: logData.filter((l) => l.level === "INFO").length,
    warning: logData.filter((l) => l.level === "WARNING").length,
    error: logData.filter((l) => l.level === "ERROR").length,
  }), []);

  const toggleLevel = (level: LogLevel) => {
    setLevelFilter((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Лог-просмотрщик
          </span>
        </h1>
        <p className="text-gray-400">
          Демо просмотра логов системы. Запрещено логировать секреты, ключи и токены.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Всего" value={stats.total} color="gray" />
        <StatCard label="DEBUG" value={stats.debug} color="gray" />
        <StatCard label="INFO" value={stats.info} color="blue" />
        <StatCard label="WARNING" value={stats.warning} color="amber" />
        <StatCard label="ERROR" value={stats.error} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Level filters */}
          {(["DEBUG", "INFO", "WARNING", "ERROR"] as LogLevel[]).map((level) => {
            const cfg = levelConfig[level];
            const active = levelFilter.has(level);
            return (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  active
                    ? `${cfg.bg} ${cfg.color} border border-current/20`
                    : "bg-gray-800 text-gray-600 border border-gray-700 opacity-50"
                }`}
              >
                <i className={`${cfg.icon} text-[10px]`} />
                {level}
              </button>
            );
          })}

          <div className="h-6 w-px bg-gray-800" />

          {/* Stage filter */}
          <select
            value={stageFilter ?? ""}
            onChange={(e) => setStageFilter(e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Все этапы</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Этап {i + 1}</option>
            ))}
          </select>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            <input
              type="text"
              placeholder="Поиск по логам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              autoScroll ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gray-800 text-gray-500 border border-gray-700"
            }`}
          >
            <i className="fa-solid fa-arrow-down mr-1" />
            Auto-scroll
          </button>
        </div>
        <div className="text-[10px] text-gray-500">
          Показано {filteredLogs.length} из {logData.length} записей
        </div>
      </div>

      {/* Log entries */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => {
            const cfg = levelConfig[log.level];
            const isExpanded = expandedLog === log.id;

            return (
              <div
                key={log.id}
                className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${cfg.bg}`}
              >
                <button
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  className="w-full text-left px-4 py-2 flex items-center gap-3"
                >
                  <span className="text-[10px] text-gray-600 font-mono w-20 flex-shrink-0">
                    {log.timestamp.split(" ")[1]}
                  </span>
                  <span className={`w-4 text-center ${cfg.color}`}>
                    <i className={`${cfg.icon} text-[10px]`} />
                  </span>
                  <span className={`text-[10px] font-mono w-14 flex-shrink-0 ${cfg.color}`}>
                    {log.level}
                  </span>
                  {log.stage && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono flex-shrink-0">
                      S{log.stage}
                    </span>
                  )}
                  <span className="text-[10px] text-cyan-400/60 font-mono w-28 flex-shrink-0 truncate">
                    [{log.module}]
                  </span>
                  <span className="text-xs text-gray-300 truncate flex-1">
                    {log.message}
                  </span>
                  <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} text-gray-600 text-[10px] flex-shrink-0`} />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 ml-[152px] space-y-1 text-[11px]">
                    <div className="text-gray-500">
                      <span className="text-gray-600">Timestamp:</span> {log.timestamp}
                    </div>
                    <div className="text-gray-500">
                      <span className="text-gray-600">Module:</span> <span className="text-cyan-400/60">{log.module}</span>
                    </div>
                    {log.stage && (
                      <div className="text-gray-500">
                        <span className="text-gray-600">Stage:</span> {log.stage} ({log.stageName}) · iteration {log.iteration}
                      </div>
                    )}
                    <div className="text-gray-400">
                      <span className="text-gray-600">Message:</span> {log.message}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security note */}
      <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-4">
        <div className="flex items-center gap-2 text-sm text-red-400 mb-2">
          <i className="fa-solid fa-shield-halved" />
          <span className="font-semibold">Безопасность логов</span>
        </div>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• API-ключи, пароли, токены — <span className="text-red-400">запрещены</span></li>
          <li>• Реальные учётные данные — <span className="text-red-400">запрещены</span></li>
          <li>• Чувствительные секреты — <span className="text-red-400">запрещены</span></li>
          <li>• Запросы/ответы LLM логируются только в DEBUG-режиме</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    gray: "border-gray-700 text-gray-300",
    blue: "border-blue-500/20 text-blue-400",
    amber: "border-amber-500/20 text-amber-400",
    red: "border-red-500/20 text-red-400",
  };
  return (
    <div className={`bg-gray-900 rounded-lg p-3 border ${colorMap[color]}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
