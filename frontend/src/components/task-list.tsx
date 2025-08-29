'use client';

import { useState, useMemo, type FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  Edit,
} from 'lucide-react';
import type { Task } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TaskListProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

type SortKey = keyof Task | '';
type SortDirection = 'asc' | 'desc';

const SortableHeader: FC<{
  title: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; direction: SortDirection };
  onSort: (key: SortKey) => void;
}> = ({ title, sortKey, currentSort, onSort }) => (
  <Button variant="ghost" onClick={() => onSort(sortKey)}>
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

export default function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'dueDate',
    direction: 'asc',
  });

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const statusMatch =
        filter.status === 'all' || task.status === filter.status;
      const priorityMatch =
        filter.priority === 'all' || task.priority === filter.priority;
      const searchMatch = task.title
        .toLowerCase()
        .includes(filter.search.toLowerCase());
      return statusMatch && priorityMatch && searchMatch;
    });

    if (sort.key) {
      filtered.sort((a, b) => {
        const aVal = a[sort.key as keyof Task];
        const bVal = b[sort.key as keyof Task];

        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        if (aVal < bVal) comparison = -1;

        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [tasks, filter, sort]);

  const handleSort = (key: SortKey) => {
    if (sort.key === key) {
      setSort({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ key, direction: 'asc' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <Input
          placeholder="Filter by title..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="max-w-full md:max-w-sm"
        />
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={filter.priority}
            onValueChange={(value) => setFilter({ ...filter, priority: value })}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortableHeader title="Title" sortKey="title" currentSort={sort} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader title="Status" sortKey="status" currentSort={sort} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader title="Priority" sortKey="priority" currentSort={sort} onSort={handleSort} /></TableHead>
              <TableHead><SortableHeader title="Due Date" sortKey="dueDate" currentSort={sort} onSort={handleSort} /></TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize',
                        task.status === 'done' ? 'border-green-500/50 text-green-400 bg-green-900/20' :
                        task.status === 'in-progress' ? 'border-blue-500/50 text-blue-400 bg-blue-900/20' :
                        task.status === 'todo' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-900/20' :
                        'border-slate-500/50 text-slate-400 bg-slate-900/20')}>
                        {task.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className={cn('capitalize',
                        task.priority === 'high' ? 'border-destructive/50 text-destructive bg-destructive/20' :
                        task.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-900/20' :
                        'border-sky-500/50 text-sky-400 bg-sky-900/20')}>
                        {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(task.dueDate, 'PPP')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
