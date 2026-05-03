import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import io from "socket.io-client";

let socket = null;

export const useNotifications = () => {
  const { user, accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !accessToken) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    // Initialize Socket.io connection
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

      socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: {
          token: accessToken,
        },
      });

      // Register user with socket.io server
      socket.emit("register", user._id);

      // Listen for notifications
      socket.on("notification", (data) => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            timestamp: new Date(),
            ...data,
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for application status updates
      socket.on("application:statusUpdated", (data) => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "application_status_update",
            message: `Your application for "${data.jobTitle}" has been ${data.status}`,
            jobTitle: data.jobTitle,
            status: data.status,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for new job applicants (for employers)
      socket.on("job:newApplicant", (data) => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "new_applicant",
            message: `New applicant for "${data.jobTitle}": ${data.applicantName}`,
            jobTitle: data.jobTitle,
            applicantName: data.applicantName,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      socket.on("connect", () => {
        console.log("Connected to notifications server");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from notifications server");
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    }

    return () => {
      // Don't disconnect on unmount as we want to keep listening
      // The connection will be cleaned up on logout
    };
  }, [user, accessToken]);

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
