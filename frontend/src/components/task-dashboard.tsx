'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TaskList from '@/components/task-list';
import TaskForm from '@/components/task-form';
import type { Task } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Reusable fetchTasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();

      // If Laravel returns { data: [...] }
      const tasksArray = Array.isArray(data) ? data : data.data;

      const formatted = tasksArray.map((task: any) => ({
        id: String(task.id),
        title: task.title,
        description: task.description,
        dueDate: new Date(task.due_date),
        priority: task.priority,
        status: task.status,
        userId: task.user_id,
      }));

      setTasks(formatted);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 🔹 Add new task or update existing
  const handleSaveTask = async (taskData: Omit<Task, 'id'> & { id?: string }) => {
    try {
      if (taskData.id) {
        // update
        await fetch(`http://127.0.0.1:8000/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      } else {
        // create
        await fetch('http://127.0.0.1:8000/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      }

      // ✅ Always re-fetch fresh tasks from backend
      await fetchTasks();
      setIsSheetOpen(false);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  // 🔹 Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      // ✅ Refresh list after deletion
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsSheetOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-headline font-bold">All Tasks</h2>
          <p className="text-muted-foreground">
            Here's a list of all your tasks.
          </p>
        </div>
        <Button onClick={handleAddTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full">
          <SheetHeader>
            <SheetTitle className="font-headline text-2xl">
              {selectedTask ? 'Edit Task' : 'Add New Task'}
            </SheetTitle>
            <SheetDescription>
              {selectedTask
                ? 'Update the details of your task.'
                : 'Fill out the form to create a new task.'}
            </SheetDescription>
          </SheetHeader>
          <TaskForm
            task={selectedTask}
            onSave={handleSaveTask}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {loading ? (
        <p className="text-muted-foreground">Loading tasks...</p>
      ) : (
        <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
      )}
    </div>
  );
}
