
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";

const categories = [
  "All",
  "engineering",
  "design",
  "marketing",
  "sales",
  "finance",
  "ops",
  "other",
];

function JobCard({ job }) {
  return (
    <Link href={`/jobs/${job._id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
                {job.remoteType}
              </span>
              <span className="text-xs text-gray-400">{job.category}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition">
              {job.title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{job.companyName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-gray-900">
              ${job.salaryMin?.toLocaleString()} — ${job.salaryMax?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{job.currency}/yr</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {job.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs", search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("keyword", search);
      if (category !== "All") params.append("category", category);
      const res = await api.get(`/jobs/get?${params.toString()}`);
      return res.data;
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Find Remote Jobs <span className="text-blue-600">Worldwide</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Connecting African talent to global remote opportunities.
          </p>
          <div className="flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {isLoading && (
          <div className="text-center py-20 text-gray-400">Loading jobs...</div>
        )}
        {isError && (
          <div className="text-center py-20 text-red-400">Failed to load jobs. Make sure the backend is running.</div>
        )}
        {data && (
          <>
            <p className="text-gray-500 text-sm mb-6">
              {data.total} remote {data.total === 1 ? "job" : "jobs"} found
            </p>
            <div className="flex flex-col gap-4">
              {data.jobs?.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
              {data.jobs?.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  No jobs found. Try a different search.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}