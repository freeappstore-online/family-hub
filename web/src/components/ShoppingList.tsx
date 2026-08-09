import { useState } from "react";
import type { ShoppingItem } from "../types";

interface Props {
  items: ShoppingItem[];
  onChange: (items: ShoppingItem[]) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const QUICK_ITEMS = [
  "Milk", "Bread", "Eggs", "Butter", "Cheese",
  "Apples", "Bananas", "Chicken", "Rice", "Pasta",
  "Tomatoes", "Onions", "Potatoes", "Yogurt", "Juice",
];

export function ShoppingList({ items, onChange }: Props) {
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  function addItem(name?: string) {
    const n = (name || newName).trim();
    if (!n) return;
    const item: ShoppingItem = {
      id: genId(),
      name: n,
      quantity: newQty.trim() || undefined,
      checked: false,
    };
    onChange([...items, item]);
    if (!name) {
      setNewName("");
      setNewQty("");
    }
  }

  function toggleItem(id: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }

  function deleteItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function clearChecked() {
    onChange(items.filter((i) => !i.checked));
  }

  const progress = items.length > 0 ? Math.round((checked.length / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
        🛒 Shopping List
      </h1>

      {/* Progress */}
      {items.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
        >
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-sm">
              {checked.length} of {items.length} items
            </span>
            <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>
              {progress}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--accent)" }}
            />
          </div>
          {progress === 100 && (
            <p className="text-center mt-2 font-bold text-sm" style={{ color: "var(--success)" }}>
              🎉 Shopping complete!
            </p>
          )}
        </div>
      )}

      {/* Add Item */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
      >
        <p className="font-bold text-lg">Add Item</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl px-4 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Item name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <input
            className="w-24 rounded-xl px-3 py-3 text-base"
            style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)" }}
            placeholder="Qty"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
          />
          <button
            onClick={() => addItem()}
            disabled={!newName.trim()}
            className="px-5 py-3 rounded-xl font-bold text-white text-base disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Add
          </button>
        </div>

        {/* Quick Add */}
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ITEMS.filter((qi) => !items.some((i) => i.name.toLowerCase() === qi.toLowerCase())).slice(0, 8).map((qi) => (
              <button
                key={qi}
                onClick={() => addItem(qi)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: "var(--line)", color: "var(--ink)" }}
              >
                + {qi}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Items */}
      {unchecked.length === 0 && checked.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}>
          <p className="text-5xl mb-3">🛒</p>
          <p className="text-xl font-bold mb-1">Your list is empty</p>
          <p style={{ color: "var(--muted)" }}>Add items above to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unchecked.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl p-4 transition-all"
              style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: "var(--accent)" }}
                aria-label="Check item"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">{item.name}</p>
                {item.quantity && (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>Qty: {item.quantity}</p>
                )}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 rounded-xl"
                style={{ color: "var(--error)", background: "#dc262618" }}
                aria-label="Remove item"
              >
                🗑️
              </button>
            </div>
          ))}

          {checked.length > 0 && (
            <>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  In cart ({checked.length})
                </p>
                <button
                  onClick={clearChecked}
                  className="text-sm font-bold px-3 py-1.5 rounded-xl"
                  style={{ color: "var(--error)", background: "#dc262618" }}
                >
                  Clear all
                </button>
              </div>
              {checked.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl p-4 opacity-60"
                  style={{ background: "var(--panel)", border: "1.5px solid var(--line)" }}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--success)", border: "2px solid var(--success)" }}
                    aria-label="Uncheck item"
                  >
                    <span className="text-white font-bold text-sm">✓</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base line-through">{item.name}</p>
                    {item.quantity && (
                      <p className="text-sm" style={{ color: "var(--muted)" }}>Qty: {item.quantity}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 rounded-xl"
                    style={{ color: "var(--error)", background: "#dc262618" }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
