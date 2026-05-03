"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth, useProtectedRoute } from "@/hooks";

const CATEGORIES = [
  "engineering",
  "design",
  "marketing",
  "sales",
  "finance",
  "ops",
  "other",
];

const REMOTE_TYPES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export default function CreateJobPage() {
  const { isAuthenticated } = useProtectedRoute("employer");
  const { user } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      companyName: "",
      companyWebsite: "",
      description: "",
      salaryMin: "",
      salaryMax: "",
      remoteType: "remote",
      location: "",
      category: "engineering",
      companyLogo: "",
      requirements: [{ value: "" }],
      responsibilities: [{ value: "" }],
      tags: "",
    },
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "requirements",
  });

  const {
    fields: responsibilityFields,
    append: appendResponsibility,
    remove: removeResponsibility,
  } = useFieldArray({
    control,
    name: "responsibilities",
  });

  const remoteType = watch("remoteType");

  if (!isAuthenticated) {
    return null;
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "remoteflex_jobs");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dujpblljj/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setValue("companyLogo", data.secure_url);
        setSuccess("Company logo uploaded successfully!");
      }
    } catch (err) {
      setServerError("Failed to upload logo. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");

    // Validate salary
    if (!data.salaryMin || !data.salaryMax) {
      setServerError("Salary range is required");
      return;
    }

    if (Number(data.salaryMax) < Number(data.salaryMin)) {
      setServerError("Max salary must be greater than min salary");
      return;
    }

    // Filter out empty requirements and responsibilities
    const filteredData = {
      ...data,
      requirements: data.requirements
        .map((r) => r.value)
        .filter((r) => r.trim() !== ""),
      responsibilities: data.responsibilities
        .map((r) => r.value)
        .filter((r) => r.trim() !== ""),
      salaryMin: Number(data.salaryMin),
      salaryMax: Number(data.salaryMax),
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "")
        : [],
    };

    // Validate location for non-remote jobs
    if (data.remoteType !== "remote" && !data.location?.trim()) {
      setServerError("Location is required for on-site and hybrid jobs");
      return;
    }

    try {
      const response = await api.post("/jobs/create", filteredData);

      setSuccess("Job posted successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard/employer");
      }, 2000);
    } catch (err) {
      setServerError(
        err.response?.data?.error || "Failed to create job. Please try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">
              Post a new job
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Create job listing</h1>
            <p className="text-gray-500 mt-2">Fill in the details to post a new job and attract candidates.</p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back
          </button>
        </div>

        {/* Alert Messages */}
        {serverError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {/* Section 1: Basic Job Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Job title <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    {...register("title", {
                      required: "Job title is required",
                      minLength: {
                        value: 5,
                        message: "Title must be at least 5 characters",
                      },
                    })}
                    placeholder="e.g., Senior Frontend Developer"
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </label>
              </div>

              {/* Company Name */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Company name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  placeholder="e.g., Tech Corp"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </label>

              {/* Company Website */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Company website
                </span>
                <input
                  type="url"
                  {...register("companyWebsite")}
                  placeholder="https://example.com"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Job Details
            </h2>

            <div className="space-y-6">
              {/* Description */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Job description <span className="text-red-500">*</span>
                </span>
                <textarea
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 50,
                      message: "Description must be at least 50 characters",
                    },
                  })}
                  placeholder="Describe the role, responsibilities, and what success looks like..."
                  rows="6"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </label>

              {/* Requirements */}
              <div>
                <label className="block mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Requirements
                  </span>
                </label>
                <div className="space-y-3">
                  {requirementFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        type="text"
                        {...register(`requirements.${index}.value`)}
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                      />
                      {requirementFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendRequirement({ value: "" })}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  + Add requirement
                </button>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Responsibilities
                  </span>
                </label>
                <div className="space-y-3">
                  {responsibilityFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        type="text"
                        {...register(`responsibilities.${index}.value`)}
                        placeholder={`Responsibility ${index + 1}`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                      />
                      {responsibilityFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index)}
                          className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendResponsibility({ value: "" })}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  + Add responsibility
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Salary & Work Type */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Salary & Work Arrangement
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Min Salary */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Min salary (USD) <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min="0"
                  {...register("salaryMin", {
                    required: "Minimum salary is required",
                  })}
                  placeholder="0"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                />
                {errors.salaryMin && (
                  <p className="text-red-500 text-sm mt-1">{errors.salaryMin.message}</p>
                )}
              </label>

              {/* Max Salary */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Max salary (USD) <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min="0"
                  {...register("salaryMax", {
                    required: "Maximum salary is required",
                  })}
                  placeholder="0"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                />
                {errors.salaryMax && (
                  <p className="text-red-500 text-sm mt-1">{errors.salaryMax.message}</p>
                )}
              </label>

              {/* Remote Type */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Work type <span className="text-red-500">*</span>
                </span>
                <select
                  {...register("remoteType")}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                >
                  {REMOTE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Location (shown only for non-remote) */}
              {remoteType !== "remote" && (
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    {...register("location")}
                    placeholder="e.g., New York, USA"
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Section 4: Category & Tags */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Category & Tags
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Category */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </span>
                <select
                  {...register("category")}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Tags */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Tags (comma separated)
                </span>
                <input
                  type="text"
                  {...register("tags")}
                  placeholder="React, Node.js, TypeScript"
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                />
              </label>
            </div>
          </div>

          {/* Section 5: Company Branding */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Company Branding
            </h2>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Company logo
              </span>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-sm font-medium text-gray-700">
                    {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Publishing..." : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
