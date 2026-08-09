import { useState } from "react";
import type { CalendarEvent } from "../types";

interface Props {
  events: CalendarEvent[];
  onChange: (events: CalendarEvent[]) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const eventTypes: { value: CalendarEvent["type"]; label: string; icon: string; color: string }[] = [
  { value: "birthday", label: "Birthday", icon: "🎂", color: "#ec4899" },
  { value: "appointment", label: "Appointment", icon: "🏥", color: "#2563eb" },
  { value: "activity", label: "Activity", icon: "⚽", color: "#16a34a" },
  { value: "event", label: "Event", icon: "📅", color: "#d97706" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function FamilyCalendar({ events, onChange }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEvent["type"]>("event");
  const [notes, setNotes] = useState("");
  const [formDate, setFormDate] = useState("");

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function dateStr(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function eventsOnDay(day: number) {
    const ds = dateStr(day);
    return events.filter((e) => e.date === ds);
  }

  function addEvent() {
    if (!title.trim() || !formDate) return;
    const ev: CalendarEvent = {
      id: genId(),
      title: title.trim(),
      date: formDate,
      type,
      notes: notes.trim() || undefined,
    };
    onChange([ev, ...events]);
    setTitle("");
    setNotes("");
    setFormDate("");
    setType("event");
    setShowForm(false);
  }

  function deleteEvent(id: string) {
    onChange(events.filter((e) => e.id !== id));
  }

  const getType = (t: CalendarEvent["type"]) => eventTypes.find((x) => x.value === t)!;

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const upcomingEvents = events
    .filter((e) => e.date >= today.toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          📅 Family Calendar
        </h1>
        <button
          onClick={() => { setShowForm(!showForm); setFormDate(""); }}
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
          <p className="font-bold text-lg">New Event</p>
          <input
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Event title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            {eventTypes.map((et) => (
              <button
                key={et.value}
                onClick={() => setType(et.value)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
                style={{
                  background: type === et.value ? et.color + "20" : "var(--paper)",
                  border: `2px solid ${type === et.value ? et.color : "var(--line)"}`,
                  color: type === et.value ? et.color : "var(--ink)",
                }}
              >
                <span>{et.icon}</span> {et.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />
          <input
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={addEvent}
              disabled={!title.trim() || !formDate}
              className="flex-1 py-3 rounded-xl font-bold text-white text-base disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              Save Event
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

      {/* Calendar Grid */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--line)" }}>
        {/* Month header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: "var(--panel)", borderBottom: "1.5px solid var(--line)" }}
        >
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center"
            style={{ background: "var(--line)", color: "var(--ink)" }}
          >
            ‹
          </button>
          <p className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
            {MONTHS[viewMonth]} {viewYear}
          </p>
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center"
            style={{ background: "var(--line)", color: "var(--ink)" }}
          >
            ›
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7" style={{ background: "var(--panel)" }}>
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-bold py-2" style={{ color: "var(--muted)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7" style={{ background: "var(--paper)" }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const ds = dateStr(day);
            const dayEvents = eventsOnDay(day);
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const isSelected = selectedDate === ds;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : ds)}
                className="relative flex flex-col items-center py-2 min-h-[52px] transition-all"
                style={{
                  background: isSelected ? "var(--accent)" : isToday ? "#2563eb15" : "transparent",
                  borderRadius: isSelected || isToday ? "0.75rem" : "0",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    color: isSelected ? "white" : isToday ? "var(--accent)" : "var(--ink)",
                  }}
                >
                  {day}
                </span>
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[32px]">
                  {dayEvents.slice(0, 3).map((e) => {
                    const et = getType(e.type);
                    return (
                      <span
                        key={e.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isSelected ? "white" : et.color }}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--panel)", border: "2px solid var(--accent)" }}
        >
          <p className="font-bold text-base">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </p>
          {selectedEvents.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No events on this day.</p>
          ) : (
            selectedEvents.map((e) => {
              const et = getType(e.type);
              return (
                <div key={e.id} className="flex items-start gap-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: et.color + "20" }}
                  >
                    {et.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{e.title}</p>
                    {e.notes && <p className="text-sm" style={{ color: "var(--muted)" }}>{e.notes}</p>}
                  </div>
                  <button onClick={() => deleteEvent(e.id)} style={{ color: "var(--error)" }}>🗑️</button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <p className="font-bold text-lg mb-3">Upcoming Events</p>
          <div className="space-y-2">
            {upcomingEvents.map((e) => {
              const et = getType(e.type);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: et.color + "20" }}
                  >
                    {et.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{e.title}</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  <button onClick={() => deleteEvent(e.id)} style={{ color: "var(--error)" }}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
