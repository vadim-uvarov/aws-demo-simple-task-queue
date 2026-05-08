import type { Task } from "./types";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  console.warn(
    "VITE_API_URL is not set. Run `VITE_API_URL=https://... npm run dev` or build with it defined."
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text || `${res.status} ${res.statusText}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.error === "string") message = parsed.error;
    } catch {
      // Body wasn't JSON — fall through with the raw text.
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>("/tasks");
}

export function createTask(inputSeconds: number): Promise<Task> {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify({ input_seconds: inputSeconds }),
  });
}
