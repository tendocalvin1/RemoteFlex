import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import io from "socket.io-client";

let socket = null;

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [socketError, setSocketError] = useState("");

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

    if (!socket) {
      socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        withCredentials: true,
      });

      socket.on("connect", () => {
        setSocketStatus("connected");
        setSocketError("");
        if (user?._id) {
          socket.emit("register", user._id);
        }
      });

      socket.on("disconnect", () => {
        setSocketStatus("disconnected");
      });

      socket.on("connect_error", (error) => {
        setSocketStatus("error");
        setSocketError(error?.message || "Unable to connect to notifications server.");
      });

      socket.on("reconnect_attempt", () => {
        setSocketStatus("connecting");
      });

      socket.on("reconnect_failed", () => {
        setSocketStatus("error");
        setSocketError("Realtime notifications are unavailable. Retrying stopped.");
      });

      socket.on("notification", (data) => {
        addNotification({
          id: Date.now(),
          timestamp: new Date(),
          ...data,
        });
      });

      socket.on("applicationStatusUpdate", (data) => {
        addNotification({
          id: Date.now(),
          type: "application_status_update",
          message: `Your application for "${data.jobTitle}" has been ${data.status}`,
          jobTitle: data.jobTitle,
          status: data.status,
          timestamp: new Date(),
        });
      });

      socket.on("job:newApplicant", (data) => {
        addNotification({
          id: Date.now(),
          type: "new_applicant",
          message: `New applicant for "${data.jobTitle}": ${data.applicantName}`,
          jobTitle: data.jobTitle,
          applicantName: data.applicantName,
          timestamp: new Date(),
        });
      });
    } else if (socket.connected && user?._id) {
      socket.emit("register", user._id);
    }

    return () => {
      if (!user && socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    socketStatus,
    socketError,
    clearNotifications,
    removeNotification,
    markAsRead,
  };
};

export const emitNotification = (eventName, data) => {
  if (socket && socket.connected) {
    socket.emit(eventName, data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
