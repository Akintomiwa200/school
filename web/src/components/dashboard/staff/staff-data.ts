import { Bus, Home, Package, ClipboardCheck } from "lucide-react";

export const STAFF_DASHBOARD_STATS = [
  { id: "routes", label: "Transport routes", value: "8", hint: "Active routes", tone: "purple" as const, icon: Bus },
  { id: "hostel", label: "Hostel beds", value: "156/180", hint: "Occupied", tone: "blue" as const, icon: Home },
  { id: "inventory", label: "Inventory items", value: "342", hint: "In stock", tone: "green" as const, icon: Package },
  { id: "attendance", label: "Check-ins today", value: "24", hint: "Staff present", tone: "orange" as const, icon: ClipboardCheck },
];

export const STAFF_ROUTES = [
  { id: "r1", name: "Route A — North", driver: "John Mensah", students: 42, departure: "06:45", status: "on_time" as const },
  { id: "r2", name: "Route B — East", driver: "Paul Osei", students: 38, departure: "07:00", status: "delayed" as const },
  { id: "r3", name: "Route C — West", driver: "Mary Adjei", students: 35, departure: "06:50", status: "on_time" as const },
];

export const STAFF_HOSTEL_ROOMS = [
  { id: "h1", block: "Boys Block A", room: "A-101", beds: 4, occupied: 4, status: "full" as const },
  { id: "h2", block: "Boys Block A", room: "A-102", beds: 4, occupied: 3, status: "available" as const },
  { id: "h3", block: "Girls Block B", room: "B-201", beds: 4, occupied: 4, status: "full" as const },
];

export const STAFF_INVENTORY = [
  { id: "i1", item: "A4 Paper (ream)", category: "Stationery", quantity: 48, location: "Store A", status: "in_stock" as const },
  { id: "i2", item: "Science lab beakers", category: "Lab equipment", quantity: 12, location: "Science store", status: "low" as const },
  { id: "i3", item: "Sports cones", category: "Sports", quantity: 0, location: "Sports shed", status: "out" as const },
];

export const STAFF_ATTENDANCE = [
  { id: "sa1", group: "Transport team", date: "2026-03-06", present: 6, absent: 1, marked: true },
  { id: "sa2", group: "Hostel wardens", date: "2026-03-06", present: 4, absent: 0, marked: true },
  { id: "sa3", group: "General staff", date: "2026-03-06", present: 14, absent: 2, marked: false },
];
