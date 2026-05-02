"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import api from "@/lib/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
      router.push("/");
    }
  };

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