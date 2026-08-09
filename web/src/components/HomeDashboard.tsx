import type { Task, Reminder, CalendarEvent, SharedTask } from "../types";

interface Props {
  tasks: Task[];
  reminders: Reminder[];
  events: CalendarEvent[];
  sharedTasks: SharedTask[];
  onNavigate: (section: string) => void;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateTimeStr: string) {
  const d = new Date(dateTimeStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const categoryColors: Record<string, string> = {
  birthday: "#ec4899",
  appointment: "#2563eb",
  activity: "#16a34a",
  event: "#d97706",
};

const categoryIcons: Record<string, string> = {
  birthday: "🎂",
  appointment: "🏥",
  activity: "⚽",
  event: "📅",
};

export function HomeDashboard({ tasks, reminders, events, sharedTasks, onNavigate }: Props) {
  const today = todayStr();
  const now = new Date();

  const todayTasks = tasks.filter((t) => !t.completed).slice(0, 4);
  const todayReminders = reminders
    .filter((r) => !r.completed && r.dateTime.startsWith(today))
    .slice(0, 3);
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const pendingShared = sharedTasks.filter((t) => !t.completed).slice(0, 3);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning! ☀️";
    if (h < 17) return "Good afternoon! 🌤️";
    return "Good evening! 🌙";
  };

  const QuickCard = ({
    icon,
    label,
    count,
    color,
    section,
  }: {
    icon: string;
    label: string;
    count: number;
    color: string;
    section: string;
  }) => (
    <button
      onClick={() => onNavigate(section)}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-transform active:scale-95"
      style={{ background: color + "18", border: `2px solid ${color}30`, minHeight: "90px" }}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-bold" style={{ color }}>
        {count} {label}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #2563eb18, #7c3aed18)", border: "2px solid #2563eb30" }}
      >
        <p className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
          {greeting()}
        </p>
        <p className="text-base mt-1" style={{ color: "var(--muted)" }}>
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
          Quick Overview
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard icon="✅" label="Tasks Due" count={todayTasks.length} color="#2563eb" section="todo" />
          <QuickCard icon="🔔" label="Reminders" count={todayReminders.length} color="#d97706" section="reminders" />
          <QuickCard icon="📅" label="Events" count={upcomingEvents.length} color="#16a34a" section="calendar" />
          <QuickCard icon="👨‍👩‍👧" label="Shared Tasks" count={pendingShared.length} color="#ec4899" section="shared" />
        </div>
      </div>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
            🔔 Today's Reminders
          </h2>
          <div className="space-y-2">
            {todayReminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
              >
                <span className="text-2xl">
                  {r.category === "appointment" ? "🏥" : r.category === "bill" ? "💳" : r.category === "shopping" ? "🛒" : "📌"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">{r.title}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{formatTime(r.dateTime)}</p>
                </div>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: "#d9770620", color: "#d97706" }}
                >
                  Today
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {todayTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
              ✅ To-Do List
            </h2>
            <button
              onClick={() => onNavigate("todo")}
              className="text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              See all →
            </button>
          </div>
          <div className="space-y-2">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
              >
                <span className="text-xl">☐</span>
                <p className="font-medium text-base flex-1 truncate">{t.title}</p>
                {t.dueDate && (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {formatDate(t.dueDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
              📅 Upcoming Events
            </h2>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Calendar →
            </button>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
              >
                <span
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                  style={{ background: categoryColors[e.type] + "20" }}
                >
                  {categoryIcons[e.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">{e.title}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{formatDate(e.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayTasks.length === 0 && todayReminders.length === 0 && upcomingEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🏡</p>
          <p className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>
            All caught up!
          </p>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            No tasks or events for today. Enjoy your day!
          </p>
        </div>
      )}
    </div>
  );
}
