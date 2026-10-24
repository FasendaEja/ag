import { useState } from "react";

interface CodeExample {
  id: string;
  title: string;
  file: string;
  language: string;
  description: string;
  code: string;
}

const codeExamples: CodeExample[] = [
  {
    id: "graph_state",
    title: "LangGraph State",
    file: "graph/state.py",
    language: "python",
    description: "Состояние графа, передаваемое между узлами",
    code: `from typing import Any
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph

class PipelineState(BaseModel):
    """Состояние пайплайна, передаваемое между узлами."""
    
    # Входные данные
    new_requirements: RequirementVersion | None = None
    old_requirements: RequirementVersion | None = None
    
    # Артефакты этапов
    delta: RequirementDelta | None = None
    analysis_report: AnalysisReport | None = None
    mindmap: MindMap | None = None
    checklist: Checklist | None = None
    doqa_context: list[DoQATestCase] = Field(default_factory=list)
    codebase_context: CodebaseContext | None = None
    impact: DeltaImpact | None = None
    
    # Результаты
    test_cases: list[DoQATestCase] = Field(default_factory=list)
    reviews: list[DoQAReview] = Field(default_factory=list)
    structure_proposals: list[StructureChangeProposal] = Field(default_factory=list)
    import_result: DoQAImportResult | None = None
    
    # Управление
    stage_states: dict[int, StageState] = Field(default_factory=dict)
    human_comments: dict[int, list[str]] = Field(default_factory=dict)
    current_stage: int = 1
    iteration: int = 1`,
  },
  {
    id: "pipeline",
    title: "Пайплайн LangGraph",
    file: "graph/pipeline.py",
    language: "python",
    description: "Сборка графа с узлами и human gates",
    code: `from langgraph.graph import StateGraph, START, END
from .nodes import (
    intake_node, diff_node, analysis_node,
    mindmap_node, checklist_node, context_node,
    impact_node, authoring_node, review_node,
    structure_node, import_node,
)
from .edges import should_continue, should_rerun_review

def build_pipeline() -> StateGraph:
    """Сборка пайплайна обработки требований."""
    
    graph = StateGraph(PipelineState)
    
    # Добавляем узлы
    graph.add_node("intake", intake_node)
    graph.add_node("diff", diff_node)
    graph.add_node("human_gate_delta", human_gate_node)
    graph.add_node("analysis", analysis_node)
    graph.add_node("mindmap", mindmap_node)
    graph.add_node("checklist", checklist_node)
    graph.add_node("context", context_node)
    graph.add_node("impact", impact_node)
    graph.add_node("authoring", authoring_node)
    graph.add_node("review", review_node)
    graph.add_node("structure", structure_node)
    graph.add_node("import", import_node)
    
    # Линейные переходы
    graph.add_edge(START, "intake")
    graph.add_edge("intake", "diff")
    graph.add_edge("diff", "human_gate_delta")
    graph.add_edge("human_gate_delta", "analysis")
    graph.add_edge("analysis", "mindmap")
    graph.add_edge("mindmap", "checklist")
    graph.add_edge("checklist", "context")
    graph.add_edge("context", "impact")
    graph.add_edge("impact", "authoring")
    
    # Цикл генерации и ревью
    graph.add_edge("authoring", "review")
    graph.add_conditional_edges(
        "review",
        should_rerun_review,
        {"rerun": "authoring", "done": "structure"},
    )
    
    graph.add_edge("structure", "import")
    graph.add_edge("import", END)
    
    return graph.compile()`,
  },
  {
    id: "review_score",
    title: "Расчёт оценки DoQA",
    file: "services/review_score_service.py",
    language: "python",
    description: "Алгоритм расчёта итоговой оценки тест-кейса",
    code: `from pydantic import BaseModel

class ReviewScoreService:
    """Расчёт оценки тест-кейса по правилам DoQA."""
    
    WEIGHTS = {
        "title": 0.10,
        "description": 0.15,
        "preconditions": 0.10,
        "configurations": 0.05,
        "test_data": 0.10,
        "steps": 0.25,
        "expected_results": 0.20,
        "coherence": 0.05,
    }
    
    SEVERITY_COEFF = {
        "error": 0.0,
        "no_issues": 1.0,
        "recommendation": 0.9,
        "warning": 0.6,
    }
    
    def calculate_score(self, area_findings: dict[str, list[Finding]]) -> float:
        """
        1. Для каждой области берём худшую серьёзность.
        2. Применяем коэффициент.
        3. Умножаем на вес области.
        4. Суммируем и масштабируем до 100.
        """
        total = 0.0
        
        for area, findings in area_findings.items():
            weight = self.WEIGHTS.get(area, 0.0)
            if not findings:
                worst = "no_issues"
            else:
                worst = min(
                    findings,
                    key=lambda f: self.SEVERITY_COEFF[f.severity]
                ).severity
            
            coeff = self.SEVERITY_COEFF[worst]
            total += weight * coeff
        
        return round(total * 100, 1)
    
    def get_rating(self, score: float) -> int:
        if score >= 90: return 5
        if score >= 75: return 4
        if score >= 60: return 3
        if score >= 40: return 2
        return 1
    
    def get_status(self, score: float, has_blocking: bool) -> str:
        if score >= 90 and not has_blocking:
            return "ready-for-review"
        return "needs-changes"`,
  },
  {
    id: "llm_client",
    title: "LLM-клиент",
    file: "llm/client.py",
    language: "python",
    description: "OpenAI-compatible клиент с JSON-валидацией",
    code: `import json
import logging
from openai import OpenAI
from pydantic import BaseModel, TypeAdapter

logger = logging.getLogger(__name__)

class LLMClient:
    """OpenAI-compatible клиент для работы с LLM."""
    
    def __init__(self, config: LLMConfig):
        self.client = OpenAI(
            api_key=config.api_key,
            base_url=config.base_url,
            timeout=config.timeout,
            max_retries=config.max_retries,
        )
        self.model = config.model
        self.default_temperature = config.temperature
    
    async def generate(
        self,
        prompt: str,
        response_schema: type[BaseModel],
        temperature: float | None = None,
        max_retries: int = 3,
    ) -> BaseModel:
        """
        Генерация с валидацией JSON через Pydantic.
        При ошибке — повтор с описанием ошибки.
        """
        temp = temperature or self.default_temperature
        
        for attempt in range(max_retries):
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temp,
                response_format={"type": "json_object"},
            )
            
            raw = response.choices[0].message.content
            
            try:
                data = json.loads(raw)
                return response_schema.model_validate(data)
            except (json.JSONDecodeError, ValidationError) as e:
                logger.warning(
                    "LLM response validation failed (attempt %d/%d): %s",
                    attempt + 1, max_retries, str(e)
                )
                prompt = f"{prompt}\\n\\nPrevious response was invalid: {e}\\nPlease fix and retry."
        
        raise LLMValidationError(
            f"Failed after {max_retries} attempts"
        )`,
  },
  {
    id: "stage_gate",
    title: "Human Stage Gate",
    file: "human/stage_gate.py",
    language: "python",
    description: "Gate между этапами — ожидание подтверждения человека",
    code: `import asyncio
from enum import Enum

class StageStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    WAITING_FOR_HUMAN = "waiting_for_human"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_RERUN = "needs_rerun"
    FAILED = "failed"
    SKIPPED = "skipped"

class StageGate:
    """
    Gate между этапами пайплайна.
    Останавливает выполнение и ждёт подтверждения человека.
    """
    
    def __init__(self, stage_id: int, store: HistoryStore):
        self.stage_id = stage_id
        self.store = store
        self._event = asyncio.Event()
        self._decision: HumanReview | None = None
    
    async def wait_for_human(self) -> HumanReview:
        """Блокируется до решения человека."""
        await self.store.update_status(
            self.stage_id, StageStatus.WAITING_FOR_HUMAN
        )
        await self._event.wait()
        assert self._decision is not None
        return self._decision
    
    def submit_decision(self, review: HumanReview) -> None:
        """Человек принял решение."""
        self._decision = review
        self._event.set()
    
    def reset(self) -> None:
        """Сброс для повторного запуска."""
        self._event.clear()
        self._decision = None`,
  },
  {
    id: "doqa_adapter",
    title: "DoQA API адаптер",
    file: "integrations/doqa/doqa_api_adapter.py",
    language: "python",
    description: "Адаптер для работы с DoQA API (mock/dry-run режим)",
    code: `import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DoQAAPIAdapter:
    """
    Адаптер DoQA API 4.3.1.
    
    Аутентификация: Bearer token
    Заголовок: Authorization: Bearer <token>
    Токен: из переменной окружения DOQA_API_TOKEN
    
    До получения документации работает в mock/dry-run режиме.
    Все эндпоинты помечены как TBD.
    """
    
    def __init__(self, config: DoQAConfig):
        self.config = config
        self.contract = self._load_contract()
        self._validate_contract()
        self.session = self._build_session()
    
    def _build_session(self) -> httpx.AsyncClient:
        """Создаёт HTTP-сессию с Bearer-аутентификацией."""
        return httpx.AsyncClient(
            base_url=self.config.base_url,
            headers={
                "Authorization": f"Bearer {self.config.api_token}",
                "Accept": "application/json",
            },
            timeout=self.config.timeout,
        )
    
    def _validate_contract(self) -> None:
        """Проверяет, что контракт заполнен."""
        if self.contract.has_tbd():
            logger.warning(
                "DoQA API contract contains TBD values. "
                "Running in dry-run mode."
            )
            self.dry_run = True
        else:
            self.dry_run = False
    
    async def get_test_case(self, case_id: str) -> DoQATestCase:
        if self.dry_run:
            logger.info("[DRY-RUN] GET test case %s", case_id)
            return self._mock_case(case_id)
        
        # TBD: реальный запрос к DoQA API
        raise NotImplementedError(
            "DoQA API contract not yet defined"
        )
    
    async def create_test_case(
        self, case: DoQATestCase
    ) -> str:
        if self.dry_run:
            logger.info(
                "[DRY-RUN] CREATE test case: %s", case.title
            )
            return f"mock-{uuid4().hex[:8]}"
        
        raise NotImplementedError(
            "DoQA API contract not yet defined"
        )
    
    async def archive_test_case(self, case_id: str) -> bool:
        if self.dry_run:
            logger.info("[DRY-RUN] ARCHIVE case %s", case_id)
            return True
        
        raise NotImplementedError(
            "DoQA API contract not yet defined"
        )`,
  },
  {
    id: "rules_loader",
    title: "Загрузчик правил",
    file: "services/rules_loader.py",
    language: "python",
    description: "Загрузка правил DoQA из внешнего файла",
    code: `import hashlib
from pathlib import Path

class RulesLoader:
    """
    Загрузка правил DoQA из внешнего файла.
    Поддерживает замену файла без изменения кода.
    """
    
    def __init__(self, rules_path: str | Path):
        self.rules_path = Path(rules_path)
        self._content: str | None = None
        self._hash: str | None = None
        self._version: str | None = None
    
    def load(self) -> str:
        """Загружает содержимое файла правил."""
        if not self.rules_path.exists():
            raise FileNotFoundError(
                f"Rules file not found: {self.rules_path}"
            )
        
        content = self.rules_path.read_text(encoding="utf-8")
        self._content = content
        self._hash = hashlib.sha256(
            content.encode()
        ).hexdigest()[:16]
        self._version = self._extract_version(content)
        
        logger.info(
            "Loaded rules: %s (version=%s, hash=%s)",
            self.rules_path, self._version, self._hash
        )
        return content
    
    def reload_if_changed(self) -> bool:
        """Перезагружает, если файл изменился."""
        current_hash = hashlib.sha256(
            self.rules_path.read_bytes()
        ).hexdigest()[:16]
        
        if current_hash != self._hash:
            self.load()
            return True
        return False
    
    @property
    def version(self) -> str:
        return self._version or "unknown"`,
  },
  {
    id: "parser_base",
    title: "Базовый парсер",
    file: "parsers/base.py",
    language: "python",
    description: "Общий интерфейс парсеров документов",
    code: `from abc import ABC, abstractmethod
from pathlib import Path

class BaseParser(ABC):
    """Базовый интерфейс для всех парсеров."""
    
    @abstractmethod
    def can_parse(self, file_path: Path) -> bool:
        """Проверяет, может ли парсер обработать файл."""
        ...
    
    @abstractmethod
    def parse(self, file_path: Path) -> ParsedDocument:
        """
        Парсит файл и возвращает структурированный документ.
        
        Raises:
            ParseError: если файл не может быть обработан.
        """
        ...
    
    @property
    @abstractmethod
    def supported_extensions(self) -> list[str]:
        """Список поддерживаемых расширений."""
        ...


class ParsedDocument(BaseModel):
    """Результат парсинга документа."""
    source: str
    filename: str
    content: str
    sections: list[DocumentSection]
    metadata: dict[str, Any]
    parser: str
    parsed_at: datetime


class ParserRegistry:
    """Реестр парсеров. Автоматически выбирает нужный."""
    
    def __init__(self):
        self._parsers: list[BaseParser] = []
    
    def register(self, parser: BaseParser) -> None:
        self._parsers.append(parser)
    
    def parse_file(self, path: Path) -> ParsedDocument:
        for parser in self._parsers:
            if parser.can_parse(path):
                return parser.parse(path)
        
        logger.warning("No parser for: %s", path)
        raise UnsupportedFormatError(path)`,
  },
];

export default function CodePreview() {
  const [activeExample, setActiveExample] = useState("graph_state");
  const current = codeExamples.find((e) => e.id === activeExample)!;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Примеры кода
          </span>
        </h1>
        <p className="text-gray-400">
          Ключевые модули системы на Python. Полный код генерируется поэтапно (шаги A–D).
        </p>
      </div>

      <div className="flex gap-6">
        {/* Examples list */}
        <div className="w-64 flex-shrink-0 space-y-1">
          {codeExamples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                activeExample === example.id
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <p className="text-xs font-semibold">{example.title}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{example.file}</p>
            </button>
          ))}
        </div>

        {/* Code view */}
        <div className="flex-1 space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <i className="fa-brands fa-python text-yellow-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{current.title}</h3>
                  <code className="text-[10px] text-gray-500 font-mono">{current.file}</code>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-mono">
                {current.language}
              </span>
            </div>
            <pre className="p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed max-h-[600px] overflow-y-auto">
              <code>{current.code}</code>
            </pre>
          </div>
          <p className="text-xs text-gray-400 bg-gray-900 rounded-lg p-3 border border-gray-800">
            <i className="fa-solid fa-info-circle text-cyan-400 mr-1" />
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
}
