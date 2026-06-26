export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportPriority = "low" | "normal" | "high";

export type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportPriority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
};

export const SUPPORT_CATEGORIES = [
  "General inquiry",
  "Technical issue",
  "Fees & billing",
  "Admissions",
  "Transport",
  "Other",
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1042",
    subject: "Bus route change request",
    category: "Transport",
    description: "Need to update pickup location for Alex Johnson starting next week.",
    status: "in_progress",
    priority: "normal",
    createdAt: "2026-03-04",
    updatedAt: "2026-03-05",
    assignedTo: "Transport office",
  },
  {
    id: "TKT-1038",
    subject: "Cannot access parent portal",
    category: "Technical issue",
    description: "Getting error when trying to view fee receipts on mobile.",
    status: "resolved",
    priority: "high",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-03",
    assignedTo: "IT Support",
  },
  {
    id: "TKT-1035",
    subject: "Fee payment confirmation",
    category: "Fees & billing",
    description: "Payment made on Feb 28 but balance still shows outstanding.",
    status: "open",
    priority: "normal",
    createdAt: "2026-02-28",
    updatedAt: "2026-02-28",
  },
];

export const TICKET_STATUS_STYLES: Record<SupportTicketStatus, string> = {
  open: "bg-brand-blue/15 text-brand-blue",
  in_progress: "bg-brand-orange/15 text-brand-orange",
  resolved: "bg-green/15 text-green",
  closed: "bg-muted text-muted-foreground",
};

export const TICKET_PRIORITY_STYLES: Record<SupportPriority, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-brand-blue/15 text-brand-blue",
  high: "bg-destructive/15 text-destructive",
};
