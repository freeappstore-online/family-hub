import { useState } from "react";
import type { Section } from "./types";
import type { Task, Reminder, CalendarEvent, ShoppingItem, FamilyMember, SharedTask } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { HomeDashboard } from "./components/HomeDashboard";
import { TodoList } from "./components/TodoList";
import { Reminders } from "./components/Reminders";
import { FamilyCalendar } from "./components/FamilyCalendar";
import { ShoppingList } from "./components/ShoppingList";
import { FamilyContacts } from "./components/FamilyContacts";
import { EmergencyContact } from "./components/EmergencyContact";
import { SharedTasks } from "./components/SharedTasks";

const NAV_ITEMS: { section: Section; icon: string; label: string }[] = [
  { section: "home", icon: "🏠", label: "Home" },
  { section: "todo", icon: "✅", label: "To-Do" },
  { section: "reminders", icon: "🔔", label: "Reminders" },
  { section: "calendar", icon: "📅", label: "Calendar" },
  { section: "shopping", icon: "🛒", label: "Shopping" },
  { section: "contacts", icon: "👨‍👩‍👧", label: "Contacts" },
  { section: "emergency", icon: "🚨", label: "Emergency" },
  { section: "shared", icon: "🤝", label: "Shared" },
];

const DOCK_ITEMS: Section[] = ["home", "todo", "reminders", "shopping", "contacts"];

export default function App() {
  const [section, setSection] = useState<Section>("home");

  const [tasks, setTasks] = useLocalStorage<Task[]>("familyhub_tasks", []);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>("familyhub_reminders", []);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>("familyhub_events", []);
  const [shoppingItems, setShoppingItems] = useLocalStorage<ShoppingItem[]>("familyhub_shopping", []);
  const [familyMembers, setFamilyMembers] = useLocalStorage<FamilyMember[]>("familyhub_members", []);
  const [sharedTasks, setSharedTasks] = useLocalStorage<SharedTask[]>("familyhub_shared", []);

  function renderSection() {
    switch (section) {
      case "home":
        return (
          <HomeDashboard
            tasks={tasks}
            reminders={reminders}
            events={events}
            sharedTasks={sharedTasks}
            onNavigate={(s) => setSection(s as Section)}
          />
        );
      case "todo":
        return <TodoList tasks={tasks} onChange={setTasks} />;
      case "reminders":
        return <Reminders reminders={reminders} onChange={setReminders} />;
      case "calendar":
        return <FamilyCalendar events={events} onChange={setEvents} />;
      case "shopping":
        return <ShoppingList items={shoppingItems} onChange={setShoppingItems} />;
      case "contacts":
        return (
          <FamilyContacts
            members={familyMembers}
            onChange={setFamilyMembers}
            onNavigateEmergency={() => setSection("emergency")}
          />
        );
      case "emergency":
        return (
          <EmergencyContact
            members={familyMembers}
            onNavigateContacts={() => setSection("contacts")}
          />
        );
      case "shared":
        return (
          <SharedTasks
            tasks={sharedTasks}
            members={familyMembers}
            onChange={setSharedTasks}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex h-screen">
        <aside
          className="flex flex-col border-r h-full shrink-0"
          style={{ width: "17rem", borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <div className="p-6">
            <h1
              className="text-xl font-bold leading-tight"
              style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
            >
              🏡 Family Hub
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Your family, organized
            </p>
          </div>

          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ section: s, icon, label }) => {
              const active = section === s;
              return (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "#fff" : "var(--ink)",
                  }}
                >
                  <span className="text-lg leading-none">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 text-xs" style={{ color: "var(--muted)" }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Part of FreeAppStore — free forever
            </a>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8">{renderSection()}</main>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col h-screen md:hidden">
        <header
          className="flex items-center px-4 h-14 border-b shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <span className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
            🏡 Family Hub
          </span>
          {/* Show current section label on mobile */}
          <span className="ml-auto text-sm font-medium" style={{ color: "var(--muted)" }}>
            {NAV_ITEMS.find((n) => n.section === section)?.label}
          </span>
        </header>

        <main className="flex-1 overflow-auto p-4">{renderSection()}</main>

        <nav
          className="flex items-center justify-around h-16 border-t shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--dock)" }}
        >
          {DOCK_ITEMS.map((s) => {
            const item = NAV_ITEMS.find((n) => n.section === s)!;
            const active = section === s;
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
                style={{ color: active ? "var(--accent)" : "var(--muted)" }}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          {/* More button for non-dock sections */}
          <button
            onClick={() => {
              // Cycle through non-dock sections
              const nonDock = NAV_ITEMS.filter((n) => !DOCK_ITEMS.includes(n.section));
              const currentIdx = nonDock.findIndex((n) => n.section === section);
              const next = nonDock[(currentIdx + 1) % nonDock.length];
              setSection(next.section);
            }}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            style={{
              color: !DOCK_ITEMS.includes(section) ? "var(--accent)" : "var(--muted)",
            }}
          >
            <span className="text-xl leading-none">
              {!DOCK_ITEMS.includes(section)
                ? NAV_ITEMS.find((n) => n.section === section)?.icon
                : "⋯"}
            </span>
            <span className="text-[10px] font-medium">
              {!DOCK_ITEMS.includes(section)
                ? NAV_ITEMS.find((n) => n.section === section)?.label
                : "More"}
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
