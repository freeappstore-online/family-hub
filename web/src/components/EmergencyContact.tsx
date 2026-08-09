import type { FamilyMember } from "../types";

interface Props {
  members: FamilyMember[];
  onNavigateContacts: () => void;
}

const EMERGENCY_NUMBERS = [
  { label: "Emergency Services", number: "911", icon: "🚑", color: "#dc2626" },
  { label: "Police Non-Emergency", number: "311", icon: "👮", color: "#2563eb" },
  { label: "Poison Control", number: "1-800-222-1222", icon: "☠️", color: "#7c3aed" },
];

export function EmergencyContact({ members, onNavigateContacts }: Props) {
  const emergencyMembers = members.filter((m) => m.isEmergency);

  function call(number: string) {
    window.location.href = `tel:${number}`;
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
          onClick={() => call("911")}
          className="w-full py-5 rounded-2xl font-bold text-white text-2xl transition-transform active:scale-95"
          style={{ background: "var(--error)", fontSize: "1.5rem" }}
        >
          📞 CALL 911
        </button>
      </div>

      {/* Personal Emergency Contacts */}
      <div>
        <p className="font-bold text-xl mb-3" style={{ fontFamily: "Fraunces, serif" }}>
          My Emergency Contacts
        </p>
        {emergencyMembers.length === 0 ? (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "var(--panel)", border: "1.5px dashed var(--line)" }}
          >
            <p className="text-3xl mb-2">👥</p>
            <p className="font-semibold mb-1">No emergency contacts set</p>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Mark family members as emergency contacts in the Contacts section
            </p>
            <button
              onClick={onNavigateContacts}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              Go to Contacts →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyMembers.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl p-4"
                style={{ background: "var(--panel)", border: "2px solid var(--error)" }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                    style={{ background: "#dc262618" }}
                  >
                    {m.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-xl">{m.name}</p>
                    <p className="text-base" style={{ color: "var(--muted)" }}>{m.role}</p>
                    <p className="font-semibold text-base">{m.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => call(m.phone)}
                  className="w-full py-4 rounded-xl font-bold text-white text-xl transition-transform active:scale-95"
                  style={{ background: "var(--error)" }}
                >
                  📞 Call {m.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other Emergency Numbers */}
      <div>
        <p className="font-bold text-xl mb-3" style={{ fontFamily: "Fraunces, serif" }}>
          Important Numbers
        </p>
        <div className="space-y-3">
          {EMERGENCY_NUMBERS.map((en) => (
            <button
              key={en.number}
              onClick={() => call(en.number)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-transform active:scale-95 text-left"
              style={{
                background: en.color + "15",
                border: `2px solid ${en.color}40`,
              }}
            >
              <span className="text-4xl">{en.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-lg" style={{ color: en.color }}>
                  {en.label}
                </p>
                <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
                  {en.number}
                </p>
              </div>
              <span className="text-2xl" style={{ color: en.color }}>📞</span>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
      >
        <p className="font-bold text-base mb-3">💡 Quick Safety Tips</p>
        <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
          <li>• Stay calm and speak clearly when calling for help</li>
          <li>• Know your home address to tell emergency services</li>
          <li>• Keep this app accessible on your home screen</li>
          <li>• Share emergency contacts with all family members</li>
        </ul>
      </div>
    </div>
  );
}
