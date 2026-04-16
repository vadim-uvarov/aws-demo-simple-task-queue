export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  task_id: string;
  seconds: number;
  status: TaskStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  result?: string;
}
