<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;

use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    public function index() {
        $tasks = Task::get();
        if ($tasks->count() > 0) {
            return TaskResource::collection($tasks);
        }
        else {
            return response()->json(['message', 'No Tasks found'], 200);
        }
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'user_id'     => 'required|exists:users,id',
            'title'       => 'required|string|max:255|min:5',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:pending,in_progress,completed',
            'due_date'    => 'nullable|date|after_or_equal:today',
        ]);

        $task = Task::create($validated);


        return response()->json([
            'message' => "Task created successfully.", 
            "data" => new TaskResource($task)
        ], 201);
    }

    public function show(Task $task) {
        return new TaskResource($task);
    }

    public function update(Request $request, Task $task) {
        $validated = $request->validate([
            'user_id'     => 'sometimes|exists:users,id',
            'title'       => 'sometimes|required|string|max:255|min:5',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:pending,in_progress,completed',
            'due_date'    => 'nullable|date|after_or_equal:today',
        ]);

        $task->update($validated);

        return response()->json([
            'message' => 'Task updated successfully.',
            'data'    => new TaskResource($task)
        ], 200);
    }

    public function destroy(Task $task) {
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.'
        ], 200);
    }
}
