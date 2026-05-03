import "../config/env.js";
import connectDB from "../config/database.js";
import { Job } from "../models/jobs.models.js";
import { User } from "../models/users.models.js";
import mongoose from "mongoose";

const demoEmployerEmail = "employer@remoteflex.demo";
const demoJobSeekerEmail = "candidate@remoteflex.demo";
const demoPassword = "DemoPass123!";

const jobs = [
  {
    title: "Senior Frontend Engineer",
    companyName: "RemoteFlex Labs",
    companyWebsite: "https://remoteflex.example",
    description:
      "Build polished candidate-facing experiences for a remote-first talent platform serving distributed teams across multiple regions.",
    requirements: [
      "Strong React and Next.js production experience",
      "Comfort owning accessibility and performance budgets",
      "Experience working with API-driven product teams",
    ],
    responsibilities: [
      "Ship high-quality dashboard and job discovery workflows",
      "Partner with backend engineers on API contracts",
      "Improve frontend reliability through tests and observability",
    ],
    salaryMin: 85000,
    salaryMax: 130000,
    currency: "USD",
    remoteType: "remote",
    location: "Worldwide",
    category: "engineering",
    tags: ["react", "nextjs", "remote", "frontend"],
    status: "active",
  },
  {
    title: "Product Designer, Remote Talent",
    companyName: "RemoteFlex Labs",
    companyWebsite: "https://remoteflex.example",
    description:
      "Design candidate and employer workflows that make remote hiring feel clear, trustworthy, and efficient from first search to offer.",
    requirements: [
      "Portfolio showing end-to-end product design work",
      "Experience designing dashboards and form-heavy workflows",
      "Strong visual craft and product reasoning",
    ],
    responsibilities: [
      "Refine job discovery and application tracking experiences",
      "Create reusable interface patterns for employer tools",
      "Collaborate with engineering on implementation details",
    ],
    salaryMin: 70000,
    salaryMax: 115000,
    currency: "USD",
    remoteType: "remote",
    location: "Africa / Europe overlap",
    category: "design",
    tags: ["product-design", "ux", "remote"],
    status: "active",
  },
];

async function upsertDemoUser(email, userData) {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create(userData);
    return user;
  }

  const { password, ...safeUpdates } = userData;
  Object.assign(user, safeUpdates);
  await user.save();
  return user;
}

async function seed() {
  await connectDB();

  const employer = await upsertDemoUser(
    demoEmployerEmail,
    {
      name: "Demo Employer",
      email: demoEmployerEmail,
      password: demoPassword,
      role: "employer",
      isEmailVerified: true,
      companyName: "RemoteFlex Labs",
      companyTagline: "Remote teams built with intention",
      companyWebsite: "https://remoteflex.example",
      companyDescription:
        "A demo company profile for reviewing RemoteFlex employer workflows.",
    }
  );

  await upsertDemoUser(
    demoJobSeekerEmail,
    {
      name: "Demo Candidate",
      email: demoJobSeekerEmail,
      password: demoPassword,
      role: "job_seeker",
      isEmailVerified: true,
      bio: "Full-stack candidate interested in remote-first product teams.",
    }
  );

  await Job.deleteMany({ employer: employer._id });
  await Job.insertMany(jobs.map((job) => ({ ...job, employer: employer._id })));

  console.log("Demo data seeded successfully.");
  console.log(`Employer: ${demoEmployerEmail} / ${demoPassword}`);
  console.log(`Candidate: ${demoJobSeekerEmail} / ${demoPassword}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Failed to seed demo data:", error);
  await mongoose.disconnect();
  process.exit(1);
});
