

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/axios";
import { useProtectedRoute } from "@/hooks";

export default function EmployerDashboard() {
  const { user, isAuthenticated } = useProtectedRoute("employer");

  const { data, isLoading, error } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: async () => {
      const res = await api.get("/jobs/get");
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-gray-500 mt-1">Manage your job postings</p>
          </div>
          <Link
            href="/dashboard/employer/jobs/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            + Post a Job
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            {error.message || "Failed to load jobs. Please try again."}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Jobs Posted", value: data?.total || 0, color: "text-blue-600" },
            { label: "Active Jobs", value: data?.jobs?.filter(j => j.status === "active").length || 0, color: "text-green-600" },
            { label: "Closed Jobs", value: data?.jobs?.filter(j => j.status === "closed").length || 0, color: "text-gray-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Job Postings</h2>

          {isLoading && (
            <p className="text-gray-400 text-center py-10">Loading jobs...</p>
          )}

          {!isLoading && data?.jobs?.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">You have not posted any jobs yet.</p>
              <Link
                href="/dashboard/employer/jobs/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Post your first job
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {data?.jobs?.map((job) => (
              <div key={job._id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{job.companyName}</p>
                    <p className="text-gray-400 text-xs mt-1 capitalize">
                      {job.category} · {job.remoteType} · ${job.salaryMin?.toLocaleString()} — ${job.salaryMax?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {job.status}
                    </span>
                    <Link
                      href={`/dashboard/employer/jobs/${job._id}/applicants`}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition"
                    >
                      View Applicants
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}