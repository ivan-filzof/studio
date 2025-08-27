import axios from "axios";
import type { Task, TaskBase } from "@/types";

const API_URL = "http://127.0.0.1:8000/api";


function formatTaskForBackend(task: Partial<TaskBase>) {
  return {
    title: task.title,
    description: task.description,
    user_id: task.userId ?? 1,
    due_date: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : null,
    priority: task.priority,
    status: task.status,
  };
}

export async function getTasks(): Promise<Task[]> {
  const res = await axios.get(`${API_URL}/tasks`);
  return res.data;
}

export async function createTask(task: TaskBase): Promise<Task> {
  const res = await axios.post(`${API_URL}/tasks`, formatTaskForBackend(task));
  return res.data;
}

export async function updateTask(task: Task): Promise<Task> {
  const res = await axios.put(`${API_URL}/tasks/${task.id}`, formatTaskForBackend(task));
  return res.data;
}

export async function deleteTask(id: string): Promise<void> {
  await axios.delete(`${API_URL}/tasks/${id}`);
}