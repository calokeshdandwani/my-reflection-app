import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { utcToZonedTime } from "date-fns-tz"; // Corrected import style
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";

const NOTIFICATION_PERMISSION_KEY = "notificationPermission";
const LAST_NOTIFICATION_TIME_KEY = "lastNotificationTime";

const NotificationScheduler: React.FC = () => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        saveToLocalStorage(NOTIFICATION_PERMISSION_KEY, permission);
      });
    }

    const scheduleNotification = () => {
      const now = new Date();
      const nowIST = utcToZonedTime(now, "Asia/Kolkata"); // Used utcToZonedTime directly

      const currentHourIST = nowIST.getHours();
      const currentMinutesIST = nowIST.getMinutes();

      // Check if within 8 AM to 8 PM IST (inclusive of 8 AM, exclusive of 8 PM)
      if (currentHourIST >= 8 && currentHourIST < 20) {
        const lastNotificationTime = loadFromLocalStorage(LAST_NOTIFICATION_TIME_KEY, null);
        let shouldNotify = false;

        if (lastNotificationTime) {
          const lastNotifiedDate = new Date(lastNotificationTime);
          const lastNotifiedIST = utcToZonedTime(lastNotifiedDate, "Asia/Kolkata");
          
          // Check if an hour has passed since the last notification
          // and if it's a new hour (e.g., notified at 8:05, next at 9:00, not 8:50)
          if (nowIST.getHours() !== lastNotifiedIST.getHours() || 
              (nowIST.getHours() === lastNotifiedIST.getHours() && nowIST.getMinutes() >= lastNotifiedIST.getMinutes() + 59)) { // Allow a small buffer
            shouldNotify = true;
          }
        } else {
          // If no last notification time, notify at the start of the hour or soon after
          shouldNotify = true;
        }

        if (shouldNotify && Notification.permission === "granted") {
          new Notification("Time for your reflection!", {
            body: "What did you do in the last hour?",
            icon: "/vite.svg", // You can change this to your app's icon
          });
          saveToLocalStorage(LAST_NOTIFICATION_TIME_KEY, now.toISOString());
        }
      }
    };

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set interval to check every minute (or more frequently if needed for precision)
    intervalRef.current = window.setInterval(scheduleNotification, 60 * 1000); // Check every minute

    // Run immediately on mount
    scheduleNotification();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationScheduler;