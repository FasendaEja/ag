import { useState } from "react";

interface StageMetric {
  stage: number;
  name: string;
  duration: number; // seconds
  iterations: number;
  llmCalls: number;
  llmTokens: number;
  status: "completed" | "partial" | "failed";
}

interface QualityMetric {
  totalCases: number;
  readyForReview: number;
  needsChanges: number;
  avgScore: number;
  avgRating: number;
  avgIterations: number;
}

const stageMetrics: StageMetric[] = [
  { stage: 1, name: "Получение требований", duration: 3, iterations: 1, llmCalls: 0, llmTokens: 0, status: "completed" },
  { stage: 2, name: "Формирование дельты", duration: 8, iterations: 1, llmCalls: 1, llmTokens: 4523, status: "completed" },
  { stage: 3, name: "Подтверждение дельты", duration: 75, iterations: 1, llmCalls: 0, llmTokens: 0, status: "completed" },
  { stage: 4, name: "Анализ требований", duration: 4, iterations: 1, llmCalls: 1, llmTokens: 3890, status: "completed" },
  { stage: 5, name: "Mind-map доработки", duration: 3, iterations: 1, llmCalls: 1, llmTokens: 2156, status: "completed" },
  { stage: 6, name: "Чек-лист проверок", duration: 3, iterations: 1, llmCalls: 1, llmTokens: 3245, status: "completed" },
  { stage: 7, name: "Сбор контекста", duration: 1, iterations: 1, llmCalls: 0, llmTokens: 0, status: "partial" },
  { stage: 8, name: "Влияние изменений", duration: 3, iterations: 1, llmCalls: 1, llmTokens: 2890, status: "completed" },
  { stage: 9, name: "Списки кейсов", duration: 0, iterations: 1, llmCalls: 0, llmTokens: 0, status: "completed" },
  { stage: 10, name: "Генерация + ревью", duration: 11, iterations: 3, llmCalls: 7, llmTokens: 18456, status: "completed" },
  { stage: 11, name: "Корректировка структуры", duration: 3, iterations: 1, llmCalls: 1, llmTokens: 1567, status: "completed" },
  { stage: 12, name: "Экспорт в DoQA", duration: 1, iterations: 1, llmCalls: 0, llmTokens: 0, status: "completed" },
];

const qualityMetrics: QualityMetric = {
  totalCases: 10,
  readyForReview: 9,
  needsChanges: 1,
  avgScore: 92.3,
  avgRating: 4.7,
  avgIterations: 2.1,
};

const timelineData = [
  { time: "10:00:01", event: "Система запущена", type: "start" },
  { time: "10:00:02", event: "Этап 1: Получение требований", type: "stage" },
  { time: "10:00:05", event: "Этап 1 завершён", type: "complete" },
  { time: "10:01:15", event: "Подтверждение человека", type: "human" },
  { time: "10:01:15", event: "Этап 2: Формирование дельты", type: "stage" },
  { time: "10:01:23", event: "Этап 2 завершён", type: "complete" },
  { time: "10:02:30", event: "Подтверждение с комментариями", type: "human" },
  { time: "10:02:31", event: "Этап 4: Анализ требований", type: "stage" },
  { time: "10:02:35", event: "Этап 4 завершён", type: "complete" },
  { time: "10:03:10", event: "Подтверждение человека", type: "human" },
  { time: "10:03:11", event: "Этап 5: Mind-map", type: "stage" },
  { time: "10:03:14", event: "Этап 5 завершён", type: "complete" },
  { time: "10:03:45", event: "Подтверждение человека", type: "human" },
  { time: "10:03:45", event: "Этап 6: Чек-лист", type: "stage" },
  { time: "10:03:49", event: "Этап 6 завершён", type: "complete" },
  { time: "10:03:49", event: "Этап 7: Сбор контекста (частично)", type: "warning" },
  { time: "10:03:50", event: "Codebase agent недоступен", type: "warning" },
  { time: "10:04:20", event: "Подтверждение человека", type: "human" },
  { time: "10:04:20", event: "Этап 8: Влияние изменений", type: "stage" },
  { time: "10:04:24", event: "Этап 8-9 завершены", type: "complete" },
  { time: "10:04:24", event: "Этап 10: Генерация + ревью", type: "stage" },
  { time: "10:04:28", event: "Ревью итерация 1: avg=87.5", type: "review" },
  { time: "10:04:29", event: "Ревью итерация 2: avg=93.1", type: "review" },
  { time: "10:04:35", event: "Ревью итерация 3: avg=92.3", type: "review" },
  { time: "10:04:35", event: "Этап 10 завершён", type: "complete" },
  { time: "10:05:00", event: "Подтверждение человека", type: "human" },
  { time: "10:05:01", event: "Этап 11: Структура", type: "stage" },
  { time: "10:05:04", event: "Этап 11 завершён", type: "complete" },
  { time: "10:05:30", event: "Подтверждение человека", type: "human" },
  { time: "10:05:31", event: "Этап 12: Экспорт (dry-run)", type: "stage" },
  { time: "10:05:32", event: "Этап 12 завершён", type: "complete" },
  { time: "10:05:50", event: "Импорт подтверждён", type: "human" },
  { time: "10:05:50", event: "Пайплайн завершён", type: "finish" },
];

export default function Metrics() {
  const [activeTab, setActiveTab] = useState<"overview" | "stages" | "quality" | "timeline">("overview");

  const totalDuration = stageMetrics.reduce((sum, s) => sum + s.duration, 0);
  const totalLLMCalls = stageMetrics.reduce((sum, s) => sum + s.llmCalls, 0);
  const totalTokens = stageMetrics.reduce((sum, s) => sum + s.llmTokens, 0);
  const humanWaitTime = stageMetrics[2].duration + stageMetrics[3].duration + stageMetrics[4].duration + stageMetrics[6].duration + stageMetrics[9].duration + stageMetrics[10].duration;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Мониторинг и метрики
          </span>
        </h1>
        <p className="text-gray-400">
          Дашборд с метриками работы системы: время, LLM-вызовы, качество тест-кейсов, таймлайн.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {[
          { id: "overview" as const, label: "Обзор", icon: "fa-solid fa-chart-line" },
          { id: "stages" as const, label: "По этапам", icon: "fa-solid fa-list-ol" },
          { id: "quality" as const, label: "Качество", icon: "fa-solid fa-star" },
          { id: "timeline" as const, label: "Таймлайн", icon: "fa-solid fa-clock" },
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

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Общее время"
              value="5м 49с"
              subtitle="349 секунд"
              icon="fa-solid fa-clock"
              color="emerald"
            />
            <MetricCard
              title="LLM-вызовы"
              value={String(totalLLMCalls)}
              subtitle={`${totalTokens.toLocaleString()} токенов`}
              icon="fa-solid fa-brain"
              color="violet"
            />
            <MetricCard
              title="Тест-кейсы"
              value={String(qualityMetrics.totalCases)}
              subtitle={`${qualityMetrics.readyForReview} готово, ${qualityMetrics.needsChanges} доработка`}
              icon="fa-solid fa-list-check"
              color="cyan"
            />
            <MetricCard
              title="Средняя оценка"
              value={qualityMetrics.avgScore.toFixed(1)}
              subtitle={`Рейтинг: ${qualityMetrics.avgRating} ★`}
              icon="fa-solid fa-star"
              color="amber"
            />
          </div>

          {/* Time breakdown */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-cyan-400" />
              Распределение времени
            </h3>
            <div className="space-y-3">
              <TimeBar label="LLM-обработка" value={totalDuration - humanWaitTime} total={totalDuration} color="emerald" />
              <TimeBar label="Ожидание человека" value={humanWaitTime} total={totalDuration} color="amber" />
              <TimeBar label="Системные операции" value={5} total={totalDuration} color="cyan" />
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Время человека: {((humanWaitTime / totalDuration) * 100).toFixed(1)}% от общего времени
            </div>
          </div>

          {/* Stage performance */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-400" />
              Производительность по этапам
            </h3>
            <div className="space-y-2">
              {stageMetrics.map((s) => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-6 text-right font-mono">S{s.stage}</span>
                  <span className="text-xs text-gray-400 w-40 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.status === "completed" ? "bg-emerald-500" :
                        s.status === "partial" ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min((s.duration / 80) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right font-mono">{s.duration}с</span>
                  {s.llmCalls > 0 && (
                    <span className="text-[10px] text-violet-400 w-16 text-right font-mono">
                      {s.llmCalls} calls
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "stages" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Этап</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Название</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Время</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Итерации</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">LLM</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Токены</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {stageMetrics.map((s) => (
                <tr key={s.stage} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2.5 px-4 font-mono text-gray-500">S{s.stage}</td>
                  <td className="py-2.5 px-4 text-gray-300">{s.name}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-gray-400">{s.duration}с</td>
                  <td className="py-2.5 px-4 text-center font-mono text-gray-400">{s.iterations}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-violet-400">{s.llmCalls || "—"}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-gray-400">
                    {s.llmTokens > 0 ? s.llmTokens.toLocaleString() : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      s.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                      s.status === "partial" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-800/30 font-semibold">
                <td className="py-2.5 px-4 text-gray-400" colSpan={2}>Итого</td>
                <td className="py-2.5 px-4 text-center font-mono text-white">{totalDuration}с</td>
                <td className="py-2.5 px-4 text-center font-mono text-white">
                  {stageMetrics.reduce((sum, s) => sum + s.iterations, 0)}
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-violet-400">{totalLLMCalls}</td>
                <td className="py-2.5 px-4 text-center font-mono text-white">{totalTokens.toLocaleString()}</td>
                <td className="py-2.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {activeTab === "quality" && (
        <div className="space-y-6">
          {/* Quality overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{qualityMetrics.avgScore.toFixed(1)}</div>
              <p className="text-sm text-gray-400">Средняя оценка</p>
              <p className="text-xs text-gray-500 mt-1">Порог ready-for-review: 90</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">{qualityMetrics.avgRating} ★</div>
              <p className="text-sm text-gray-400">Средний рейтинг</p>
              <p className="text-xs text-gray-500 mt-1">Максимум: 5 ★</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">{qualityMetrics.avgIterations}</div>
              <p className="text-sm text-gray-400">Среднее число итераций</p>
              <p className="text-xs text-gray-500 mt-1">Максимум: 3</p>
            </div>
          </div>

          {/* Case status */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-chart-bar text-violet-400" />
              Статусы тест-кейсов
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-400">Ready for review</span>
                  <span className="text-xs text-white font-bold ml-auto">{qualityMetrics.readyForReview}</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    style={{ width: `${(qualityMetrics.readyForReview / qualityMetrics.totalCases) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-gray-400">Needs changes</span>
                  <span className="text-xs text-white font-bold ml-auto">{qualityMetrics.needsChanges}</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: `${(qualityMetrics.needsChanges / qualityMetrics.totalCases) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Score distribution */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-chart-column text-emerald-400" />
              Распределение оценок
            </h3>
            <div className="space-y-2">
              {[
                { range: "95-100", count: 3, rating: 5 },
                { range: "90-94", count: 4, rating: 5 },
                { range: "85-89", count: 1, rating: 4 },
                { range: "80-84", count: 1, rating: 4 },
                { range: "75-79", count: 0, rating: 4 },
                { range: "<75", count: 1, rating: 3 },
              ].map((bucket) => (
                <div key={bucket.range} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 font-mono">{bucket.range}</span>
                  <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded"
                      style={{ width: `${(bucket.count / 5) * 100}%` }}
                    />
                    {bucket.count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                        {bucket.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-amber-400 w-8">★{bucket.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <i className="fa-solid fa-timeline text-cyan-400" />
            Таймлайн выполнения
          </h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {timelineData.map((item, i) => {
              const typeConfig = {
                start: { color: "text-emerald-400", icon: "fa-solid fa-play" },
                stage: { color: "text-blue-400", icon: "fa-solid fa-circle-dot" },
                complete: { color: "text-emerald-400", icon: "fa-solid fa-circle-check" },
                human: { color: "text-amber-400", icon: "fa-solid fa-user-check" },
                review: { color: "text-violet-400", icon: "fa-solid fa-magnifying-glass" },
                warning: { color: "text-amber-400", icon: "fa-solid fa-triangle-exclamation" },
                finish: { color: "text-emerald-400", icon: "fa-solid fa-flag-checkered" },
              };
              const cfg = typeConfig[item.type as keyof typeof typeConfig];
              return (
                <div key={i} className="flex items-center gap-3 py-1.5 hover:bg-gray-800/30 rounded px-2">
                  <span className="text-[10px] text-gray-600 font-mono w-16">{item.time}</span>
                  <i className={`${cfg.icon} ${cfg.color} text-[10px] w-4 text-center`} />
                  <span className={`text-xs ${cfg.color}`}>{item.event}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, color }: {
  title: string; value: string; subtitle: string; icon: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/10 border-emerald-500/20 text-emerald-400",
    violet: "from-violet-500/10 border-violet-500/20 text-violet-400",
    cyan: "from-cyan-500/10 border-cyan-500/20 text-cyan-400",
    amber: "from-amber-500/10 border-amber-500/20 text-amber-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} to-transparent border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} ${colorMap[color].split(" ").pop()}`} />
        <span className="text-xs text-gray-400">{title}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function TimeBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
  };
  const percentage = (value / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-40">{label}</span>
      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color]} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-16 text-right font-mono">{value}с ({percentage.toFixed(1)}%)</span>
    </div>
  );
}
