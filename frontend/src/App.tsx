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
        
        <a
          className="repo-link"
          href="https://github.com/vadim-uvarov/aws-demo-simple-task-queue"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className="repo-link-icon"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              /* This attribute draws the GitHub icon */
              d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <span>vadim-uvarov/aws-demo-simple-task-queue</span>
        </a>

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
