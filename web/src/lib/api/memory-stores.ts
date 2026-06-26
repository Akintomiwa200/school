import type { LeaveRequest, LeaveType } from "@/components/dashboard/leave/leave-data";
import { LEAVE_REQUESTS as INITIAL_LEAVE } from "@/components/dashboard/leave/leave-data";
import type { SupportPriority, SupportTicket } from "@/components/dashboard/support/support-data";
import { SUPPORT_TICKETS as INITIAL_TICKETS } from "@/components/dashboard/support/support-data";

let leaveRequests: LeaveRequest[] = [...INITIAL_LEAVE];
let supportTickets: SupportTicket[] = [...INITIAL_TICKETS];

export function getMutableLeaveRequests() {
  return leaveRequests;
}

export function addLeaveRequest(input: {
  type: LeaveType;
  from: string;
  to: string;
  reason: string;
}): LeaveRequest {
  const fromDate = new Date(input.from);
  const toDate = new Date(input.to);
  const days = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1);
  const request: LeaveRequest = {
    id: `lv-${Date.now()}`,
    type: input.type,
    from: input.from,
    to: input.to,
    days,
    reason: input.reason,
    status: "pending",
    submittedDate: new Date().toISOString().slice(0, 10),
  };
  leaveRequests = [request, ...leaveRequests];
  return request;
}

export function getMutableSupportTickets() {
  return supportTickets;
}

export function addSupportTicket(input: {
  subject: string;
  category: string;
  priority: SupportPriority;
  description: string;
}): SupportTicket {
  const ticket: SupportTicket = {
    id: `TKT-${1042 + supportTickets.length}`,
    subject: input.subject,
    category: input.category,
    description: input.description,
    status: "open",
    priority: input.priority,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  supportTickets = [ticket, ...supportTickets];
  return ticket;
}
