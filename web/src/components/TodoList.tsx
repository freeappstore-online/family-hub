import { useState } from "react";
import type { Task } from "../types";

interface Props {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function TodoList({ tasks, onChange }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDone, setShowDone] = useState(false);

  const active = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  function addTask() {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: genId(),
      title: newTitle.trim(),
      completed: false,
      dueDate: newDue || undefined,
      createdAt: new Date().toISOString(),
    };
    onChange([task, ...tasks]);
    setNewTitle("");
    setNewDue("");
  }

  function toggleTask(id: string) {
    onChange(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    onChange(tasks.filter((t) => t.id !== id));
  }

  function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    onChange(tasks.map((t) => (t.id === id ? { ...t, title: editTitle.trim() } : t)));
    setEditId(null);
  }

  function startEdit(task: Task) {
    setEditId(task.id);
    setEditTitle(task.title);
  }

  const TaskRow = ({ task }: { task: Task }) => (
    <div
      className="rounded-2xl p-4 transition-all"
      style={{
        background: "var(--panel)",
        border: "1.5px solid var(--line)",
        opacity: task.completed ? 0.6 : 1,
      }}
    >
      {editId === task.id ? (
        <div className="space-y-3">
          <input
            className="w-full rounded-xl px-4 py-3 text-base font-medium"
            style={{ background: "var(--paper)", border: "2px solid var(--accent)", color: "var(--ink)" }}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveEdit(task.id)}
              className="flex-1 rounded-xl py-2.5 font-bold text-white text-base"
              style={{ background: "var(--accent)" }}
            >
              Save
            </button>
            <button
              onClick={() => setEditId(null)}
              className="flex-1 rounded-xl py-2.5 font-bold text-base"
              style={{ background: "var(--line)", color: "var(--ink)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTask(task.id)}
            className="mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
            style={{
              borderColor: task.completed ? "var(--success)" : "var(--accent)",
              background: task.completed ? "var(--success)" : "transparent",
            }}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed && <span className="text-white text-sm font-bold">✓</span>}
          </button>
          <div className="flex-1 min-w-0">
            <p
              className="text-base font-semibold"
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "var(--muted)" : "var(--ink)",
              }}
            >
              {task.title}
            </p>
            {task.dueDate && (
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                📅 Due:{" "}
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          {!task.completed && (
            <button
              onClick={() => startEdit(task)}
              className="p-2 rounded-xl"
              style={{ color: "var(--muted)", background: "var(--line)" }}
              aria-label="Edit task"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id)}
            className="p-2 rounded-xl"
            style={{ color: "var(--error)", background: "#dc262618" }}
            aria-label="Delete task"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
        ✅ To-Do List
      </h1>

      {/* Add Task */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
      >
        <p className="font-bold text-lg">Add New Task</p>
        <input
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="flex-1 rounded-xl px-3 py-2.5 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
          />
          <button
            onClick={addTask}
            disabled={!newTitle.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-white text-base transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Active Tasks */}
      <div>
        <p className="font-bold text-lg mb-3" style={{ color: "var(--ink)" }}>
          Pending ({active.length})
        </p>
        {active.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}>
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-lg font-semibold">All tasks done!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {done.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 font-bold text-lg mb-3 w-full text-left"
            style={{ color: "var(--muted)" }}
          >
            <span>{showDone ? "▼" : "▶"}</span>
            Completed ({done.length})
          </button>
          {showDone && (
            <div className="space-y-3">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
