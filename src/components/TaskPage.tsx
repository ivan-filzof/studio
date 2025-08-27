"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/task-form";
import { getTasks, createTask, updateTask, deleteTask } from "@/services/taskService";
import type { Task } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const data = await getTasks();
    setTasks(data);
  }

  async function handleSave(task: Omit<Task, "id"> & { id?: string }) {
    let savedTask: Task;

    if (task.id) {

      savedTask = await updateTask(task as Task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? savedTask : t)));
    } else {

      savedTask = await createTask(task);
      setTasks((prev) => [...prev, savedTask]);
    }

    setSelectedTask(null);
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tasks</h1>

      {selectedTask ? (
        <TaskForm
          task={selectedTask}
          onSave={handleSave}
          onCancel={() => setSelectedTask(null)}
        />
      ) : (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"

          onClick={() =>
            setSelectedTask({
              id: "",
              userId: 1,
              title: "",
              description: "",
              dueDate: new Date(),
              priority: "medium",
              status: "todo",
            })
          }
        >
          + Add Task
        </button>
      )}

      <ul className="mt-6 space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-gray-500">{task.status}</p>
            </div>
            <div className="space-x-2">
              <button
                className="text-blue-500 underline"
                onClick={() => setSelectedTask(task)}
              >
                Edit
              </button>
              <button
                className="text-red-500 underline"
                onClick={() => handleDelete(task.id)}
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
