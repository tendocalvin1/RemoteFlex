import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/auth.middleware.js";
import { JWT_SECRET } from "../config/env.js";

function createRequest({ authorization, cookies } = {}) {
  return {
    headers: authorization ? { authorization } : {},
    cookies: cookies || {},
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function createNext() {
  let called = false;
  return {
    callback: () => { called = true; },
    get called() { return called; },
  };
}

test("protect middleware allows valid bearer token", () => {
  const token = jwt.sign({ id: "user123", role: "job_seeker" }, JWT_SECRET, { expiresIn: "1h" });
  const req = createRequest({ authorization: `Bearer ${token}` });
  const res = createResponse();
  const next = createNext();

  protect(req, res, next.callback);

  assert.equal(next.called, true);
  assert.equal(req.user.id, "user123");
  assert.equal(req.user.role, "job_seeker");
});

test("protect middleware allows valid access token from cookie", () => {
  const token = jwt.sign({ id: "user456", role: "employer" }, JWT_SECRET, { expiresIn: "1h" });
  const req = createRequest({ cookies: { accessToken: token } });
  const res = createResponse();
  const next = createNext();

  protect(req, res, next.callback);

  assert.equal(next.called, true);
  assert.equal(req.user.id, "user456");
  assert.equal(req.user.role, "employer");
});

test("protect middleware rejects missing token", () => {
  const req = createRequest();
  const res = createResponse();
  const next = createNext();

  protect(req, res, next.callback);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "No token provided" });
});

test("protect middleware rejects invalid token", () => {
  const req = createRequest({ authorization: "Bearer invalid.token.value" });
  const res = createResponse();
  const next = createNext();

  protect(req, res, next.callback);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Invalid or expired token" });
});
