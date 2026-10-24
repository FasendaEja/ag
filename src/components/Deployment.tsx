import { useState } from "react";

type DeployTarget = "dashboard-local" | "dashboard-docker" | "dashboard-hosting" | "python-local" | "python-docker" | "python-requirements";

const deployTargets: { id: DeployTarget; label: string; icon: string; group: string }[] = [
  { id: "dashboard-local", label: "Дашборд: локально", icon: "fa-solid fa-laptop-code", group: "Веб-дашборд" },
  { id: "dashboard-docker", label: "Дашборд: Docker", icon: "fa-brands fa-docker", group: "Веб-дашборд" },
  { id: "dashboard-hosting", label: "Дашборд: хостинг", icon: "fa-solid fa-cloud", group: "Веб-дашборд" },
  { id: "python-local", label: "Python: локально", icon: "fa-brands fa-python", group: "QA Agent System" },
  { id: "python-docker", label: "Python: Docker", icon: "fa-brands fa-docker", group: "QA Agent System" },
  { id: "python-requirements", label: "Настройка .env", icon: "fa-solid fa-key", group: "QA Agent System" },
];

const snippets: Record<DeployTarget, { title: string; language: string; code: string; note?: string }[]> = {
  "dashboard-local": [
    {
      title: "1. Клонирование и установка зависимостей",
      language: "bash",
      code: `# Клонировать репозиторий
git clone https://github.com/your-org/qa-agent-dashboard.git
cd qa-agent-dashboard

# Установить зависимости
npm install`,
    },
    {
      title: "2. Запуск в режиме разработки",
      language: "bash",
      code: `# Запустить dev-сервер (hot reload)
npm run dev

# Открыть http://localhost:5173`,
      note: "Vite запустит dev-сервер на порту 5173. Изменения применяются мгновенно.",
    },
    {
      title: "3. Сборка production-версии",
      language: "bash",
      code: `# Собрать оптимизированный бандл
npm run build

# Результат в папке dist/
ls dist/
# index.html  assets/`,
      note: "Готовые файлы лежат в dist/. Их можно отдать любому статическому серверу.",
    },
    {
      title: "4. Локальный preview production-сборки",
      language: "bash",
      code: `# Запустить preview сервер
npm run preview

# Открыть http://localhost:4173`,
    },
  ],

  "dashboard-docker": [
    {
      title: "Dockerfile",
      language: "dockerfile",
      code: `# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
    },
    {
      title: "nginx.conf",
      language: "nginx",
      code: `server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing: все маршруты -> index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кеширование статики
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`,
    },
    {
      title: "Сборка и запуск",
      language: "bash",
      code: `# Собрать образ
docker build -t qa-agent-dashboard .

# Запустить контейнер
docker run -d -p 8080:80 --name dashboard qa-agent-dashboard

# Открыть http://localhost:8080`,
    },
  ],

  "dashboard-hosting": [
    {
      title: "Vercel (рекомендуется)",
      language: "bash",
      code: `# Установить Vercel CLI
npm i -g vercel

# Авторизоваться
vercel login

# Развернуть (автоматически определит Vite)
vercel

# Развернуть в production
vercel --prod`,
      note: "Vercel автоматически определит Vite и настроит сборку. Zero-config.",
    },
    {
      title: "Netlify",
      language: "bash",
      code: `# Установить Netlify CLI
npm i -g netlify-cli

# Авторизоваться
netlify login

# Собрать и развернуть
netlify deploy --prod --dir=dist`,
      note: "Или подключить Git-репозиторий в UI Netlify — деплой по push.",
    },
    {
      title: "GitHub Pages",
      language: "yaml",
      code: `# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`,
    },
  ],

  "python-local": [
    {
      title: "1. Системные требования",
      language: "text",
      code: `# Необходимое ПО:
- Python 3.11+
- pip 23+
- Docker (опционально, для внешних конвертеров .doc)
- Git

# Проверка версии Python:
python --version  # должно быть 3.11+`,
    },
    {
      title: "2. Клонирование и создание venv",
      language: "bash",
      code: `# Клонировать репозиторий
git clone https://github.com/your-org/qa-agent-system.git
cd qa-agent-system

# Создать виртуальное окружение
python -m venv .venv

# Активировать
source .venv/bin/activate        # Linux / macOS
.venv\\Scripts\\activate          # Windows`,
    },
    {
      title: "3. Установка зависимостей",
      language: "bash",
      code: `# Обновить pip
pip install --upgrade pip

# Установить проект в editable-режиме
pip install -e .

# Или установить dev-зависимости (с тестами)
pip install -e ".[dev]"`,
      note: "Зависимости описаны в pyproject.toml: fastapi, langgraph, pydantic, openai, typer, structlog, pytest.",
    },
    {
      title: "4. Настройка .env",
      language: "bash",
      code: `# Скопировать шаблон
cp .env.example .env

# Открыть и заполнить обязательные поля
nano .env

# Обязательные:
#   OPENAI_API_KEY=<ваш ключ>
#   OPENAI_BASE_URL=<URL провайдера>
#   LLM_MODEL=qwen3.8`,
    },
    {
      title: "5. Запуск Web UI (FastAPI)",
      language: "bash",
      code: `# Запустить FastAPI-сервер
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Открыть http://localhost:8000
# Swagger UI: http://localhost:8000/docs`,
    },
    {
      title: "6. Запуск CLI",
      language: "bash",
      code: `# Запустить CLI-интерфейс
python -m qa_agent.cli run

# Или через typer:
typer main.py run \\
  --source ./requirements \\
  --mode web_ui

# Показать справку
python -m qa_agent.cli --help`,
    },
    {
      title: "7. Запуск тестов",
      language: "bash",
      code: `# Запустить все тесты (без сети и секретов)
pytest

# С покрытием
pytest --cov=qa_agent --cov-report=html

# Только быстрый smoke-тест
pytest tests/test_pipeline_smoke.py -v`,
      note: "Все тесты работают без сети и реальных API-ключей.",
    },
  ],

  "python-docker": [
    {
      title: "Dockerfile",
      language: "dockerfile",
      code: `FROM python:3.11-slim

# Системные зависимости для pandoc / antiword
RUN apt-get update && apt-get install -y --no-install-recommends \\
    pandoc \\
    antiword \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Зависимости
COPY pyproject.toml README.md ./
RUN pip install --no-cache-dir --upgrade pip \\
    && pip install --no-cache-dir -e .

# Код
COPY . .

# Не root
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    },
    {
      title: "docker-compose.yml",
      language: "yaml",
      code: `version: "3.9"

services:
  qa-agent:
    build: .
    container_name: qa-agent-system
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./workspace:/app/workspace
      - ./rules:/app/rules:ro
      - ./requirements:/app/requirements:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3`,
    },
    {
      title: "Запуск через Docker Compose",
      language: "bash",
      code: `# Собрать и запустить
docker compose up --build -d

# Проверить статус
docker compose ps

# Посмотреть логи
docker compose logs -f qa-agent

# Остановить
docker compose down`,
      note: "Папки workspace/, rules/, requirements/ монтируются в контейнер как volumes.",
    },
  ],

  "python-requirements": [
    {
      title: ".env.example (полный шаблон)",
      language: "env",
      code: `# ============ LLM ============
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=qwen3.8
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=8000
LLM_TIMEOUT=120
LLM_MAX_RETRIES=3

# ============ Rules ============
RULES_FILE_PATH=rules/doqa_rules.md

# ============ Requirements source ============
REQUIREMENTS_SOURCE_TYPE=folder
REQUIREMENTS_FOLDER_PATH=./requirements
REQUIREMENTS_SCAN_RECURSIVE=true
REQUIREMENTS_FILE_MASKS=*.md,*.txt,*.doc,*.docx,*.xls,*.xlsx

# ============ Redmine ============
REDMINE_BASE_URL=https://redmine.example.com
REDMINE_API_KEY=
REDMINE_PROJECT_ID=

# ============ DoQA ============
DOQA_BASE_URL=https://doqa.example.com
DOQA_API_VERSION=4.3.1
DOQA_API_TOKEN=
DOQA_TIMEOUT=60
DOQA_MAX_RETRIES=3
DOQA_IMPORT_MODE=file
DOQA_REVIEW_STATUS_NAME=Ревью
DOQA_ARCHIVE_STATUS_NAME=Архив
DOQA_REVIEW_STATUS_ID=
DOQA_ARCHIVE_STATUS_ID=

# ============ Codebase ============
CODEBASE_ACCESS_MODE=external_agent
CODEBASE_AGENT_URL=
CODEBASE_AGENT_TIMEOUT=120

# ============ Human review ============
HUMAN_REVIEW_MODE=web_ui
HUMAN_REVIEW_CLI_ENABLED=true
MAX_STAGE_ITERATIONS=5`,
    },
    {
      title: "Минимальный запуск (без интеграций)",
      language: "env",
      code: `# Для локального тестирования без внешних систем
# достаточно только LLM:

OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=qwen3.8

# Остальное — опционально.
# DoQA будет в dry-run режиме (контракт TBD).
# Codebase agent — недоступен (частичный контекст).
# Redmine — не используется.`,
      note: "В таком режиме система работает полностью локально, DoQA — в dry-run, кодовая база не используется.",
    },
    {
      title: "Проверка конфигурации",
      language: "bash",
      code: `# Запустить проверку конфигурации
python -m qa_agent.cli check-config

# Ожидаемый вывод:
# ✓ OPENAI_API_KEY: configured
# ✓ LLM_MODEL: qwen3.8
# ✓ RULES_FILE_PATH: rules/doqa_rules.md (exists, v1.10.0)
# ⚠ DOQA_API_TOKEN: not set (dry-run mode)
# ⚠ CODEBASE_AGENT_URL: not set (context unavailable)
# ✗ REDMINE_API_KEY: not set (Redmine disabled)`,
    },
  ],
};

export default function Deployment() {
  const [activeTarget, setActiveTarget] = useState<DeployTarget>("dashboard-local");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const groups = Array.from(new Set(deployTargets.map((t) => t.group)));
  const currentSnippets = snippets[activeTarget];

  const copyCode = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Как развернуть проект
          </span>
        </h1>
        <p className="text-gray-400">
          Инструкции по развёртыванию веб-дашборда и Python QA Agent System.
        </p>
      </div>

      {/* Quick start cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-bolt text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Быстрый старт — дашборд</h3>
          </div>
          <pre className="bg-gray-950 rounded-lg p-3 border border-gray-800 text-xs text-gray-300 font-mono overflow-x-auto">
{`npm install
npm run dev
# → http://localhost:5173`}
          </pre>
        </div>
        <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-brands fa-python text-violet-400" />
            <h3 className="text-sm font-bold text-white">Быстрый старт — Python</h3>
          </div>
          <pre className="bg-gray-950 rounded-lg p-3 border border-gray-800 text-xs text-gray-300 font-mono overflow-x-auto">
{`cp .env.example .env   # заполнить ключи
pip install -e .
uvicorn main:app --reload
# → http://localhost:8000`}
          </pre>
        </div>
      </div>

      {/* Target selector */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2 font-semibold px-1">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {deployTargets
                  .filter((t) => t.group === group)
                  .map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setActiveTarget(target.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                        activeTarget === target.id
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600"
                      }`}
                    >
                      <i className={`${target.icon} text-[11px]`} />
                      {target.label}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snippets */}
      <div className="space-y-4">
        {currentSnippets.map((snippet, idx) => (
          <div key={idx} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <i className={`fa-solid ${
                  snippet.language === "bash" ? "fa-terminal" :
                  snippet.language === "dockerfile" ? "fa-brands fa-docker" :
                  snippet.language === "yaml" ? "fa-solid fa-file-code" :
                  snippet.language === "env" ? "fa-solid fa-key" :
                  "fa-solid fa-file"
                } text-gray-400 text-sm`} />
                <h3 className="text-sm font-semibold text-white">{snippet.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-mono">
                  {snippet.language}
                </span>
                <button
                  onClick={() => copyCode(snippet.code, idx)}
                  className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  {copiedIdx === idx ? (
                    <>
                      <i className="fa-solid fa-check text-emerald-400 text-[10px]" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy text-[10px]" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
            </div>
            <pre className="p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
              <code>{snippet.code}</code>
            </pre>
            {snippet.note && (
              <div className="px-4 py-2.5 bg-cyan-500/5 border-t border-gray-800 flex items-start gap-2">
                <i className="fa-solid fa-circle-info text-cyan-400 text-xs mt-0.5" />
                <p className="text-xs text-gray-400">{snippet.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checklist */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-clipboard-check text-emerald-400" />
          Чек-лист перед запуском
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { text: "Python 3.11+ установлен", critical: true },
            { text: "Node.js 18+ установлен (для дашборда)", critical: false },
            { text: "OPENAI_API_KEY заполнен в .env", critical: true },
            { text: "OPENAI_BASE_URL указан", critical: true },
            { text: "rules/doqa_rules.md существует", critical: true },
            { text: "Папка requirements/ создана", critical: false },
            { text: "Docker установлен (опционально)", critical: false },
            { text: "DoQA API контракт заполнен (или dry-run)", critical: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                item.critical ? "border-amber-500" : "border-gray-600"
              }`} />
              <span className="text-xs text-gray-300 flex-1">{item.text}</span>
              {item.critical && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  обязательно
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Ports */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-network-wired text-cyan-400" />
          Используемые порты
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { port: "5173", service: "Vite dev server", color: "emerald" },
            { port: "4173", service: "Vite preview", color: "emerald" },
            { port: "8000", service: "FastAPI backend", color: "violet" },
            { port: "8080", service: "Dashboard (Docker)", color: "cyan" },
          ].map((p) => {
            const colorMap: Record<string, string> = {
              emerald: "border-emerald-500/20 text-emerald-400",
              violet: "border-violet-500/20 text-violet-400",
              cyan: "border-cyan-500/20 text-cyan-400",
            };
            return (
              <div key={p.port} className={`bg-gray-800/50 rounded-lg p-3 border ${colorMap[p.color]}`}>
                <p className="text-lg font-bold font-mono">:{p.port}</p>
                <p className="text-[10px] text-gray-400 mt-1">{p.service}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
