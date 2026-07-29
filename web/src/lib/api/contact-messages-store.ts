import type { ContactMessage, ContactMessageStatus } from "@/lib/contact/contact-messages-data";
import { broadcastContactChange } from "./contact-events";

let messagesUpdatedAt = new Date().toISOString();

let messages: ContactMessage[] = [
  {
    id: "contact-demo-1",
    name: "Adaeze Okonkwo",
    email: "adaeze@example.com",
    subject: "Secondary school enrollment",
    message: "We would like to schedule a campus visit for Grade 7 enrollment next term.",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "contact-demo-2",
    name: "James Wilson",
    email: "j.wilson@example.com",
    subject: "Transfer student requirements",
    message: "Could you share the document checklist for a mid-year transfer into Grade 10?",
    status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

function touch(reason: string) {
  messagesUpdatedAt = new Date().toISOString();
  broadcastContactChange(reason);
}

export function getContactMessagesUpdatedAt() {
  return messagesUpdatedAt;
}

export function listContactMessages() {
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getContactMessage(id: string) {
  return messages.find((m) => m.id === id) ?? null;
}

export function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const now = new Date().toISOString();
  const record: ContactMessage = {
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  messages = [record, ...messages];
  touch("message_created");
  return record;
}

export function updateContactMessage(id: string, patch: { status?: ContactMessageStatus }) {
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return null;
  const next = {
    ...messages[index]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  messages = messages.map((m, i) => (i === index ? next : m));
  touch("message_updated");
  return next;
}
