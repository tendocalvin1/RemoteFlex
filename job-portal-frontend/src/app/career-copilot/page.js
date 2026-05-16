
"use client";

import { useState } from "react";
import api from "@/lib/axios";

const sampleJobs = [
  {
    job_id: "job-001",
    title: "Machine Learning Engineer",
    company: "OpenAI",
    description:
      "Looking for an engineer with Python, TensorFlow, machine learning, Docker, and cloud deployment experience.",
  },
  {
    job_id: "job-002",
    title: "Frontend Developer",
    company: "TechCorp",
    description:
      "Seeking a React developer with TypeScript, Tailwind CSS, and Next.js experience.",
  },
];

export default function CareerCopilotPage() {
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) {
      setError("Resume text must contain at least 50 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/ai-career-copilot/match", {
        resume_text: resumeText,
        jobs: sampleJobs,
      });

      setResults(response.data.data || response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to analyze your resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">AI Career Copilot</h1>
        <p className="text-gray-600 mb-8">
          Analyze your resume against job opportunities using semantic AI matching.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <label className="block text-sm font-semibold mb-2">
            Paste Your Resume Text
          </label>

          <textarea
            rows={12}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-red-600 mt-3 text-sm">{error}</p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {results?.top_matches && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Match Results ({results.total_jobs_analyzed} Jobs Analyzed)
            </h2>

            {results.top_matches.map((match) => (
              <div
                key={match.job_id}
                className="bg-white rounded-2xl shadow p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold">{match.title}</h3>
                    <p className="text-gray-500">{match.company}</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {match.match_percentage}%
                  </span>
                </div>

                <p className="text-gray-700 mb-4">
                  {match.explanation}
                </p>

                <div>
                  <h4 className="font-semibold mb-2">Missing Skills</h4>
                  {match.missing_skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {match.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-sm">
                      No major skill gaps detected.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}