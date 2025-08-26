'use client';

import { useState } from 'react';
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

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Setup project structure for Q3 launch',
    description:
      'Initialize Next.js app, install dependencies, and configure base project settings. This is a critical first step for the new product launch.',
    dueDate: new Date('2024-08-15'),
    priority: 'high',
    status: 'done',
  },
  {
    id: '2',
    title: 'Design UI mockups for the new dashboard',
    description: 'Create detailed mockups for all pages and components in Figma.',
    dueDate: new Date('2024-08-20'),
    priority: 'medium',
    status: 'in-progress',
  },
  {
    id: '3',
    title: 'Develop REST API endpoints for user authentication',
    description:
      'Implement and test all necessary CRUD endpoints for tasks, ensuring security and proper validation. This is an ASAP task.',
    dueDate: new Date('2024-08-25'),
    priority: 'high',
    status: 'todo',
  },
  {
    id: '4',
    title: 'Implement frontend components based on Figma designs',
    description: 'Build out all React components for the task list, forms, and navigation.',
    dueDate: new Date('2024-08-30'),
    priority: 'medium',
    status: 'todo',
  },
  {
    id: '5',
    title: 'Write user documentation for the new features',
    description: 'We should eventually document the API and project setup for new developers.',
    dueDate: new Date('2024-09-05'),
    priority: 'low',
    status: 'canceled',
  },
    {
    id: '6',
    title: 'Review and refactor legacy code in the billing module',
    description: 'Go through the old billing code and improve its structure and performance.',
    dueDate: new Date('2024-09-10'),
    priority: 'low',
    status: 'todo',
  },
];

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsSheetOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      setTasks(
        tasks.map((t) => (t.id === taskData.id ? (taskData as Task) : t))
      );
    } else {
      setTasks([...tasks, { ...taskData, id: Date.now().toString() }]);
    }
    setIsSheetOpen(false);
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
              {selectedTask ? 'Update the details of your task.' : 'Fill out the form to create a new task.'}
            </SheetDescription>
          </SheetHeader>
          <TaskForm
            task={selectedTask}
            onSave={handleSaveTask}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <TaskList
        tasks={tasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
