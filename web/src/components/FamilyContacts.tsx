import { useState } from "react";
import type { FamilyMember } from "../types";

interface Props {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
  onNavigateEmergency: () => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const EMOJIS = ["👨", "👩", "👦", "👧", "👴", "👵", "👶", "🧑", "👱", "🧔", "👸", "🤴"];
const ROLES = ["Parent", "Child", "Grandparent", "Sibling", "Aunt/Uncle", "Cousin", "Other"];

export function FamilyContacts({ members, onChange, onNavigateEmergency }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Parent");
  const [phone, setPhone] = useState("");
  const [emoji, setEmoji] = useState("👨");
  const [isEmergency, setIsEmergency] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function resetForm() {
    setName(""); setRole("Parent"); setPhone(""); setEmoji("👨"); setIsEmergency(false); setEditId(null);
  }

  function saveMember() {
    if (!name.trim() || !phone.trim()) return;
    if (editId) {
      onChange(members.map((m) =>
        m.id === editId ? { ...m, name: name.trim(), role, phone: phone.trim(), emoji, isEmergency } : m
      ));
    } else {
      const m: FamilyMember = {
        id: genId(),
        name: name.trim(),
        role,
        phone: phone.trim(),
        emoji,
        isEmergency,
      };
      onChange([...members, m]);
    }
    resetForm();
    setShowForm(false);
  }

  function startEdit(m: FamilyMember) {
    setEditId(m.id);
    setName(m.name);
    setRole(m.role);
    setPhone(m.phone);
    setEmoji(m.emoji);
    setIsEmergency(m.isEmergency || false);
    setShowForm(true);
  }

  function deleteMember(id: string) {
    onChange(members.filter((m) => m.id !== id));
  }

  function callMember(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  function messageMember(phone: string) {
    window.location.href = `sms:${phone}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          👨‍👩‍👧 Family Contacts
        </h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-base"
          style={{ background: "var(--accent)" }}
        >
          + Add
        </button>
      </div>

      {/* Emergency Banner */}
      <button
        onClick={onNavigateEmergency}
        className="w-full rounded-2xl p-4 flex items-center gap-4 transition-transform active:scale-95"
        style={{ background: "#dc262618", border: "2px solid var(--error)" }}
      >
        <span className="text-4xl">🚨</span>
        <div className="text-left">
          <p className="font-bold text-lg" style={{ color: "var(--error)" }}>Emergency Contact</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Tap to view emergency contacts</p>
        </div>
        <span className="ml-auto text-2xl" style={{ color: "var(--error)" }}>›</span>
      </button>

      {/* Add / Edit Form */}
      {showForm && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--panel)", border: "2px solid var(--accent)" }}
        >
          <p className="font-bold text-lg">{editId ? "Edit Member" : "Add Family Member"}</p>

          {/* Emoji picker */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Choose Avatar</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: emoji === e ? "var(--accent)" : "var(--line)",
                    transform: emoji === e ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <input
            type="tel"
            className="w-full rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsEmergency(!isEmergency)}
              className="w-12 h-7 rounded-full transition-all relative"
              style={{ background: isEmergency ? "var(--error)" : "var(--line)" }}
            >
              <div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all"
                style={{ left: isEmergency ? "calc(100% - 1.75rem)" : "0.125rem" }}
              />
            </div>
            <span className="font-semibold text-base">Mark as Emergency Contact</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={saveMember}
              disabled={!name.trim() || !phone.trim()}
              className="flex-1 py-3 rounded-xl font-bold text-white text-base disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {editId ? "Save Changes" : "Add Member"}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-5 py-3 rounded-xl font-bold text-base"
              style={{ background: "var(--line)", color: "var(--ink)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}>
          <p className="text-5xl mb-3">👨‍👩‍👧</p>
          <p className="text-xl font-bold mb-1">No family members yet</p>
          <p style={{ color: "var(--muted)" }}>Add your family members to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl p-4"
              style={{
                background: "var(--panel)",
                border: `1.5px solid ${m.isEmergency ? "var(--error)" : "var(--line)"}`,
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: "var(--line)" }}
                >
                  {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{m.name}</p>
                    {m.isEmergency && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: "#dc262618", color: "var(--error)" }}
                      >
                        🚨 Emergency
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{m.role} · {m.phone}</p>
                </div>
                <button
                  onClick={() => startEdit(m)}
                  className="p-2 rounded-xl"
                  style={{ color: "var(--muted)", background: "var(--line)" }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteMember(m.id)}
                  className="p-2 rounded-xl"
                  style={{ color: "var(--error)", background: "#dc262618" }}
                >
                  🗑️
                </button>
              </div>

              {/* Call / Message buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => callMember(m.phone)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-transform active:scale-95"
                  style={{ background: "#16a34a20", color: "#16a34a", border: "1.5px solid #16a34a40" }}
                >
                  📞 Call
                </button>
                <button
                  onClick={() => messageMember(m.phone)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-transform active:scale-95"
                  style={{ background: "#2563eb20", color: "#2563eb", border: "1.5px solid #2563eb40" }}
                >
                  💬 Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
