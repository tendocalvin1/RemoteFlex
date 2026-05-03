"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/hooks";
import Link from "next/link";
import { JobDetailSkeleton } from "@/components/skeletons/JobSkeletons";

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
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

  const companyLogo = job?.companyLogo || job?.employer?.companyLogo || job?.employer?.avatar;
  const companyWebsite = job?.companyWebsite || job?.employer?.companyWebsite;
  const companyTagline = job?.companyTagline || job?.employer?.companyTagline;
  const companyDescription = job?.employer?.companyDescription;

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
    return <JobDetailSkeleton />;
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

          {/* Company branding */}
          <div className="grid gap-4 mb-8 rounded-3xl border border-gray-200 bg-slate-50 p-6 md:grid-cols-[auto_1fr]">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white border border-gray-200 overflow-hidden">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${job.companyName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {job.companyName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-semibold">
                  {job.companyName}
                </p>
                {companyTagline && (
                  <p className="mt-2 text-lg font-semibold text-gray-900">{companyTagline}</p>
                )}
              </div>
              {companyWebsite && (
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Visit company website
                </a>
              )}
              {companyDescription && (
                <p className="text-gray-600">{companyDescription}</p>
              )}
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