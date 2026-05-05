"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth, useProtectedRoute } from "@/hooks";

export default function EmployerProfilePage() {
  const { user, setAuth } = useAuth();
  const { isAuthenticated } = useProtectedRoute("employer");
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      companyName: "",
      companyTagline: "",
      companyDescription: "",
      companyWebsite: "",
      companyLogo: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        companyName: user.companyName || "",
        companyTagline: user.companyTagline || "",
        companyDescription: user.companyDescription || "",
        companyWebsite: user.companyWebsite || "",
        companyLogo: user.companyLogo || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  if (!isAuthenticated) {
    return null;
  }

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");

    try {
      const response = await api.patch("/users/currentUser", data);
      setAuth(response.data);
      setSuccess("Company profile updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(err.response?.data?.error || "Unable to update profile. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">
              Employer branding
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Company profile</h1>
            <p className="text-gray-500 mt-2">Share your brand with candidates and improve conversion.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/employer")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Back to dashboard
          </button>
        </div>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Company name</span>
              <input
                type="text"
                {...register("companyName")}
                placeholder="Acme Remote"
                className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.companyName && <p className="mt-2 text-sm text-red-500">{errors.companyName.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Company tagline</span>
              <input
                type="text"
                {...register("companyTagline")}
                placeholder="Remote-first teams built for growth"
                className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.companyTagline && <p className="mt-2 text-sm text-red-500">{errors.companyTagline.message}</p>}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Company description</span>
            <textarea
              rows="4"
              {...register("companyDescription")}
              placeholder="Summarize your mission, culture, and what makes your team an exceptional remote workplace."
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {errors.companyDescription && <p className="mt-2 text-sm text-red-500">{errors.companyDescription.message}</p>}
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Company website</span>
              <input
                type="url"
                {...register("companyWebsite")}
                placeholder="https://yourcompany.com"
                className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.companyWebsite && <p className="mt-2 text-sm text-red-500">{errors.companyWebsite.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Company logo URL</span>
              <input
                type="url"
                {...register("companyLogo")}
                placeholder="https://images.example.com/logo.png"
                className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.companyLogo && <p className="mt-2 text-sm text-red-500">{errors.companyLogo.message}</p>}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">About your company</span>
            <textarea
              rows="3"
              {...register("bio")}
              placeholder="Anything candidates should know about your culture, team, or hiring process."
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {errors.bio && <p className="mt-2 text-sm text-red-500">{errors.bio.message}</p>}
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">Your employer profile helps candidates understand your company before they apply.</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {isSubmitting ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
