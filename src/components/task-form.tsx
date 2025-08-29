'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/types';
import { setTaskPriority } from '@/ai/flows/set-task-priority';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const taskFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(100),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'done', 'canceled']),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type TaskFormProps = {
  task: Task | null;
  onSave: (task: Omit<Task, 'id'> & { id?: string }) => void;
  onCancel: () => void;
};

export default function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const { toast } = useToast();
  const [isAiRunning, setIsAiRunning] = useState(false);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate,
      priority: task?.priority || 'medium',
      status: task?.status || 'todo',
    },
  });

  // async function onSubmit(data: TaskFormValues) {
  //   try {
  //     const response = await fetch("http://127.0.0.1:8000/api/tasks", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Accept": "application/json",
  //       },
  //       body: JSON.stringify({
  //         title: data.title,
  //         description: data.description || "",
  //         user_id: 1,
  //         status: data.status,
  //         due_date: new Date(data.dueDate).toISOString().split("T")[0],
  //       }),
  //     });

  //     if (!response.ok) {
  //       const err = await response.json();
  //       throw new Error(err.message || "Failed to save task");
  //     }

  //     const saved = await response.json();
  //     console.log("✅ Task saved:", saved);

  //     toast({
  //       title: "Task Saved",
  //       description: `Task "${saved.title}" was successfully created.`,
  //     });

  //     onCancel();
  //   } catch (error) {
  //     console.error("❌ Error saving task:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to save task. Check backend logs.",
  //       variant: "destructive",
  //     });
  //   }
  // }

async function onSubmit(data: TaskFormValues) {
  try {
    const url = task?.id
      ? `http://127.0.0.1:8000/api/tasks/${task.id}` // update existing
      : `http://127.0.0.1:8000/api/tasks`;          // create new

    const method = task?.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description || "",
        user_id: 1,
        status: data.status,
        priority: data.priority,
        due_date: new Date(data.dueDate).toISOString().split("T")[0],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to save task");
    }

    const saved = await response.json();
    console.log("✅ Task saved/updated:", saved);

    toast({
      title: task?.id ? "Task Updated" : "Task Created",
      description: `Task "${saved.title}" was successfully ${task?.id ? "updated" : "created"}.`,
    });

    onCancel(); // close the form
    onSave(saved); // 👈 this will refresh parent list
  } catch (error) {
    console.error("❌ Error saving task:", error);
    toast({
      title: "Error",
      description: "Failed to save task. Check backend logs.",
      variant: "destructive",
    });
  }
}


  async function handleAiPriority() {
    const description = form.getValues('description');
    if (!description) {
      toast({
        title: 'No description provided',
        description: 'Please write a description to set priority with AI.',
        variant: 'destructive',
      });
      return;
    }
    setIsAiRunning(true);
    try {
      const result = await setTaskPriority({ description });
      form.setValue('priority', result.priority, { shouldValidate: true });
      toast({
        title: 'Priority set by AI!',
        description: `Priority suggested as "${result.priority}".`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: 'Could not set priority using AI.',
        variant: 'destructive',
      });
    } finally {
      setIsAiRunning(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Deploy to production" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Description</FormLabel>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAiPriority}
                  disabled={isAiRunning}
                  className="gap-2"
                >
                  <Sparkles
                    className={cn(
                      'h-4 w-4',
                      isAiRunning && 'animate-spin'
                    )}
                  />
                  AI Set Priority
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe the task in detail..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setDate(new Date().getDate() - 1))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FormLabel>Priorityasd</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Task</Button>
        </div>
      </form>
    </Form>
  );
}