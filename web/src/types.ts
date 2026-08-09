export type Section =
  | "home"
  | "todo"
  | "reminders"
  | "calendar"
  | "shopping"
  | "contacts"
  | "emergency"
  | "shared"
  | "bills";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  assignedBy?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  category: "appointment" | "bill" | "shopping" | "other";
  dateTime: string;
  recurring?: "daily" | "weekly" | "monthly" | "none";
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "birthday" | "appointment" | "activity" | "event";
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  addedBy?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  emoji: string;
  isEmergency?: boolean;
}

export interface SharedTask {
  id: string;
  title: string;
  assignedTo: string;
  assignedBy: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  recurring: "none" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "yearly";
  paid: boolean;
  paidDate?: string;
  createdAt: string;
  notified?: boolean;
}
