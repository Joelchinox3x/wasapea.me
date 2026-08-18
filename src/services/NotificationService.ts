import { Platform } from "react-native";

export interface ScheduleReminderParams {
  title: string;
  body?: string;
  scheduledAt: Date;
  contactId?: string;
  phoneE164?: string;
}

let notificationsModule: typeof import("expo-notifications") | null = null;

function getNotifications(): typeof import("expo-notifications") | null {
  if (!notificationsModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      notificationsModule = require("expo-notifications");
      if (notificationsModule && notificationsModule.setNotificationHandler) {
        notificationsModule.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true
          })
        });
      }
    } catch {
      notificationsModule = null;
    }
  }
  return notificationsModule;
}

export class NotificationService {
  /**
   * Requests local notification permissions on demand.
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const Notifications = getNotifications();
      if (!Notifications) return false;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Recordatorios de Contactos",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#10B981"
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Schedules a local notification for a contact reminder.
   */
  static async scheduleReminder(params: ScheduleReminderParams): Promise<string | null> {
    try {
      const Notifications = getNotifications();
      if (!Notifications) return null;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const triggerDate = new Date(params.scheduledAt);
      const secondsFromNow = Math.max(1, Math.floor((triggerDate.getTime() - Date.now()) / 1000));

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body || "Recordatorio de WASAPEA.ME",
          data: {
            contactId: params.contactId,
            phoneE164: params.phoneE164
          },
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsFromNow
        }
      });

      return notificationId;
    } catch {
      return null;
    }
  }

  /**
   * Cancels a scheduled local notification.
   */
  static async cancelReminder(notificationId: string): Promise<boolean> {
    try {
      if (!notificationId) return false;
      const Notifications = getNotifications();
      if (!Notifications) return false;

      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch {
      return false;
    }
  }
}
