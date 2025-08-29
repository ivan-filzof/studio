import axios from "axios";
import type { Task, TaskBase } from "@/types";

const API_URL = "http://127.0.0.1:8000/api";

// ✅ Always include cookies with requests
axios.defaults.withCredentials = true;

/**
 * Ensure CSRF token is set before making state-changing requests.
 */
async function ensureCsrfCookie() {
  await axios.get("http://127.0.0.1:8000/sanctum/csrf-cookie");
}

/**
 * Format task data for Laravel backend (snake_case + correct date format).
 */
function formatTaskForBackend(task: Partial<TaskBase>) {
  return {
    title: task.title,
    description: task.description,
    user_id: task.userId ?? 1,
    due_date: task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : null,
    priority: task.priority,
    status: task.status,
  };
}

/**
 * Get all tasks
 */
export async function getTasks(): Promise<Task[]> {
  const res = await axios.get(`${API_URL}/tasks`);
  return res.data;
}

/**
 * Create a new task
 */
export async function createTask(task: TaskBase): Promise<Task> {
  await ensureCsrfCookie();
  const res = await axios.post(`${API_URL}/tasks`, formatTaskForBackend(task));
  return res.data;
}

/**
 * Update an existing task
 */
export async function updateTask(task: Task): Promise<Task> {
  await ensureCsrfCookie();
  const res = await axios.put(
    `${API_URL}/tasks/${task.id}`,
    formatTaskForBackend(task)
  );
  return res.data;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  await ensureCsrfCookie();
  await axios.delete(`${API_URL}/tasks/${id}`);
}
