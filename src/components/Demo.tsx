import { useState } from "react";

interface DemoStep {
  id: number;
  title: string;
  status: "pending" | "running" | "waiting" | "approved" | "rejected";
  result?: string;
  rationale?: string;
}

const initialSteps: DemoStep[] = [
  { id: 1, title: "Получение требований", status: "pending" },
  { id: 2, title: "Формирование дельты", status: "pending" },
  { id: 3, title: "Подтверждение дельты", status: "pending" },
  { id: 4, title: "Анализ требований", status: "pending" },
  { id: 5, title: "Mind-map доработки", status: "pending" },
  { id: 6, title: "Чек-лист проверок", status: "pending" },
  { id: 7, title: "Сбор контекста", status: "pending" },
  { id: 8, title: "Влияние изменений", status: "pending" },
  { id: 9, title: "Списки кейсов", status: "pending" },
  { id: 10, title: "Генерация + ревью", status: "pending" },
  { id: 11, title: "Корректировка структуры", status: "pending" },
  { id: 12, title: "Экспорт в DoQA", status: "pending" },
];

const stepResults: Record<number, { result: string; rationale: string }> = {
  1: {
    result: "Получены 2 версии требований:\n• Новая: requirements_v2.md (12 разделов, 47 пунктов)\n• Старая: requirements_v1.md (10 разделов, 39 пунктов)\n\nИсточник: папка ./requirements/",
    rationale: "Источники: folder_input_adapter, markdown_parser. Файлы просканированы рекурсивно. Найдено 2 файла .md.",
  },
  2: {
    result: "Сформирована дельта из 15 элементов:\n• added: 4 (новые требования к фильтрации)\n• changed: 6 (изменены бизнес-правила)\n• removed: 1 (удалён устаревший раздел)\n• unchanged: 3\n• renamed: 1\n\nСмысловых изменений: 10\nТолько форматирование: 1",
    rationale: "Источники: LLM (qwen3.8, t=0.2), requirement_diff_agent. Использовано смысловое сравнение с учётом переформулировок.",
  },
  3: {
    result: "✅ Дельта подтверждена человеком\n\nДействия человека:\n• Объединены delta-003 и delta-007 (одна смысловая правка)\n• delta-012 помечен как критичный\n• Добавлен комментарий: «Уточнить граничные значения для фильтра»",
    rationale: "Решение: approve. Итерация: 1. Комментариев: 1.",
  },
  4: {
    result: "Отчёт об анализе требований:\n• Тестируемость: 0.82\n• Проблем: 3 (не указаны граничные условия для 2 полей)\n• Вопросов: 5\n• Рисков: 2 (влияние на модуль оплаты)\n• Отсутствующих сценариев: 4",
    rationale: "Источники: LLM (qwen3.8, t=0.2), requirement_analysis_agent. Проверены: полнота, однозначность, тестируемость, критерии приёмки.",
  },
  5: {
    result: "Mind-map сформирован:\n• Корневой узел: «Доработка модуля фильтрации v2»\n• 5 ветвей: UI, API, Бизнес-логика, Интеграции, Данные\n• 23 узла\n• Привязка к delta_id: 10 из 23\n\nФорматы: Markdown ✓, Mermaid ✓, JSON ✓",
    rationale: "Источники: MindMap agent (t=0.3), AnalysisReport, RequirementDelta. Структура отражает затронутые модули.",
  },
  6: {
    result: "Чек-лист из 34 проверок:\n• Позитивные: 12\n• Негативные: 8\n• Граничные: 6\n• Регрессионные: 4\n• Права доступа: 2\n• Интеграции: 2",
    rationale: "Источники: Checklist agent (t=0.2), MindMap, RequirementDelta, AnalysisReport. Каждая проверка привязана к delta_id.",
  },
  7: {
    result: "Контекст собран:\n• DoQA: 156 существующих кейсов, 12 связанных с модулем фильтрации\n• Кодовая база: ⚠️ внешний агент недоступен (режим: external_agent)\n• Отмечено: 8 файлов в zones регрессии",
    rationale: "Источники: doqa_context_agent (dry-run), codebase_context_agent (частично). Кодовая база: данные недоступны.",
  },
  8: {
    result: "Влияние определено:\n• create: 4 новых кейса\n• update: 6 кейсов требуют актуализации\n• archive: 1 кейс (удалённое требование)\n• skip: 3 (без изменений)\n• manual_review: 1 (неясное влияние)",
    rationale: "Источники: Impact analysis agent (t=0.15), DeltaImpact, DoQA context, Codebase context (частично).",
  },
  9: {
    result: "Списки сформированы:\n• Новые: 4 кейса (приоритет: 2 high, 2 medium)\n• Актуализируемые: 6 кейсов\n• Устаревшие: 1 кейс → Архив\n• Без изменений: 3 кейса\n• Дубликаты: 0",
    rationale: "Источники: DeltaImpact, Checklist, DoQA context. Трассировка: delta_id → case для каждого элемента.",
  },
  10: {
    result: "Сгенерировано 10 тест-кейсов (4 новых + 6 актуализированных):\n• ready-for-review: 8 (оценка ≥ 90)\n• needs-changes: 2 (после 3 итераций)\n\nСредняя оценка: 92.3\nЦикл ревью: 2.1 итерации в среднем",
    rationale: "Источники: Authoring agent (t=0.1), Review agent (t=0.0), rules/doqa_rules.md v1.10.0. Правила: DoQA review rules v1.10.0.",
  },
  11: {
    result: "Предложения по структуре:\n• Создать папку: «Фильтрация v2» (3 кейса)\n• Переместить: 2 кейса в новую папку\n• Обновить теги: 6 кейсов\n\nВсего: 3 изменения структуры",
    rationale: "Источники: Structure agent (t=0.2), обновлённый MindMap, структура DoQA. Изменения требуют подтверждения.",
  },
  12: {
    result: "Режим: файл (выбран человеком)\n\nРезультат экспорта:\n• Создано: 4 кейса → статус «Ревью»\n• Обновлено: 6 кейсов → статус «Ревью»\n• Архивировано: 1 кейс → статус «Архив»\n• Файл: workspace/import_2024-01-15.json\n\n✅ Импорт подтверждён человеком",
    rationale: "Режим: file. DoQA API контракт: TBD (dry-run). Файл сгенерирован во внутреннем JSON-формате.",
  },
};

const statusConfig = {
  pending: { label: "Ожидание", color: "text-gray-500", bg: "bg-gray-800", icon: "fa-regular fa-circle" },
  running: { label: "Выполняется", color: "text-blue-400", bg: "bg-blue-500/10", icon: "fa-solid fa-spinner fa-spin" },
  waiting: { label: "Ожидает человека", color: "text-amber-400", bg: "bg-amber-500/10", icon: "fa-solid fa-user-clock" },
  approved: { label: "Подтверждено", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "fa-solid fa-circle-check" },
  rejected: { label: "Отклонено", color: "text-red-400", bg: "bg-red-500/10", icon: "fa-solid fa-circle-xmark" },
};

export default function Demo() {
  const [steps, setSteps] = useState<DemoStep[]>(initialSteps);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const runNextStep = async () => {
    const nextIdx = steps.findIndex((s) => s.status === "pending");
    if (nextIdx === -1) return;

    setIsRunning(true);

    // Running
    setSteps((prev) =>
      prev.map((s, i) => (i === nextIdx ? { ...s, status: "running" as const } : s))
    );
    await delay(800);

    // Waiting for human
    setSteps((prev) =>
      prev.map((s, i) => (i === nextIdx ? { ...s, status: "waiting" as const } : s))
    );
    setIsRunning(false);
    setSelectedStep(nextIdx + 1);
  };

  const approveStep = () => {
    if (selectedStep === null) return;
    const idx = selectedStep - 1;
    const data = stepResults[selectedStep];

    setSteps((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, status: "approved" as const, result: data.result, rationale: data.rationale }
          : s
      )
    );
    setSelectedStep(null);
  };

  const rejectStep = () => {
    if (selectedStep === null) return;
    const idx = selectedStep - 1;
    setSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, status: "rejected" as const } : s))
    );
    setSelectedStep(null);
  };

  const resetDemo = () => {
    setSteps(initialSteps);
    setSelectedStep(null);
    setIsRunning(false);
  };

  const allDone = steps.every((s) => s.status === "approved");
  const currentWaiting = steps.find((s) => s.status === "waiting");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Демо пайплайна
          </span>
        </h1>
        <p className="text-gray-400">
          Интерактивная демонстрация работы системы. Запускайте этапы по одному, подтверждайте или отклоняйте.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={runNextStep}
          disabled={isRunning || allDone || !!currentWaiting}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-play text-xs" />
          Запустить этап
        </button>
        {currentWaiting && (
          <>
            <button
              onClick={approveStep}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-check text-xs" />
              Подтвердить
            </button>
            <button
              onClick={rejectStep}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-xmark text-xs" />
              Отклонить
            </button>
          </>
        )}
        <button
          onClick={resetDemo}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-all flex items-center gap-2 ml-auto"
        >
          <i className="fa-solid fa-rotate-left text-xs" />
          Сброс
        </button>
      </div>

      {/* Progress */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Прогресс</span>
          <span className="text-xs text-gray-400">
            {steps.filter((s) => s.status === "approved").length} / {steps.length}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${(steps.filter((s) => s.status === "approved").length / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const cfg = statusConfig[step.status];
          const isSelected = selectedStep === step.id;
          const data = stepResults[step.id];

          return (
            <div key={step.id}>
              <button
                onClick={() => step.result && setSelectedStep(step.id)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-gray-800/80 border-emerald-500/30"
                    : step.status === "waiting"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-gray-900 border-gray-800 hover:border-gray-700"
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cfg.bg} ${cfg.color}`}>
                  <i className={`${cfg.icon}`} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-600">#{step.id}</span>
                    <span className="text-sm font-medium text-white">{step.title}</span>
                  </div>
                  <span className={`text-[10px] ${cfg.color}`}>{cfg.label}</span>
                </div>
                {step.result && (
                  <i className="fa-solid fa-chevron-right text-gray-600 text-xs" />
                )}
              </button>

              {/* Result panel */}
              {isSelected && data && (
                <div className="mt-2 ml-12 bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-[10px]" /> Результат
                    </h4>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {data.result}
                    </pre>
                  </div>
                  <div className="border-t border-gray-700/50 pt-3">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                      <i className="fa-solid fa-lightbulb text-[10px]" /> Rationale
                    </h4>
                    <p className="text-xs text-gray-400">{data.rationale}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-6 text-center">
          <i className="fa-solid fa-party-horn text-3xl text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Пайплайн завершён!</h3>
          <p className="text-sm text-gray-400">
            Все 12 этапов пройдены. Тест-кейсы экспортированы в DoQA.
          </p>
        </div>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
