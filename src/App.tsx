import { useState } from "react";
import Overview from "./components/Overview";
import Pipeline from "./components/Pipeline";
import Architecture from "./components/Architecture";
import Configuration from "./components/Configuration";
import Rules from "./components/Rules";
import TBD from "./components/TBD";
import Schemas from "./components/Schemas";
import Agents from "./components/Agents";
import CodePreview from "./components/CodePreview";
import Demo from "./components/Demo";

type Section = "overview" | "pipeline" | "demo" | "agents" | "schemas" | "architecture" | "code" | "configuration" | "rules" | "tbd";

const navItems: { id: Section; label: string; icon: string; group?: string }[] = [
  { id: "overview", label: "Обзор системы", icon: "fa-solid fa-house", group: "Общее" },
  { id: "pipeline", label: "Пайплайн (12 этапов)", icon: "fa-solid fa-diagram-project", group: "Общее" },
  { id: "demo", label: "Демо пайплайна", icon: "fa-solid fa-play", group: "Общее" },
  { id: "agents", label: "Агенты", icon: "fa-solid fa-robot", group: "Компоненты" },
  { id: "schemas", label: "Pydantic-схемы", icon: "fa-solid fa-cube", group: "Компоненты" },
  { id: "code", label: "Примеры кода", icon: "fa-solid fa-code", group: "Компоненты" },
  { id: "architecture", label: "Архитектура", icon: "fa-solid fa-sitemap", group: "Проект" },
  { id: "configuration", label: "Конфигурация", icon: "fa-solid fa-gears", group: "Проект" },
  { id: "rules", label: "Правила DoQA", icon: "fa-solid fa-book", group: "Проект" },
  { id: "tbd", label: "Открытые вопросы", icon: "fa-solid fa-circle-question", group: "Проект" },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <Overview />;
      case "pipeline": return <Pipeline />;
      case "demo": return <Demo />;
      case "agents": return <Agents />;
      case "schemas": return <Schemas />;
      case "code": return <CodePreview />;
      case "architecture": return <Architecture />;
      case "configuration": return <Configuration />;
      case "rules": return <Rules />;
      case "tbd": return <TBD />;
    }
  };

  // Group nav items
  const groups = Array.from(new Set(navItems.map((i) => i.group || "")));

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-16"
        } bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-bars text-lg" />
          </button>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <i className="fa-solid fa-robot text-white text-sm" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">QA Agent</h1>
                <p className="text-[10px] text-gray-500 leading-tight">System Architecture</p>
              </div>
            </div>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group}>
              {sidebarOpen && group && (
                <p className="text-[10px] uppercase tracking-wider text-gray-600 px-3 mb-1 font-semibold">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {navItems.filter((i) => (i.group || "") === group).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === item.id
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <i className={`${item.icon} w-5 text-center`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-800">
            <div className="text-[10px] text-gray-600 space-y-1">
              <p>Python 3.11+ · LangGraph</p>
              <p>FastAPI · Pydantic v2</p>
              <p>DoQA API 4.3.1</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
