import type { Task, Reminder, CalendarEvent, SharedTask, Bill } from "../types";

interface Props {
  tasks: Task[];
  reminders: Reminder[];
  events: CalendarEvent[];
  sharedTasks: SharedTask[];
  bills: Bill[];
  onNavigate: (section: string) => void;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateTimeStr: string) {
  const d = new Date(dateTimeStr);
  return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

function daysDiff(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
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

export function HomeDashboard({ tasks, reminders, events, sharedTasks, bills, onNavigate }: Props) {
  const today = todayStr();
  const now = new Date();

  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayTasks = pendingTasks.slice(0, 4);

  const todayReminders = reminders
    .filter((r) => !r.completed && r.dateTime.startsWith(today))
    .slice(0, 3);

  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const pendingShared = sharedTasks.filter((t) => !t.completed).slice(0, 3);

  // Bills: overdue + due within 14 days
  const urgentBills = bills
    .filter((b) => !b.paid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .filter((b) => daysDiff(b.dueDate) <= 14)
    .slice(0, 4);

  const overdueBills = bills.filter((b) => !b.paid && b.dueDate < today).length;
  const dueSoonBills = bills.filter((b) => {
    if (b.paid) return false;
    const d = daysDiff(b.dueDate);
    return d >= 0 && d <= 7;
  }).length;

  // Tasks with due dates overdue
  const overdueTaskCount = pendingTasks.filter((t) => t.dueDate && t.dueDate < today).length;

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning! ☀️";
    if (h < 17) return "Good afternoon! 👋";
    return "Good evening! 🌙";
  };

  const Section = ({
    title,
    icon,
    nav,
    children,
    badge,
    badgeColor,
  }: {
    title: string;
    icon: string;
    nav: string;
    children: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }) => (
    <div
      className="rounded-2xl p-5 border"
      style={{ borderColor: "var(--line)", background: "var(--panel)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "Fraunces, serif" }}>
          {icon} {title}
          {badge !== undefined && badge > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
              style={{ background: badgeColor || "var(--accent)" }}
            >
              {badge}
            </span>
          )}
        </h2>
        <button
          onClick={() => onNavigate(nav)}
          className="text-xs font-semibold px-3 py-1 rounded-lg"
          style={{ color: "var(--accent)", background: "var(--accent)" + "18" }}
        >
          View all
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Greeting */}
      <div>
        <p className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
          {greeting()}
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Alert strip */}
      {(overdueBills > 0 || overdueTaskCount > 0) && (
        <div
          className="rounded-2xl p-4 flex flex-wrap gap-3"
          style={{ background: "#dc262612", border: "1.5px solid #dc262640" }}
        >
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "#dc2626" }}>Needs your attention</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {[
                overdueBills > 0 && `${overdueBills} overdue bill${overdueBills !== 1 ? "s" : ""}`,
                overdueTaskCount > 0 && `${overdueTaskCount} overdue task${overdueTaskCount !== 1 ? "s" : ""}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Bills widget */}
      {(urgentBills.length > 0 || overdueBills > 0 || dueSoonBills > 0) && (
        <Section
          title="Bills"
          icon="💳"
          nav="bills"
          badge={overdueBills + dueSoonBills}
          badgeColor={overdueBills > 0 ? "#dc2626" : "#d97706"}
        >
          <div className="space-y-2">
            {urgentBills.map((bill) => {
              const diff = daysDiff(bill.dueDate);
              const isOverdue = diff < 0;
              const isDueSoon = diff >= 0 && diff <= 7;
              const color = isOverdue ? "#dc2626" : isDueSoon ? "#d97706" : "var(--muted)";
              return (
                <div
                  key={bill.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: isOverdue ? "#dc262610" : isDueSoon ? "#d9770610" : "var(--paper)" }}
                >
                  <span className="text-lg">{isOverdue ? "🔴" : isDueSoon ? "🟡" : "🔵"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--ink)" }}>{bill.name}</p>
                    <p className="text-xs" style={{ color }}>
                      {isOverdue
                        ? `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`
                        : diff === 0
                        ? "Due TODAY"
                        : `Due in ${diff} day${diff !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <span className="font-bold text-sm shrink-0" style={{ color }}>{formatAmount(bill.amount)}</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Tasks */}
      <Section
        title="To-Do"
        icon="✅"
        nav="todo"
        badge={overdueTaskCount}
        badgeColor="#dc2626"
      >
        {todayTasks.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {pendingTasks.length === 0 ? "All caught up! 🎉" : "No tasks — add some to get started."}
          </p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => {
              const isOverdue = task.dueDate && task.dueDate < today;
              return (
                <div key={task.id} className="flex items-center gap-2">
                  <span className="text-base">
                    {isOverdue ? "🔴" : task.dueDate ? "📅" : "◻️"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs" style={{ color: isOverdue ? "#dc2626" : "var(--muted)" }}>
                        {isOverdue ? `Overdue · ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate)}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {pendingTasks.length > 4 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                +{pendingTasks.length - 4} more tasks
              </p>
            )}
          </div>
        )}
      </Section>

      {/* Reminders */}
      {todayReminders.length > 0 && (
        <Section title="Today's Reminders" icon="🔔" nav="reminders">
          <div className="space-y-2">
            {todayReminders.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                  {formatTime(r.dateTime)}
                </span>
                <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{r.title}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Section title="Upcoming Events" icon="📅" nav="calendar">
          <div className="space-y-2">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <span
                  className="text-lg w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
                  style={{ background: categoryColors[e.type] + "20" }}
                >
                  {categoryIcons[e.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{e.title}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{formatDate(e.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Shared Tasks */}
      {pendingShared.length > 0 && (
        <Section title="Shared Tasks" icon="🤝" nav="shared">
          <div className="space-y-2">
            {pendingShared.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold text-white shrink-0"
                  style={{
                    background:
                      t.priority === "high" ? "#dc2626" : t.priority === "medium" ? "#d97706" : "#16a34a",
                  }}
                >
                  {t.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{t.title}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>→ {t.assignedTo}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* All clear */}
      {urgentBills.length === 0 &&
        todayTasks.length === 0 &&
        todayReminders.length === 0 &&
        upcomingEvents.length === 0 &&
        pendingShared.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center border"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          >
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>All clear!</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Nothing urgent today. Enjoy your day!
            </p>
          </div>
        )}
    </div>
  );
}
