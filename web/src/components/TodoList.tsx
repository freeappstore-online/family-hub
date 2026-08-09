import { useState, useEffect } from "react";
import type { Task } from "../types";

interface Props {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function daysDiff(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

function dueDateLabel(dueDate: string): { label: string; color: string } {
  const diff = daysDiff(dueDate);
  if (diff < 0) return { label: `Overdue · ${formatDate(dueDate)}`, color: "#dc2626" };
  if (diff === 0) return { label: "Due TODAY", color: "#d97706" };
  if (diff === 1) return { label: "Due tomorrow", color: "#d97706" };
  if (diff <= 7) return { label: `Due ${formatDate(dueDate)} · ${diff} days`, color: "#d97706" };
  return { label: `Due ${formatDate(dueDate)}`, color: "var(--muted)" };
}

async function requestNotifications() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function fireTaskNotification(task: Task) {
  if (Notification.permission !== "granted" || !task.dueDate) return;
  const { label } = dueDateLabel(task.dueDate);
  new Notification("✅ Task Reminder — Family Hub", {
    body: `${task.title} · ${label}`,
    tag: `task-${task.id}`,
  });
}

export function TodoList({ tasks, onChange }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDue, setEditDue] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" ? Notification.permission === "granted" : false
  );

  const today = todayStr();

  // On mount: notify overdue / due-today tasks
  useEffect(() => {
    if (Notification.permission !== "granted") return;
    tasks.forEach((task) => {
      if (task.completed || !task.dueDate) return;
      const diff = daysDiff(task.dueDate);
      if (diff <= 0) fireTaskNotification(task);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });

  const done = tasks.filter((t) => t.completed);

  const overdue = active.filter((t) => t.dueDate && t.dueDate < today);
  const dueSoon = active.filter((t) => t.dueDate && t.dueDate >= today && daysDiff(t.dueDate) <= 7);

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

  function startEdit(task: Task) {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDue(task.dueDate || "");
  }

  function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    onChange(tasks.map((t) =>
      t.id === id ? { ...t, title: editTitle.trim(), dueDate: editDue || undefined } : t
    ));
    setEditId(null);
  }

  async function enableNotifications() {
    const granted = await requestNotifications();
    setNotifGranted(granted);
    if (granted) {
      active.forEach((task) => {
        if (!task.dueDate) return;
        const diff = daysDiff(task.dueDate);
        if (diff <= 1) fireTaskNotification(task);
      });
    }
  }

  const TaskRow = ({ task }: { task: Task }) => {
    const isEditing = editId === task.id;
    const dueInfo = task.dueDate ? dueDateLabel(task.dueDate) : null;
    const isOverdue = task.dueDate && task.dueDate < today && !task.completed;

    return (
      <div
        className="rounded-2xl p-4 border transition-all"
        style={{
          borderColor: isOverdue ? "#dc262640" : "var(--line)",
          background: isOverdue ? "#dc262608" : "var(--panel)",
        }}
      >
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
              onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
              autoFocus
            />
            <input
              type="date"
              value={editDue}
              onChange={(e) => setEditDue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(task.id)}
                className="flex-1 py-1.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Save
              </button>
              <button
                onClick={() => setEditId(null)}
                className="flex-1 py-1.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--line)", color: "var(--ink)", background: "var(--paper)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleTask(task.id)}
              className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: task.completed ? "#16a34a" : "var(--line-strong)",
                background: task.completed ? "#16a34a" : "transparent",
              }}
            >
              {task.completed && <span className="text-white text-xs">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium"
                style={{
                  color: task.completed ? "var(--muted)" : "var(--ink)",
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </p>
              {dueInfo && !task.completed && (
                <p className="text-xs mt-0.5 font-medium" style={{ color: dueInfo.color }}>
                  📅 {dueInfo.label}
                </p>
              )}
              {task.dueDate && task.completed && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Was due {formatDate(task.dueDate)}
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {!task.completed && (
                <button
                  onClick={() => startEdit(task)}
                  className="p-1.5 rounded-lg text-sm"
                  style={{ color: "var(--muted)" }}
                >
                  ✏️
                </button>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded-lg text-sm"
                style={{ color: "var(--muted)" }}
              >
                🗑
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            ✅ To-Do
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {active.length} pending · {done.length} done
          </p>
        </div>
      </div>

      {/* Notification prompt */}
      {!notifGranted && "Notification" in window && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border"
          style={{ background: "#2563eb12", borderColor: "#2563eb40" }}
        >
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
              Get task reminders
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Be notified when tasks are due or overdue
            </p>
          </div>
          <button
            onClick={enableNotifications}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
            style={{ background: "var(--accent)" }}
          >
            Enable
          </button>
        </div>
      )}

      {/* Summary badges */}
      {(overdue.length > 0 || dueSoon.length > 0) && (
        <div className="flex gap-2 flex-wrap">
          {overdue.length > 0 && (
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: "#dc262618", color: "#dc2626" }}
            >
              🔴 {overdue.length} overdue
            </span>
          )}
          {dueSoon.length > 0 && (
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: "#d9770618", color: "#d97706" }}
            >
              🟡 {dueSoon.length} due this week
            </span>
          )}
        </div>
      )}

      {/* Add task */}
      <div
        className="rounded-2xl p-4 border space-y-3"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new task…"
          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
          />
          <button
            onClick={addTask}
            disabled={!newTitle.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Active tasks */}
      {active.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center border"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-semibold" style={{ color: "var(--ink)" }}>All done!</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Add a task above to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 text-sm font-semibold mb-3"
            style={{ color: "var(--muted)" }}
          >
            <span>{showDone ? "▾" : "▸"}</span>
            Completed ({done.length})
          </button>
          {showDone && (
            <div className="space-y-2">
              {done.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
