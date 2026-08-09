import type { FamilyMember } from "../types";

interface Props {
  members: FamilyMember[];
  onNavigateContacts: () => void;
}

const EMERGENCY_NUMBERS = [
  { label: "Emergency Services", number: "000", icon: "🚑", color: "#dc2626" },
  { label: "Police Non-Emergency", number: "131 444", icon: "👮", color: "#2563eb" },
  { label: "Poison Control", number: "13 11 26", icon: "☠️", color: "#7c3aed" },
];

export function EmergencyContact({ members, onNavigateContacts }: Props) {
  const emergencyMembers = members.filter((m) => m.isEmergency);

  function call(number: string) {
    window.location.href = `tel:${number.replace(/\s/g, "")}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--error)" }}>
        🚨 Emergency
      </h1>

      {/* Big Emergency Banner */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "#dc262618", border: "3px solid var(--error)" }}
      >
        <p className="text-5xl mb-2">🚨</p>
        <p className="text-2xl font-bold mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--error)" }}>
          Emergency Services
        </p>
        <p className="mb-4" style={{ color: "var(--muted)" }}>
          Call immediately in case of emergency
        </p>
        <button
          onClick={() => call("000")}
          className="w-full py-5 rounded-2xl font-bold text-white text-2xl transition-transform active:scale-95"
          style={{ background: "var(--error)" }}
        >
          📞 Call 000
        </button>
      </div>

      {/* Other Emergency Numbers */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          Emergency Numbers
        </h2>
        {EMERGENCY_NUMBERS.map(({ label, number, icon, color }) => (
          <button
            key={number}
            onClick={() => call(number)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-95"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          >
            <span
              className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
              style={{ background: color + "20" }}
            >
              {icon}
            </span>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "var(--ink)" }}>{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{number}</p>
            </div>
            <span className="text-xl">📞</span>
          </button>
        ))}
      </div>

      {/* Family Emergency Contacts */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          Family Emergency Contacts
        </h2>
        {emergencyMembers.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center border"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          >
            <p className="text-3xl mb-2">👥</p>
            <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>No emergency contacts yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Mark family members as emergency contacts in the Contacts section.
            </p>
            <button
              onClick={onNavigateContacts}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Go to Contacts
            </button>
          </div>
        ) : (
          emergencyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => call(m.phone)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-95"
              style={{ borderColor: "var(--line)", background: "var(--panel)" }}
            >
              <span className="text-3xl">{m.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--ink)" }}>{m.name}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{m.role} · {m.phone}</p>
              </div>
              <span className="text-xl">📞</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
