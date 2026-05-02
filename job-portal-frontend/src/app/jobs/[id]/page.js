"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import Link from "next/link";

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await api.get(`/jobs/job/${id}`);
      return res.data;
    },
  });

  const handleApply = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setApplying(true);
    setError("");
    try {
      await api.post("/applications/apply", {
        jobId: id,
        resumeUrl: user.resumeUrl || "https://example.com/resume.pdf",
        resumePublicId: "resume",
      });
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Job not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* Back */}
        <Link href="/" className="text-blue-600 text-sm hover:underline mb-6 inline-block">
          ← Back to jobs
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
                  {job.remoteType}
                </span>
                <span className="text-xs text-gray-400 capitalize">{job.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-1 text-lg">{job.companyName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-gray-900">
                ${job.salaryMin?.toLocaleString()} — ${job.salaryMax?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">{job.currency} / year</p>
            </div>
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {job.tags.map((tag) => (
                <span key={tag} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About the role</h2>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-500 mt-1">✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((res, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-500 mt-1">→</span>
                    {res}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {user?.role === "job_seeker" && (
            <button
              onClick={handleApply}
              disabled={applying || applied}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition text-lg"
            >
              {applied ? "✓ Application Submitted" : applying ? "Submitting..." : "Apply for this Job"}
            </button>
          )}

          {!user && (
            <Link
              href="/login"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition text-lg"
            >
              Login to Apply
            </Link>
          )}

        </div>
      </div>
    </main>
  );
}