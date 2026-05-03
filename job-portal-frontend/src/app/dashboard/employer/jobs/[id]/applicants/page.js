"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useProtectedRoute } from "@/hooks";
import { DashboardSkeleton } from "@/components/skeletons/JobSkeletons";

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "reviewed", label: "Reviewed", color: "bg-blue-100 text-blue-700" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
];

export default function ApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useProtectedRoute("employer");
  const queryClient = useQueryClient();
  const [expandedApplicantId, setExpandedApplicantId] = useState(null);

  // Fetch job details
  const { data: jobData, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await api.get(`/jobs/job/${id}`);
      return res.data;
    },
    enabled: isAuthenticated && !!id,
  });

  // Fetch applicants for this job
  const { data: applicantsData, isLoading: isLoadingApplicants } = useQuery({
    queryKey: ["jobApplicants", id],
    queryFn: async () => {
      const res = await api.get(`/applications/${id}/applications`);
      return res.data;
    },
    enabled: isAuthenticated && !!id,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }) => {
      const res = await api.patch(`/applications/update/${applicationId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplicants", id] });
    },
  });

  if (!isAuthenticated) return null;

  const isLoading = isLoadingJob || isLoadingApplicants;
  const job = jobData?.job;
  const applicants = applicantsData?.applications || [];

  const getStatusColor = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || status;
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 text-sm hover:underline mb-2"
            >
              ← Back
            </button>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">
              Job applicants
            </p>
            {job && (
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                {job.title} at {job.companyName}
              </h1>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{applicants.length}</p>
            <p className="text-sm text-gray-600">Total applications</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <DashboardSkeleton />}

        {/* Empty State */}
        {!isLoading && applicants.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-400 mb-4">No applicants yet.</p>
            <p className="text-sm text-gray-500">
              When candidates apply to this job, they will appear here.
            </p>
          </div>
        )}

        {/* Applicants List */}
        {!isLoading && applicants.length > 0 && (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant._id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Main Applicant Card */}
                <div className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Applicant Info */}
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {applicant.userId?.avatar ? (
                          <img
                            src={applicant.userId.avatar}
                            alt={applicant.userId.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          applicant.userId?.name?.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {applicant.userId?.name || "Unknown Applicant"}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {applicant.userId?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied {new Date(applicant.appliedAt).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(applicant.appliedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      {/* Current Status */}
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${getStatusColor(
                          applicant.status
                        )}`}
                      >
                        {getStatusLabel(applicant.status)}
                      </span>

                      {/* Expand Toggle */}
                      <button
                        onClick={() =>
                          setExpandedApplicantId(
                            expandedApplicantId === applicant._id
                              ? null
                              : applicant._id
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium"
                      >
                        {expandedApplicantId === applicant._id ? "Hide" : "View"} Details
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedApplicantId === applicant._id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      {/* Bio Section */}
                      {applicant.userId?.bio && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            About
                          </h4>
                          <p className="text-sm text-gray-700">{applicant.userId.bio}</p>
                        </div>
                      )}

                      {/* Resume Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Resume
                        </h4>
                        {applicant.userId?.resumeUrl ? (
                          <a
                            href={applicant.userId.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            📄 Download Resume
                            <span className="text-xs">↗</span>
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No resume uploaded
                          </p>
                        )}
                      </div>

                      {/* Application Notes */}
                      {applicant.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Application Notes
                          </h4>
                          <p className="text-sm text-gray-700">{applicant.notes}</p>
                        </div>
                      )}

                      {/* Status Update Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Update Status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: applicant._id,
                                  status: option.value,
                                })
                              }
                              disabled={
                                updateStatusMutation.isPending ||
                                applicant.status === option.value
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                applicant.status === option.value
                                  ? `${option.color} opacity-100 cursor-default`
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              }`}
                            >
                              {updateStatusMutation.isPending &&
                              applicant.status === option.value
                                ? "Updating..."
                                : option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Contact Section */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <a
                          href={`mailto:${applicant.userId?.email}`}
                          className="flex-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 px-4 py-2 font-medium hover:bg-blue-100 transition text-center text-sm"
                        >
                          📧 Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {!isLoading && applicants.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                label: "Total Applicants",
                value: applicants.length,
                color: "text-blue-600",
              },
              {
                label: "Pending Review",
                value: applicants.filter((a) => a.status === "pending").length,
                color: "text-yellow-600",
              },
              {
                label: "Shortlisted",
                value: applicants.filter((a) => a.status === "shortlisted").length,
                color: "text-green-600",
              },
              {
                label: "Rejected",
                value: applicants.filter((a) => a.status === "rejected").length,
                color: "text-red-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
              >
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
