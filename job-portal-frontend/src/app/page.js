
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { JobListSkeleton } from "@/components/skeletons/JobSkeletons";

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

const remoteTypes = [
  "All",
  "remote",
  "onsite",
  "hybrid",
];

const sortOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "salaryMin", label: "Salary: Low to High" },
  { value: "salaryMax", label: "Salary: High to Low" },
  { value: "views", label: "Most Viewed" },
];

function JobCard({ job }) {
  const companyLogo = job.companyLogo || job.employer?.companyLogo || job.employer?.avatar;

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
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${job.companyName} logo`}
                  className="h-8 w-8 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 font-semibold flex items-center justify-center border border-gray-200">
                  {job.companyName?.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{job.companyName}</span>
            </div>
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
  const [remoteType, setRemoteType] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["jobs", search, category, remoteType, minSalary, maxSalary, location, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search.trim()) params.append("search", search.trim());
      if (category !== "All") params.append("category", category);
      if (remoteType !== "All") params.append("remoteType", remoteType);
      if (minSalary) params.append("minSalary", minSalary);
      if (maxSalary) params.append("maxSalary", maxSalary);
      if (location.trim()) params.append("location", location.trim());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("limit", "12");

      const res = await api.get(`/jobs/get?${params.toString()}`);
      return res.data;
    },
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setRemoteType("All");
    setMinSalary("");
    setMaxSalary("");
    setLocation("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters = search || category !== "All" || remoteType !== "All" ||
                          minSalary || maxSalary || location;

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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition"
            >
              Filters
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Advanced Filters */}
      {showFilters && (
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remote Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                <select
                  value={remoteType}
                  onChange={(e) => setRemoteType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {remoteTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, London"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={`${option.value}-desc`} value={`${option.value}-desc`}>
                      {option.label}
                    </option>
                  ))}
                  {sortOptions.filter(opt => opt.value !== 'views').map((option) => (
                    <option key={`${option.value}-asc`} value={`${option.value}-asc`}>
                      {option.label.replace('Low to High', 'High to Low').replace('High to Low', 'Low to High')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary ($)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary ($)</label>
                <input
                  type="number"
                  placeholder="150000"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Job Listings */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {isLoading && <JobListSkeleton />}
        {isError && (
          <div className="text-center py-20 text-red-400">Failed to load jobs. Make sure the backend is running.</div>
        )}
        {data && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                {data.total} remote {data.total === 1 ? "job" : "jobs"} found
                {hasActiveFilters && <span className="text-blue-600 ml-2">(filtered)</span>}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {data.jobs?.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
              {data.jobs?.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  No jobs found. Try adjusting your filters.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}