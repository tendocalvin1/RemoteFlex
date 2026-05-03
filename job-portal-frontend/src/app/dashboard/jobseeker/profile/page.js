"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth, useProtectedRoute } from "@/hooks";

export default function JobSeekerProfilePage() {
  const { user, accessToken, setAuth } = useAuth();
  const { isAuthenticated } = useProtectedRoute("job_seeker");
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  if (!isAuthenticated) {
    return null;
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadResponse.data.imageUrl) {
        // Update user with new avatar
        const updateResponse = await api.patch("/users/currentUser", {
          avatar: uploadResponse.data.imageUrl,
        });
        setAuth(updateResponse.data, accessToken);
        setSuccess("Profile picture updated successfully!");
      }
    } catch (err) {
      setServerError("Failed to upload profile picture. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setServerError("Please upload a PDF file");
      return;
    }

    setResumeUploading(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post("/upload/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.resumeUrl) {
        // Fetch updated user data
        const userResponse = await api.get("/users/currentUser");
        setAuth(userResponse.data, accessToken);
        setSuccess("Resume uploaded successfully!");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error || "Failed to upload resume. Please try again."
      );
      console.error("Upload error:", err);
    } finally {
      setResumeUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");

    try {
      const response = await api.patch("/users/currentUser", data);
      setAuth(response.data, accessToken);
      setSuccess("Profile updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(
        err.response?.data?.error || "Unable to update profile. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">
              Your profile
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Profile & Resume</h1>
            <p className="text-gray-500 mt-2">
              Manage your profile information and upload your resume to apply for jobs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/jobseeker")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back to dashboard
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

        <div className="space-y-8">
          {/* Section 1: Profile Information */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>

            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Profile picture
                  </span>
                </label>
                <div className="flex items-end gap-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 cursor-pointer hover:border-blue-500 transition w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? "Uploading..." : "Change photo"}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, or WebP up to 2MB</p>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Full name <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </label>

                {/* Email (read-only) */}
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Email
                  </span>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-600 bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </label>

                {/* Bio */}
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Bio (Professional summary)
                  </span>
                  <textarea
                    {...register("bio", {
                      maxLength: {
                        value: 500,
                        message: "Bio cannot exceed 500 characters",
                      },
                    })}
                    placeholder="Tell employers about yourself, your skills, and what you're looking for..."
                    rows="4"
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                  />
                  {errors.bio && (
                    <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          </div>

          {/* Section 2: Resume */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resume
            </h2>

            {/* Current Resume Status */}
            {user?.resumeUrl ? (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      ✓ Resume uploaded
                    </p>
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-800 underline mt-2 inline-block"
                    >
                      View your resume
                    </a>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 mb-6">
                <p className="text-sm font-medium text-yellow-900">
                  No resume uploaded yet
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Upload your resume to make it easier for employers to review your qualifications.
                </p>
              </div>
            )}

            {/* Resume Upload */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-3">
                Upload or update resume
              </span>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeUpload}
                  disabled={resumeUploading}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-sm font-medium text-gray-700">
                    {resumeUploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF files up to 5MB
                  </p>
                </label>
              </div>
            </label>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                💡 Resume tips
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Keep it to 1-2 pages maximum</li>
                <li>Use a clear, professional format</li>
                <li>Include relevant keywords for your industry</li>
                <li>Make sure contact information is up to date</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Account Status */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Account Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Email Verification</p>
                  <p className="text-sm text-gray-500">
                    {user?.isEmailVerified
                      ? "Your email is verified"
                      : "Please verify your email to access all features"}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    user?.isEmailVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {user?.isEmailVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Applications Sent</p>
                  <p className="text-sm text-gray-500">
                    You have applied to {user?.applicationsCount || 0} job
                    {user?.applicationsCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {user?.applicationsCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
