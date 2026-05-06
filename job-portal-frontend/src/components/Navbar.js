"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useNotifications } from "@/hooks";
import api from "@/lib/axios";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, socketStatus, socketError, clearNotifications, markAsRead } = useNotifications();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
      clearNotifications();
      router.push("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Remote<span className="text-gray-900">Flex</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">
            Find Jobs
          </Link>
          {user?.role === "employer" && (
            <Link href="/dashboard/employer" className="text-gray-600 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
          )}
          {user?.role === "job_seeker" && (
            <Link href="/dashboard/jobseeker" className="text-gray-600 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setShowNotifications((prev) => !prev);
                    markAsRead();
                  }}
                  aria-expanded={showNotifications}
                  aria-controls="notification-dropdown"
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition"
                  title="Notifications"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span
                    className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                      socketStatus === "connected"
                        ? "bg-emerald-500"
                        : socketStatus === "connecting"
                        ? "bg-amber-400"
                        : socketStatus === "error"
                        ? "bg-red-500"
                        : "bg-slate-400"
                    }`}
                    title={socketStatus === "connected" ? "Realtime connected" : socketStatus === "connecting" ? "Connecting..." : socketStatus === "error" ? socketError || "Connection error" : "Offline"}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div id="notification-dropdown" className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {socketStatus === "connected"
                            ? "Realtime updates are active"
                            : socketStatus === "connecting"
                            ? "Reconnecting to notifications..."
                            : socketStatus === "error"
                            ? socketError || "Realtime notifications are paused"
                            : "Realtime notifications are offline"}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-gray-500 hover:text-gray-700"
                          type="button"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 hover:bg-gray-50 transition"
                          >
                            <p className="text-sm text-gray-900 font-medium">
                              {notif.message}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500">
                              <span>
                                {new Date(notif.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-slate-600">
                                {notif.type === "new_applicant" ? "New applicant" : notif.type === "application_status_update" ? "Status update" : "Update"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="text-gray-600 text-sm hidden md:block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Post a Job
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}