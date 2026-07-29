export type ContactMessageStatus = "new" | "read" | "responded" | "archived";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};

export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "New",
  read: "Read",
  responded: "Responded",
  archived: "Archived",
};

export const CONTACT_STATUS_STYLES: Record<ContactMessageStatus, string> = {
  new: "bg-brand-orange/15 text-brand-orange",
  read: "bg-brand-blue/15 text-brand-blue",
  responded: "bg-green/15 text-green",
  archived: "bg-muted text-muted-foreground",
};
