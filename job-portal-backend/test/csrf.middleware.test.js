import assert from "node:assert/strict";
import test from "node:test";
import {
  clearCsrfToken,
  requireCsrfToken,
  setCsrfToken,
} from "../middleware/csrf.middleware.js";

function createResponse() {
  const cookies = new Map();
  const clearedCookies = [];

  return {
    statusCode: 200,
    body: null,
    cookies,
    clearedCookies,
    cookie(name, value, options) {
      cookies.set(name, { value, options });
      return this;
    },
    clearCookie(name, options) {
      clearedCookies.push({ name, options });
      return this;
    },
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

test("setCsrfToken sets a readable strict csrf cookie", () => {
  const res = createResponse();
  const token = setCsrfToken(res);
  const cookie = res.cookies.get("csrfToken");

  assert.equal(typeof token, "string");
  assert.equal(token.length, 64);
  assert.equal(cookie.value, token);
  assert.equal(cookie.options.httpOnly, false);
  assert.equal(cookie.options.sameSite, "strict");
  assert.equal(cookie.options.path, "/");
});

test("requireCsrfToken accepts matching cookie and header", () => {
  const req = {
    cookies: { csrfToken: "expected-token" },
    get(name) {
      return name === "x-csrf-token" ? "expected-token" : undefined;
    },
  };
  const res = createResponse();
  let nextCalled = false;

  requireCsrfToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("requireCsrfToken rejects missing or mismatched tokens", () => {
  const cases = [
    { cookies: {}, header: "expected-token" },
    { cookies: { csrfToken: "expected-token" }, header: undefined },
    { cookies: { csrfToken: "expected-token" }, header: "wrong-token" },
  ];

  for (const testCase of cases) {
    const req = {
      cookies: testCase.cookies,
      get(name) {
        return name === "x-csrf-token" ? testCase.header : undefined;
      },
    };
    const res = createResponse();
    let nextCalled = false;

    requireCsrfToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: "Invalid CSRF token" });
  }
});

test("clearCsrfToken clears the csrf cookie with matching options", () => {
  const res = createResponse();

  clearCsrfToken(res);

  assert.deepEqual(res.clearedCookies, [
    {
      name: "csrfToken",
      options: {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        path: "/",
      },
    },
  ]);
});
