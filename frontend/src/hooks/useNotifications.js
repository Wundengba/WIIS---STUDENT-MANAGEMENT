import { useState } from "react";
import { genId } from "../utils/helpers";
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const addNotification = (content) =>
    setNotifications(p => {
      const base = { id: genId(), time: new Date().toLocaleTimeString(), read: false };
      if (typeof content === "string") {
        return [{ ...base, msg: content }, ...p];
      } else {
        return [{ ...base, ...content }, ...p];
      }
    });
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  return { notifications, addNotification, markAllRead, unreadCount: notifications.filter(n => !n.read).length };
}
