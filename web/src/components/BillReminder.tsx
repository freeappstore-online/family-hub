import { useState, useEffect } from "react";
import type { Bill } from "../types";

interface Props {
  bills: Bill[];
  onChange: (bills: Bill[]) => void;
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
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
}

function nextDueDate(current: string, recurring: Bill["recurring"]): string {
  const d = new Date(current + "T00:00:00");
  switch (recurring) {
    case "weekly":       d.setDate(d.getDate() + 7); break;
    case "fortnightly":  d.setDate(d.getDate() + 14); break;
    case "monthly":      d.setMonth(d.getMonth() + 1); break;
    case "quarterly":    d.setMonth(d.getMonth() + 3); break;
    case "yearly":       d.setFullYear(d.getFullYear() + 1); break;
    default: return current;
  }
  return d.toISOString().split("T")[0];
}

function getBillStatus(bill: Bill): "paid" | "overdue" | "due-soon" | "upcoming" {
  if (bill.paid) return "paid";
  const diff = daysDiff(bill.dueDate);
  if (diff < 0) return "overdue";
  if (diff <= 7) return "due-soon";
  return "upcoming";
}

const STATUS_STYLES = {
  paid:      { bg: "#16a34a18", border: "#16a34a", text: "#16a34a", label: "Paid", icon: "✅" },
  overdue:   { bg: "#dc262618", border: "#dc2626", text: "#dc2626", label: "Overdue", icon: "🔴" },
  "due-soon":{ bg: "#d9770618", border: "#d97706", text: "#d97706", label: "Due Soon", icon: "🟡" },
  upcoming:  { bg: "var(--panel)", border: "var(--line)", text: "var(--muted)", label: "Upcoming", icon: "🔵" },
};

const RECURRING_OPTIONS: { value: Bill["recurring"]; label: string }[] = [
  { value: "none",        label: "One-off" },
  { value: "weekly",      label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly",     label: "Monthly" },
  { value: "quarterly",   label: "Quarterly" },
  { value: "yearly",      label: "Yearly" },
];

// Request notification permission and schedule a notification
async function requestAndNotify(bill: Bill) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    const diff = daysDiff(bill.dueDate);
    const msg =
      diff < 0
        ? `${bill.name} was due ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""} ago!`
        : diff === 0
        ? `${bill.name} is due TODAY!`
        : `${bill.name} is due in ${diff} day${diff !== 1 ? "s" : ""}`;
    new Notification("💳 Bill Reminder — Family Hub", {
      body: `${msg} (${formatAmount(bill.amount)})`,
      icon: "/manifest.json",
      tag: `bill-${bill.id}`,
    });
  }
}

export function BillReminder({ bills, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurring, setRecurring] = useState<Bill["recurring"]>("monthly");
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("unpaid");
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" ? Notification.permission === "granted" : false
  );

  // On mount: check for bills due soon and fire notifications
  useEffect(() => {
    if (Notification.permission !== "granted") return;
    const today = todayStr();
    bills.forEach((bill) => {
      if (bill.paid || bill.notified) return;
      const diff = daysDiff(bill.dueDate);
      if (diff <= 3 && bill.dueDate >= today) {
        requestAndNotify(bill);
        onChange(bills.map((b) => (b.id === bill.id ? { ...b, notified: true } : b)));
      } else if (diff < 0) {
        requestAndNotify(bill);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setName(""); setAmount(""); setDueDate(""); setRecurring("monthly");
  }

  function addBill() {
    if (!name.trim() || !amount || !dueDate) return;
    const bill: Bill = {
      id: genId(),
      name: name.trim(),
      amount: parseFloat(amount),
      dueDate,
      recurring,
      paid: false,
      createdAt: new Date().toISOString(),
    };
    onChange([...bills, bill]);
    resetForm();
    setShowForm(false);
  }

  function markPaid(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;

    let updated = bills.map((b) =>
      b.id === id ? { ...b, paid: true, paidDate: todayStr() } : b
    );

    // Auto-create next bill for recurring
    if (bill.recurring !== "none") {
      const next: Bill = {
        id: genId(),
        name: bill.name,
        amount: bill.amount,
        dueDate: nextDueDate(bill.dueDate, bill.recurring),
        recurring: bill.recurring,
        paid: false,
        createdAt: new Date().toISOString(),
        notified: false,
      };
      updated = [...updated, next];
    }

    onChange(updated);
  }

  function markUnpaid(id: string) {
    onChange(bills.map((b) => (b.id === id ? { ...b, paid: false, paidDate: undefined } : b)));
  }

  function deleteBill(id: string) {
    onChange(bills.filter((b) => b.id !== id));
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifGranted(result === "granted");
    if (result === "granted") {
      // Notify overdue/due-soon bills immediately
      bills.filter((b) => !b.paid).forEach((b) => {
        const diff = daysDiff(b.dueDate);
        if (diff <= 7) requestAndNotify(b);
      });
    }
  }

  const today = todayStr();
  const unpaid = bills.filter((b) => !b.paid);
  const paid = bills.filter((b) => b.paid);

  const displayed =
    filter === "unpaid" ? unpaid :
    filter === "paid"   ? paid :
    [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const overdue = unpaid.filter((b) => b.dueDate < today).length;
  const dueSoon = unpaid.filter((b) => {
    const d = daysDiff(b.dueDate);
    return d >= 0 && d <= 7;
  }).length;

  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            💳 Bills
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Track and manage your bills
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm"
          style={{ background: "var(--accent)" }}
        >
          + Add Bill
        </button>
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
              Enable bill notifications
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Get reminders before your bills are due
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-center" style={{ background: "#dc262618" }}>
          <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>{overdue}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "#dc2626" }}>Overdue</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#d9770618" }}>
          <p className="text-2xl font-bold" style={{ color: "#d97706" }}>{dueSoon}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "#d97706" }}>Due Soon</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#2563eb18" }}>
          <p className="text-lg font-bold leading-tight" style={{ color: "var(--accent)" }}>
            {formatAmount(totalUnpaid)}
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--accent)" }}>Total Owed</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["unpaid", "all", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? "var(--accent)" : "var(--panel)",
              color: filter === f ? "#fff" : "var(--ink)",
              border: filter === f ? "none" : "1px solid var(--line)",
            }}
          >
            {f === "unpaid" ? `Unpaid (${unpaid.length})` : f === "paid" ? `Paid (${paid.length})` : "All"}
          </button>
        ))}
      </div>

      {/* Bill list */}
      {displayed.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center border"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <p className="text-4xl mb-3">💳</p>
          <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>No bills here</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {filter === "paid" ? "No paid bills yet." : "Add your first bill to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed
            .sort((a, b) => {
              if (a.paid !== b.paid) return a.paid ? 1 : -1;
              return a.dueDate.localeCompare(b.dueDate);
            })
            .map((bill) => {
              const status = getBillStatus(bill);
              const style = STATUS_STYLES[status];
              const diff = daysDiff(bill.dueDate);

              return (
                <div
                  key={bill.id}
                  className="rounded-2xl p-4 border"
                  style={{ background: style.bg, borderColor: style.border }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{style.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold" style={{ color: "var(--ink)" }}>{bill.name}</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: style.border + "22", color: style.text }}
                        >
                          {style.label}
                        </span>
                        {bill.recurring !== "none" && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "var(--panel)", color: "var(--muted)", border: "1px solid var(--line)" }}
                          >
                            🔄 {bill.recurring}
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold mt-1" style={{ color: style.text }}>
                        {formatAmount(bill.amount)}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                        {bill.paid
                          ? `Paid on ${bill.paidDate ? formatDate(bill.paidDate) : "—"}`
                          : diff < 0
                          ? `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`
                          : diff === 0
                          ? "Due TODAY"
                          : `Due ${formatDate(bill.dueDate)} · in ${diff} day${diff !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {!bill.paid ? (
                      <button
                        onClick={() => markPaid(bill.id)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                        style={{ background: "#16a34a" }}
                      >
                        ✅ Mark Paid
                      </button>
                    ) : (
                      <button
                        onClick={() => markUnpaid(bill.id)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        style={{ background: "var(--panel)", color: "var(--muted)", border: "1px solid var(--line)" }}
                      >
                        ↩ Undo
                      </button>
                    )}
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                      style={{ background: "#dc262618", color: "#dc2626" }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Bill Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && (setShowForm(false), resetForm())}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "var(--paper)" }}
          >
            <h2 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
              Add Bill
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "var(--muted)" }}>
                  Bill Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electricity, Netflix, Rent…"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "var(--muted)" }}>
                  Amount (AUD) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "var(--muted)" }}>
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "var(--muted)" }}>
                  Recurring
                </label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as Bill["recurring"])}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--line)", background: "var(--panel)", color: "var(--ink)" }}
                >
                  {RECURRING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                style={{ borderColor: "var(--line)", color: "var(--ink)", background: "var(--panel)" }}
              >
                Cancel
              </button>
              <button
                onClick={addBill}
                disabled={!name.trim() || !amount || !dueDate}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                style={{ background: "var(--accent)" }}
              >
                Add Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
