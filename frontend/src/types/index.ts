export type Task = {
  id: string;
  userId: 1;  // 👈 add this
  title: string;
  description: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done' | 'canceled';
};

// For creating tasks (no id yet)
export type TaskBase = Omit<Task, "id">;
