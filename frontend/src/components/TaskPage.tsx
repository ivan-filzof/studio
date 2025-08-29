"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/task-form";
import { getTasks, createTask, updateTask, deleteTask } from "@/services/taskService";
import type { Task } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks on first load
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }

  async function handleSaveTask(task: Omit<Task, "id"> & { id?: string }) {
    try {
      if (task.id) {
        // Update task
        const updated = await updateTask(task as Task);
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        // Create task
        const created = await createTask(task);
        setTasks((prev) => [...prev, created]);
      }
      setEditingTask(null); // close form
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>

      {/* Task form (show when editing or adding new) */}
      <TaskForm
        task={editingTask}
        onSave={handleSaveTask}
        onCancel={() => setEditingTask(null)}
      />

      {/* Task list */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded"
          >
            <div>
              <h2 className="font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setEditingTask(task)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
