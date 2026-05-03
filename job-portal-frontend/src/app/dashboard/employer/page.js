

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/axios";
import { useProtectedRoute } from "@/hooks";
import { DashboardSkeleton } from "@/components/skeletons/JobSkeletons";

export default function EmployerDashboard() {
  const { user, isAuthenticated } = useProtectedRoute("employer");

  const { data, isLoading, error } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: async () => {
      const res = await api.get("/jobs/mine?limit=50");
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-gray-500 mt-1">Manage your job postings</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard/employer/profile"
              className="bg-white border border-blue-200 text-blue-600 px-5 py-3 rounded-xl font-semibold transition hover:bg-blue-50"
            >
              Update Company Profile
            </Link>
            <Link
              href="/dashboard/employer/jobs/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              + Post a Job
            </Link>
          </div>
        </div>

        {/* Company branding preview */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-blue-50 border border-gray-200 flex items-center justify-center text-2xl text-blue-600">
                {user.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt="Company logo"
                    className="h-full w-full rounded-3xl object-cover"
                  />
                ) : (
                  <span>{(user.companyName || user.name)?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">
                  Employer profile
                </p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.companyName || user.name}
                </h2>
                {user.companyTagline && (
                  <p className="text-gray-500 text-sm mt-1">{user.companyTagline}</p>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/employer/profile"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Edit Branding
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {user.companyWebsite && (
              <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 text-sm text-gray-700">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Website</p>
                <p className="mt-2 break-words">{user.companyWebsite}</p>
              </div>
            )}
            {user.bio && (
              <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 text-sm text-gray-700">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">About your company</p>
                <p className="mt-2">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            {error.message || "Failed to load jobs. Please try again."}
          </div>
        )}

        {isLoading && <DashboardSkeleton />}

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

        {!isLoading && data?.jobs?.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.jobs.map((job) => (
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
        )}
      </div>
    </main>
  );
}
