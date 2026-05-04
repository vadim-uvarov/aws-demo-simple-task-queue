import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { createTask, listTasks } from "./api";
import type { Task, TaskStatus } from "./types";
import DocsPage from "./DocsPage";

type TabId = "app" | "docs";

const TABS: { id: TabId; label: string }[] = [
  { id: "app", label: "App" },
  { id: "docs", label: "Documentation" },
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "pending",
  in_progress: "in progress",
  completed: "completed",
};

function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

function TaskRow({ task }: { task: Task }) {
  return (
    <li className="task">
      <div className="task-head">
        <StatusBadge status={task.status} />
        <span className="task-seconds">{task.input_seconds}s</span>
        <span className="task-id" title={task.task_id}>
          {task.task_id.slice(0, 8)}
        </span>
      </div>
      {task.status === "completed" && task.result && (
        <div className="task-result">{task.result}</div>
      )}
    </li>
  );
}

function MainPage() {
  const [inputSeconds, setInputSeconds] = useState<number>(5);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await listTasks();
        if (!cancelled) setTasks(next);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask(inputSeconds);
      setTasks((prev) => [created, ...prev.filter((t) => t.task_id !== created.task_id)]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app">
      <h1>Task Queue Demo</h1>
      <p className="subtitle">
        Submit an integer. A Lambda worker sleeps that many seconds, then reports back.
      </p>

      <form className="form" onSubmit={onSubmit}>
        <label>
          Seconds
          <input
            type="number"
            min={0}
            max={30}
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Number(e.target.value))}
            disabled={submitting}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p className="empty">No tasks yet.</p>
      ) : (
        <ul className="tasks">
          {tasks.map((t) => (
            <TaskRow key={t.task_id} task={t} />
          ))}
        </ul>
      )}
    </main>
  );
}

function TabBar({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentIndex = TABS.findIndex((tab) => tab.id === active);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + offset + TABS.length) % TABS.length;
    onSelect(TABS[nextIndex].id);
  };

  return (
    <div className="tabs" role="tablist" aria-label="Site sections">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            className="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={handleTabKeyDown}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("app");

  return (
    <div className="shell">
      <TabBar active={activeTab} onSelect={setActiveTab} />
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "app" ? <MainPage /> : <DocsPage />}
      </div>
    </div>
  );
}
