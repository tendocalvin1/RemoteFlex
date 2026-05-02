import React from 'react';

export function JobCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
        <div className="text-right shrink-0">
          <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

export function JobListSkeleton({ count = 6 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <div className="text-right shrink-0">
            <div className="h-6 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-8">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <div className="h-6 w-28 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-center">
          <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}