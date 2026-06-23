import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";
import type { NotificationType } from "@/shared";

async function deliverNotificationEmail(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true, firstName: true, isActive: true },
  });

  if (!user?.email || !user.isActive) {
    return;
  }

  await sendNotificationEmail({
    to: user.email,
    name: user.firstName,
    title: params.title,
    message: params.message,
    link: params.link,
  });
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  sendEmail?: boolean;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      link: params.link,
    },
  });

  if (params.sendEmail !== false) {
    void deliverNotificationEmail(params).catch((error) => {
      console.error("Notification email failed:", error);
    });
  }

  return notification;
}

export async function createBulkNotifications(
  userIds: string[],
  params: Omit<Parameters<typeof createNotification>[0], "userId">,
) {
  const result = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      link: params.link,
    })),
  });

  if (params.sendEmail !== false) {
    for (const userId of userIds) {
      void deliverNotificationEmail({ userId, ...params }).catch((error) => {
        console.error("Bulk notification email failed:", error);
      });
    }
  }

  return result;
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
