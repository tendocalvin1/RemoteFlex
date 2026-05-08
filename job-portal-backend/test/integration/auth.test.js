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

before(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

after(async () => {
  await disconnectTestDB();
});

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

test("should login successfully and set auth cookies", async () => {
  // Register user first
  await request(app)
    .post("/api/users/register")
    .send({
      name: "Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

  const response = await request(app)
    .post("/api/users/login")
    .send({
      email: "calvin@example.com",
      password: "Password123!",
    });

  assert.equal(response.statusCode, 200);

  const cookies = response.headers["set-cookie"];

  assert.ok(cookies);

  const hasAccessToken = cookies.some((cookie) =>
    cookie.includes("accessToken")
  );

  const hasRefreshToken = cookies.some((cookie) =>
    cookie.includes("refreshToken")
  );

  const hasCsrfToken = cookies.some((cookie) =>
    cookie.includes("csrfToken")
  );

  assert.ok(hasAccessToken);
  assert.ok(hasRefreshToken);
  assert.ok(hasCsrfToken);

  assert.equal(
    response.body.message,
    "Login successful"
  );
});

test("should reject invalid credentials", async () => {
  await request(app)
    .post("/api/users/register")
    .send({
      name: "Calvin",
      email: "calvin@example.com",
      password: "Password123!",
      role: "job_seeker",
    });

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