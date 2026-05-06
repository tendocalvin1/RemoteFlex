"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/hooks";

export default function RegisterPage() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setError: setFieldError } = useForm();
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker");
    }
  }, [user, router]);

  useEffect(() => {
    if (!success) return;

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    if (redirectCountdown === 0) {
      router.push("/login");
    }

    return () => clearInterval(interval);
  }, [success, redirectCountdown, router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setValidationErrors([]);
    try {
      await api.post("/users/register", data);
      setSuccess("Registration successful! Please check your email to verify your account.");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.details && Array.isArray(errorData.details)) {
        setValidationErrors(errorData.details);
        errorData.details.forEach((detail) => {
          if (detail.field) {
            setFieldError(detail.field, { type: "server", message: detail.message });
          }
        });
        setError("Please fix the errors below:");
      } else {
        setError(errorData?.error || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-2">Join RemoteFlex today</p>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm"
            role="alert"
            aria-live="polite"
          >
            <p className="font-medium mb-2">{error}</p>
            {validationErrors.length > 0 && (
              <ul className="space-y-1 ml-4 list-disc">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-xs">
                    <strong>{err.field}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
            <p>{success}</p>
            <p className="mt-2 text-gray-600">Redirecting to login in {redirectCountdown} second{redirectCountdown === 1 ? "" : "s"}...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name", { required: "Name is required" })}
                placeholder="Tendo Calvin"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email", { required: "Email is required" })}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : "password-help"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
              {errors.password ? (
                <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              ) : (
                <p id="password-help" className="text-gray-500 text-xs mt-1">Use at least 8 characters and a mix of letters and numbers.</p>
              )}
              <div className="mt-3 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                <p className="font-medium mb-2">Password must include:</p>
                <ul className="space-y-1 ml-3 list-disc">
                  <li>At least 8 characters</li>
                  <li>1 uppercase letter (A-Z)</li>
                  <li>1 lowercase letter (a-z)</li>
                  <li>1 number (0-9)</li>
                  <li>1 special character (@$!%*?&)</li>
                </ul>
              </div>
            </div>

            <fieldset className="space-y-3" aria-describedby={errors.role ? "role-error" : undefined}>
              <legend className="block text-sm font-medium text-gray-700">I am a...</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400 transition">
                  <input
                    type="radio"
                    value="job_seeker"
                    {...register("role", { required: "Please select a role" })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Job Seeker</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400 transition">
                  <input
                    type="radio"
                    value="employer"
                    {...register("role", { required: "Please select a role" })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Employer</span>
                </label>
              </div>
              {errors.role && (
                <p id="role-error" className="text-red-500 text-xs mt-1">{errors.role.message}</p>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </main>
  );
}