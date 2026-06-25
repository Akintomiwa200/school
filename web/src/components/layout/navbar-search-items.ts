import { UserRole } from "@/shared";
import {
  ROLE_ROUTES,
  canRoleAccessDashboardPath,
  getSharedRoutesForRole,
} from "@/shared/permissions";
import { DASHBOARD_PAGE_META } from "@/components/dashboard/page-meta";
import { ROUTE_DESCRIPTIONS } from "./role-sidebar-config";

export type NavbarSearchItem = {
  id: string;
  label: string;
  description?: string;
  path: string;
  category: string;
  keywords?: string;
};

const EXTRA_SEARCH_ITEMS: Partial<Record<UserRole, NavbarSearchItem[]>> = {
  [UserRole.STUDENT]: [
    {
      id: "student-attendance-mark",
      label: "Mark attendance",
      description: "Check in to today's classes",
      path: "/student/attendance/mark",
      category: "Quick actions",
      keywords: "check in present absent",
    },
    {
      id: "student-fees-pay",
      label: "Pay fees",
      description: "Pay tuition and school charges",
      path: "/student/fees/pay",
      category: "Quick actions",
      keywords: "payment checkout gateway",
    },
    {
      id: "student-library-browse",
      label: "Browse library",
      description: "Free and paid books",
      path: "/student/library/books",
      category: "Quick actions",
      keywords: "books catalog read",
    },
    {
      id: "student-library-shop",
      label: "Library shop",
      description: "Order books and digital access",
      path: "/student/library/shop",
      category: "Quick actions",
      keywords: "purchase order paid",
    },
    {
      id: "student-library-pay",
      label: "Library checkout",
      description: "Pay for shop items",
      path: "/student/library/pay",
      category: "Quick actions",
      keywords: "payment gateway order",
    },
    {
      id: "student-library-shelf",
      label: "My shelf",
      description: "Owned and bookmarked books",
      path: "/student/library/my-books",
      category: "Quick actions",
      keywords: "owned reading progress",
    },
    {
      id: "student-online-classes",
      label: "Online classes",
      description: "Join live virtual sessions",
      path: "/student/online-classes",
      category: "Quick actions",
      keywords: "video live class meeting",
    },
    {
      id: "student-online-classes-join",
      label: "Join class with code",
      description: "Enter a meeting code",
      path: "/student/online-classes#join-code",
      category: "Quick actions",
      keywords: "meeting code zoom meet",
    },
    {
      id: "student-online-classes-live",
      label: "Live classes",
      description: "Classes happening now",
      path: "/student/online-classes/live",
      category: "Quick actions",
      keywords: "video live now",
    },
    {
      id: "chat-mary",
      label: "Mary Johnson",
      description: "Science mentor · Messages",
      path: "/shared/messages?chat=conv-mary",
      category: "Chats",
      keywords: "teacher message chat",
    },
    {
      id: "chat-james",
      label: "James Brown",
      description: "Chinese · Messages",
      path: "/shared/messages?chat=conv-james",
      category: "Chats",
      keywords: "teacher message chat",
    },
    {
      id: "chat-cs",
      label: "CS-2026 Class",
      description: "Class group chat",
      path: "/shared/messages?chat=conv-cs2026",
      category: "Chats",
      keywords: "group course",
    },
  ],
  [UserRole.PARENT]: [
    {
      id: "parent-messages-inbox",
      label: "Messages inbox",
      description: "Chat with teachers and staff",
      path: "/parent/messages",
      category: "Chats",
      keywords: "chat teacher",
    },
  ],
  [UserRole.TEACHER]: [
    {
      id: "teacher-messages",
      label: "Messages",
      description: "Chat with students and parents",
      path: "/shared/messages",
      category: "Chats",
      keywords: "inbox chat",
    },
  ],
};

function canAccessPath(role: UserRole, path: string) {
  const pathname = path.split("?")[0] ?? path;
  return canRoleAccessDashboardPath(role, pathname);
}

export function getNavbarSearchItems(role: UserRole): NavbarSearchItem[] {
  const items: NavbarSearchItem[] = [];
  const seen = new Set<string>();

  const add = (item: NavbarSearchItem) => {
    if (seen.has(item.id)) return;
    if (!canAccessPath(role, item.path)) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const route of ROLE_ROUTES[role] ?? []) {
    const meta = DASHBOARD_PAGE_META[route.path];
    add({
      id: route.path,
      label: route.label,
      description: ROUTE_DESCRIPTIONS[route.path] ?? meta?.description,
      path: route.path,
      category: "Navigation",
    });
  }

  for (const route of getSharedRoutesForRole(role)) {
    const meta = DASHBOARD_PAGE_META[route.path];
    add({
      id: route.path,
      label: route.label,
      description: meta?.description,
      path: route.path,
      category: "Shared",
    });
  }

  for (const [path, meta] of Object.entries(DASHBOARD_PAGE_META)) {
    add({
      id: path,
      label: meta.title,
      description: meta.description,
      path,
      category: "Pages",
    });
  }

  for (const extra of EXTRA_SEARCH_ITEMS[role] ?? []) {
    add(extra);
  }

  return items;
}

export function filterNavbarSearchItems(
  items: NavbarSearchItem[],
  query: string,
  limit = 8,
) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return items.slice(0, limit);
  }

  const scored = items
    .map((item) => {
      const label = item.label.toLowerCase();
      const description = (item.description ?? "").toLowerCase();
      const keywords = (item.keywords ?? "").toLowerCase();
      const path = item.path.toLowerCase();

      let score = 0;
      if (label.startsWith(trimmed)) score += 100;
      else if (label.includes(trimmed)) score += 60;
      if (description.includes(trimmed)) score += 30;
      if (keywords.includes(trimmed)) score += 25;
      if (path.includes(trimmed)) score += 15;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label),
    );

  return scored.slice(0, limit).map((entry) => entry.item);
}
