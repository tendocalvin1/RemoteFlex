"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/axios";
import { useProtectedRoute } from "@/hooks";
import { DashboardSkeleton } from "@/components/skeletons/JobSkeletons";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-blue-100 text-blue-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function JobSeekerDashboard() {
  const { user, isAuthenticated } = useProtectedRoute("job_seeker");

  const { data, isLoading, error } = useQuery({
    queryKey: ["myApplications"],
    queryFn: async () => {
      const res = await api.get("/applications/getApplications");
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Track your job applications</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            {error.message || "Failed to load applications. Please try again."}
          </div>
        )}

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Applied", value: data?.total || 0, color: "text-blue-600" },
              { label: "Pending", value: data?.applications?.filter(a => a.status === "pending").length || 0, color: "text-yellow-600" },
              { label: "Shortlisted", value: data?.applications?.filter(a => a.status === "shortlisted").length || 0, color: "text-green-600" },
              { label: "Rejected", value: data?.applications?.filter(a => a.status === "rejected").length || 0, color: "text-red-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Applications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
            <Link href="/" className="text-blue-600 text-sm hover:underline">
              Browse more jobs →
            </Link>
          </div>

          {isLoading && <DashboardSkeleton />}

          {!isLoading && data?.applications?.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">You have not applied to any jobs yet.</p>
              <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                Find Jobs
              </Link>
            </div>
          )}

          {!isLoading && data?.applications?.length > 0 && (
            <div className="flex flex-col gap-4">
              {data.applications.map((app) => (
                <div key={app._id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{app.job?.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{app.job?.companyName}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}