export default function Overview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            QA Agent System
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Агентная система для подготовки, анализа и управления тест-кейсами
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="fa-solid fa-list-check" label="Этапов в пайплайне" value="12" color="emerald" />
        <MetricCard icon="fa-solid fa-users" label="Агентов в системе" value="11" color="cyan" />
        <MetricCard icon="fa-solid fa-database" label="Pydantic-схем" value="15" color="violet" />
        <MetricCard icon="fa-solid fa-file-code" label="Парсеров форматов" value="10" color="amber" />
      </div>

      {/* Main goal */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bullseye text-emerald-400" />
          Основная цель
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Автоматизация процесса тестирования и подготовки тест-кейсов: от получения требований
          до выгрузки результатов в DoQA с human-in-the-loop на каждом этапе.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Получение новой и старой версии требований",
            "Определение что добавлено, изменено, удалено",
            "Анализ требований на тестируемость",
            "Формирование mind-map и чек-листа",
            "Сбор контекста из DoQA и кодовой базы",
            "Определение влияния на тест-кейсы",
            "Генерация тест-кейсов по правилам DoQA",
            "Внутреннее ревью (цикл до 3 итераций)",
            "Корректировка структуры DoQA",
            "Экспорт/импорт в DoQA",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-emerald-400 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-cyan-400" />
          Технологический стек
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StackGroup title="Язык и типизация" items={["Python 3.11+", "Pydantic v2", "strict typing"]} icon="fa-brands fa-python" color="text-yellow-400" />
          <StackGroup title="Оркестрация" items={["LangGraph", "Human-in-the-loop", "Stage gates"]} icon="fa-solid fa-diagram-project" color="text-emerald-400" />
          <StackGroup title="LLM" items={["OpenAI-compatible API", "Модель: qwen3.8", "JSON + Pydantic валидация"]} icon="fa-solid fa-brain" color="text-violet-400" />
          <StackGroup title="Backend" items={["FastAPI", "SQLite", "Файловые артефакты"]} icon="fa-solid fa-server" color="text-cyan-400" />
          <StackGroup title="Интерфейсы" items={["Web UI (FastAPI)", "CLI (Typer)", "Единый review service"]} icon="fa-solid fa-desktop" color="text-pink-400" />
          <StackGroup title="Инфра" items={["Dockerfile", "docker-compose.yml", "pytest + pytest-asyncio"]} icon="fa-brands fa-docker" color="text-blue-400" />
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-plug text-violet-400" />
          Внешние системы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IntegrationCard
            name="DoQA"
            version="API 4.3.1"
            description="TMS для хранения и управления тест-кейсами"
            status="partial"
            items={[
              "✅ Bearer token аутентификация",
              "Импорт/экспорт кейсов (TBD)",
              "Управление статусами (TBD)",
              "Структура кейсов (TBD)",
            ]}
          />
          <IntegrationCard
            name="Redmine"
            version="REST API"
            description="Багтрекинг и управление задачами"
            status="partial"
            items={["Чтение задач по ID", "Комментарии", "Связи задач и багов"]}
          />
          <IntegrationCard
            name="Кодовая база"
            version="Adapter"
            description="Внешний агент для анализа кода"
            status="tbd"
            items={["none / local_folder", "git_repository", "external_agent"]}
          />
        </div>
      </section>

      {/* Key principles */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-amber-400" />
          Ключевые принципы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PrincipleCard
            title="Human-in-the-loop"
            description="После каждого этапа система останавливается и ждёт подтверждения человека. Автоматический переход запрещён."
            icon="fa-solid fa-user-check"
            color="emerald"
          />
          <PrincipleCard
            title="Объяснимость"
            description="Каждый этап возвращает rationale: источники, правила, допущения, риски, альтернативы."
            icon="fa-solid fa-lightbulb"
            color="amber"
          />
          <PrincipleCard
            title="Без выдумок"
            description="Запрещено выдумывать API, данные, кейсы, задачи, файлы, элементы интерфейса."
            icon="fa-solid fa-ban"
            color="red"
          />
          <PrincipleCard
            title="Трассируемость"
            description="delta_id → checklist_item → test_case → doqa_action. Полная прослеживаемость."
            icon="fa-solid fa-link"
            color="cyan"
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <i className={`${icon} text-2xl`} />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StackGroup({ title, items, icon, color }: { title: string; items: string[]; icon: string; color: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-3">
        <i className={`${icon} ${color}`} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntegrationCard({ name, version, description, status, items }: {
  name: string; version: string; description: string; status: "tbd" | "partial" | "ready"; items: string[];
}) {
  const statusConfig = {
    tbd: { label: "TBD", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    partial: { label: "Частично", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    ready: { label: "Готово", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  };
  const s = statusConfig[status];
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">{name}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
      </div>
      <p className="text-[11px] text-gray-500 mb-1">{version}</p>
      <p className="text-xs text-gray-400 mb-3">{description}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
            <i className="fa-solid fa-check text-[8px] text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrincipleCard({ title, description, icon, color }: { title: string; description: string; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    red: "border-red-500/20 bg-red-500/5",
    cyan: "border-cyan-500/20 bg-cyan-500/5",
  };
  const iconColor: Record<string, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    cyan: "text-cyan-400",
  };
  return (
    <div className={`rounded-lg p-4 border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} ${iconColor[color]}`} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
