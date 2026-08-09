import { useState } from "react";
import type { SharedTask, FamilyMember } from "../types";

interface Props {
  tasks: SharedTask[];
  members: FamilyMember[];
  onChange: (tasks: SharedTask[]) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const priorities: { value: SharedTask["priority"]; label: string; color: string; icon: string }[] = [
  { value: "low", label: "Low", color: "#16a34a", icon: "🟢" },
  { value: "medium", label: "Medium", color: "#d97706", icon: "🟡" },
  { value: "high", label: "High", color: "#dc2626", icon: "🔴" },
];

export function SharedTasks({ tasks, members, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<SharedTask["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const activeTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  const filtered =
    filter === "pending" ? activeTasks : filter === "done" ? doneTasks : tasks;

  function addTask() {
    if (!title.trim() || !assignedTo || !assignedBy) return;
    const task: SharedTask = {
      id: genId(),
      title: title.trim(),
      assignedTo,
      assignedBy,
      dueDate: dueDate || undefined,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    onChange([task, ...tasks]);
    setTitle("");
    setAssignedTo("");
    setAssignedBy("");
    setDueDate("");
    setPriority("medium");
    setShowForm(false);
  }

  function completeTask(id: string) {
    onChange(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      )
    );
  }

  function uncompleteTask(id: string) {
    onChange(tasks.map((t) => (t.id === id ? { ...t, completed: false, completedAt: undefined } : t)));
  }

  function deleteTask(id: string) {
    onChange(tasks.filter((t) => t.id !== id));
  }

  const getPriority = (p: SharedTask["priority"]) => priorities.find((x) => x.value === p)!;

  const getMember = (name: string) => members.find((m) => m.name === name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          👨‍👩‍👧 Shared Tasks
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-base"
          style={{ background: "var(--accent)" }}
        >
          + Assign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", count: tasks.length, color: "#2563eb" },
          { label: "Pending", count: activeTasks.length, color: "#d97706" },
          { label: "Done", count: doneTasks.length, color: "#16a34a" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-3 text-center"
            style={{ background: s.color + "15", border: `1.5px solid ${s.color}30` }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--panel)", border: "2px solid var(--accent)" }}
        >
          <p className="font-bold text-lg">Assign New Task</p>

          <input
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Task description..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {members.length > 0 ? (
            <>
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Assign To</p>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssignedTo(m.name)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: assignedTo === m.name ? "var(--accent)" : "var(--line)",
                        color: assignedTo === m.name ? "white" : "var(--ink)",
                      }}
                    >
                      <span>{m.emoji}</span> {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Assigned By</p>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssignedBy(m.name)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: assignedBy === m.name ? "#7c3aed" : "var(--line)",
                        color: assignedBy === m.name ? "white" : "var(--ink)",
                      }}
                    >
                      <span>{m.emoji}</span> {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl p-3 text-sm" style={{ background: "#d9770620", color: "#d97706" }}>
              ⚠️ Add family members in Contacts first to assign tasks
            </div>
          )}

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Priority</p>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: priority === p.value ? p.color + "20" : "var(--paper)",
                    border: `2px solid ${priority === p.value ? p.color : "var(--line)"}`,
                    color: priority === p.value ? p.color : "var(--ink)",
                  }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Due Date (optional)</p>
            <input
              type="date"
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={addTask}
              disabled={!title.trim() || !assignedTo || !assignedBy}
              className="flex-1 py-3 rounded-xl font-bold text-white text-base disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              Assign Task
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-xl font-bold text-base"
              style={{ background: "var(--line)", color: "var(--ink)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all"
            style={{
              background: filter === f ? "var(--accent)" : "var(--panel)",
              color: filter === f ? "white" : "var(--ink)",
              border: `1.5px solid ${filter === f ? "var(--accent)" : "var(--line)"}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}>
          <p className="text-5xl mb-3">👨‍👩‍👧</p>
          <p className="text-xl font-bold mb-1">No tasks yet</p>
          <p style={{ color: "var(--muted)" }}>Tap + Assign to create a shared task</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const p = getPriority(task.priority);
            const assignee = getMember(task.assignedTo);
            const assigner = getMember(task.assignedBy);
            return (
              <div
                key={task.id}
                className="rounded-2xl p-4"
                style={{
                  background: "var(--panel)",
                  border: `1.5px solid ${task.completed ? "var(--line)" : p.color + "40"}`,
                  opacity: task.completed ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => task.completed ? uncompleteTask(task.id) : completeTask(task.id)}
                    className="mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: task.completed ? "var(--success)" : p.color,
                      background: task.completed ? "var(--success)" : "transparent",
                    }}
                  >
                    {task.completed && <span className="text-white text-sm font-bold">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-base"
                      style={{
                        textDecoration: task.completed ? "line-through" : "none",
                        color: task.completed ? "var(--muted)" : "var(--ink)",
                      }}
                    >
                      {task.title}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ background: p.color + "20", color: p.color }}
                      >
                        {p.icon} {p.label}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: "var(--line)", color: "var(--ink)" }}
                      >
                        👤 {assignee?.emoji || ""} {task.assignedTo}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: "var(--line)", color: "var(--muted)" }}
                      >
                        from {assigner?.emoji || ""} {task.assignedBy}
                      </span>
                    </div>

                    {task.dueDate && (
                      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                        📅 Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </p>
                    )}
                    {task.completed && task.completedAt && (
                      <p className="text-xs mt-1" style={{ color: "var(--success)" }}>
                        ✅ Completed{" "}
                        {new Date(task.completedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl"
                    style={{ color: "var(--error)", background: "#dc262618" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
