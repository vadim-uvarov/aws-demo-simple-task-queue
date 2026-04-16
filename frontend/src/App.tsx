import { useEffect, useState, type FormEvent } from "react";
import { createTask, listTasks } from "./api";
import type { Task, TaskStatus } from "./types";

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
        <span className="task-seconds">{task.seconds}s</span>
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

export default function App() {
  const [seconds, setSeconds] = useState<number>(5);
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
      const created = await createTask(seconds);
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
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
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
