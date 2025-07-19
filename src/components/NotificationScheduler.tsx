import React from "react";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { loadState, saveState } from "@/lib/storage";

const NOTIFICATION_KEY = "lastNotificationHour";
const TIMEZONE = "Asia/Kolkata"; // IST

const NotificationScheduler: React.FC = () => {
  React.useEffect(() => {
    // Request notification permission
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.warn("Notification permission denied.");
          toast.warning("Notification permission denied. Hourly prompts will not appear.");
        }
      });
    } else {
      console.warn("Browser does not support notifications.");
      toast.warning("Your browser does not support notifications. Hourly prompts will not appear.");
    }

    const checkTimeAndNotify = () => {
      const now = new Date();
      const istTime = toZonedTime(now, TIMEZONE);
      const currentHourIST = istTime.getHours();
      const currentMinuteIST = istTime.getMinutes();

      // Check if it's on the hour (e.g., 8:00, 9:00, etc.)
      if (currentMinuteIST === 0) {
        // Check if it's between 8 AM and 8 PM IST (inclusive of 8 AM, exclusive of 8 PM)
        if (currentHourIST >= 8 && currentHourIST < 20) {
          const lastNotifiedHour = loadState<number>(NOTIFICATION_KEY);

          // Only send notification if it's a new hour since the last notification
          if (lastNotifiedHour !== currentHourIST) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Time for your hourly reflection!", {
                body: "What you did in the last one hour?",
                icon: "/vite.svg", // You can change this to a more relevant icon
              });
              saveState(NOTIFICATION_KEY, currentHourIST);
            }
          }
        }
      }
    };

    // Check every minute
    const intervalId = setInterval(checkTimeAndNotify, 60 * 1000); // Every 1 minute

    // Initial check on mount
    checkTimeAndNotify();

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  return null; // This component doesn't render anything visible
};

export default NotificationScheduler;