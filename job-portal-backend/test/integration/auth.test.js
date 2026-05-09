import { User } from "../../models/users.models.js";
import test, { before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../../app.js";
import {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
} from "../setup.js";

// -----------------------------------------------------------------------------
// Test Database Lifecycle
// -----------------------------------------------------------------------------
before(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

after(async () => {
  await disconnectTestDB();
});

// -----------------------------------------------------------------------------
// Registration Tests
// -----------------------------------------------------------------------------
test("should register a new user successfully", async () => {
  const response = await request(app)
    .post("/api/users/register")
    .send({
      name: "Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

  assert.equal(response.statusCode, 201);

  assert.equal(
    response.body.message,
    "Registration successful. Please check your email to verify your account."
  );
});

test("should reject duplicate email registration", async () => {
  await request(app)
    .post("/api/users/register")
    .send({
      name: "Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

  const response = await request(app)
    .post("/api/users/register")
    .send({
      name: "Another Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

  assert.equal(response.statusCode, 400);

  assert.equal(
    response.body.error,
    "Email already registered"
  );
});

// -----------------------------------------------------------------------------
// Login Tests
// -----------------------------------------------------------------------------
test("should login successfully and set auth cookies", async () => {
  // 1. Register user
  await request(app)
    .post("/api/users/register")
    .send({
      name: "Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

  // 2. Simulate email verification
  const user = await User.findOne({ email: "calvin@example.com" });

  assert.ok(user, "User should exist after registration");

  user.isEmailVerified = true;
  await user.save();

  // 3. Login
  const response = await request(app)
    .post("/api/users/login")
    .send({
      email: "calvin@example.com",
      password: "Password123!",
    });

  // 4. Validate response
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "Login successful");

  // 5. Validate cookies
  const cookies = response.headers["set-cookie"];
  assert.ok(cookies, "Expected Set-Cookie headers to be present");

  const hasAccessToken = cookies.some((cookie) =>
    cookie.includes("accessToken")
  );

  const hasRefreshToken = cookies.some((cookie) =>
    cookie.includes("refreshToken")
  );

  const hasCsrfToken = cookies.some((cookie) =>
    cookie.includes("csrfToken")
  );

  assert.ok(hasAccessToken, "Expected accessToken cookie");
  assert.ok(hasRefreshToken, "Expected refreshToken cookie");
  assert.ok(hasCsrfToken, "Expected csrfToken cookie");
});

test("should reject invalid credentials", async () => {
  // Register user
  await request(app)
    .post("/api/users/register")
    .send({
      name: "Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

  // Verify email so password becomes the only failure condition
  const user = await User.findOne({ email: "calvin@example.com" });
  user.isEmailVerified = true;
  await user.save();

  // Attempt login with wrong password
  const response = await request(app)
    .post("/api/users/login")
    .send({
      email: "calvin@example.com",
      password: "WrongPassword123!",
    });

  assert.equal(response.statusCode, 400);

  assert.equal(
    response.body.error,
    "Invalid credentials"
  );
});

test("should reject login for non-existent user", async () => {
  const response = await request(app)
    .post("/api/users/login")
    .send({
      email: "missing@example.com",
      password: "Password123!",
    });

  assert.equal(response.statusCode, 400);

  assert.equal(
    response.body.error,
    "Invalid credentials"
  );
});