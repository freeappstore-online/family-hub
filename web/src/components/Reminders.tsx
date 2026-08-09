import { useState } from "react";
import type { Reminder } from "../types";

interface Props {
  reminders: Reminder[];
  onChange: (reminders: Reminder[]) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const categories: { value: Reminder["category"]; label: string; icon: string; color: string }[] = [
  { value: "appointment", label: "Appointment", icon: "🏥", color: "#2563eb" },
  { value: "bill", label: "Bill / Payment", icon: "💳", color: "#d97706" },
  { value: "shopping", label: "Shopping", icon: "🛒", color: "#16a34a" },
  { value: "other", label: "Other", icon: "📌", color: "#7c3aed" },
];

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isOverdue(dt: string) {
  return new Date(dt) < new Date();
}

export function Reminders({ reminders, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Reminder["category"]>("appointment");
  const [dateTime, setDateTime] = useState("");
  const [recurring, setRecurring] = useState<Reminder["recurring"]>("none");

  const active = reminders.filter((r) => !r.completed).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  const done = reminders.filter((r) => r.completed);

  function addReminder() {
    if (!title.trim() || !dateTime) return;
    const r: Reminder = {
      id: genId(),
      title: title.trim(),
      category,
      dateTime,
      recurring,
      completed: false,
    };
    onChange([r, ...reminders]);
    setTitle("");
    setDateTime("");
    setCategory("appointment");
    setRecurring("none");
    setShowForm(false);
  }

  function complete(id: string) {
    onChange(reminders.map((r) => (r.id === id ? { ...r, completed: true } : r)));
  }

  function deleteReminder(id: string) {
    onChange(reminders.filter((r) => r.id !== id));
  }

  const getCat = (c: Reminder["category"]) => categories.find((x) => x.value === c)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          🔔 Reminders
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-base"
          style={{ background: "var(--accent)" }}
        >
          + Add
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--panel)", border: "2px solid var(--accent)" }}
        >
          <p className="font-bold text-lg">New Reminder</p>

          <input
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Reminder title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Category */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Category</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: category === c.value ? c.color + "20" : "var(--paper)",
                    border: `2px solid ${category === c.value ? c.color : "var(--line)"}`,
                    color: category === c.value ? c.color : "var(--ink)",
                  }}
                >
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Date & Time</p>
            <input
              type="datetime-local"
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Repeat</p>
            <select
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as Reminder["recurring"])}
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addReminder}
              disabled={!title.trim() || !dateTime}
              className="flex-1 py-3 rounded-xl font-bold text-white text-base disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              Save Reminder
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

      {/* Active Reminders */}
      <div className="space-y-3">
        {active.length === 0 && !showForm && (
          <div className="text-center py-12 rounded-2xl" style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}>
            <p className="text-5xl mb-3">🔔</p>
            <p className="text-xl font-bold mb-1">No reminders set</p>
            <p style={{ color: "var(--muted)" }}>Tap + Add to create your first reminder</p>
          </div>
        )}
        {active.map((r) => {
          const cat = getCat(r.category);
          const overdue = isOverdue(r.dateTime);
          return (
            <div
              key={r.id}
              className="rounded-2xl p-4"
              style={{
                background: "var(--panel)",
                border: `1.5px solid ${overdue ? "var(--error)" : "var(--line)"}`,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: cat.color + "20" }}
                >
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">{r.title}</p>
                  <p className="text-sm mt-0.5" style={{ color: overdue ? "var(--error)" : "var(--muted)" }}>
                    {overdue ? "⚠️ Overdue · " : ""}
                    {formatDateTime(r.dateTime)}
                  </p>
                  {r.recurring && r.recurring !== "none" && (
                    <span
                      className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: cat.color + "20", color: cat.color }}
                    >
                      🔁 {r.recurring}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => complete(r.id)}
                    className="p-2 rounded-xl font-bold text-sm"
                    style={{ background: "#16a34a20", color: "#16a34a" }}
                    aria-label="Mark done"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-2 rounded-xl"
                    style={{ background: "#dc262618", color: "var(--error)" }}
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div className="pt-2">
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>
            Completed ({done.length})
          </p>
          <div className="space-y-2">
            {done.slice(0, 5).map((r) => {
              const cat = getCat(r.category);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl p-3 opacity-50"
                  style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <p className="flex-1 text-sm line-through truncate">{r.title}</p>
                  <button onClick={() => deleteReminder(r.id)} style={{ color: "var(--error)" }}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
