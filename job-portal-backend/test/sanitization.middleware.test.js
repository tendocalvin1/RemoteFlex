import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeInput } from "../middleware/sanitization.middleware.js";

function createRequest(body) {
  return { body };
}

function createResponse() {
  return {};
}

function createNext() {
  let called = false;
  return {
    callback: () => { called = true; },
    get called() { return called; },
  };
}

test("sanitizeInput removes dangerous HTML tags from string properties", () => {
  const req = createRequest({
    name: "<script>alert('xss')</script>John",
    profile: {
      bio: "Hello <img src=x onerror=alert(1)> world",
    },
  });
  const res = createResponse();
  const next = createNext();

  sanitizeInput(req, res, next.callback);

  assert.equal(next.called, true);
  assert.equal(req.body.name, "John");
  assert.equal(req.body.profile.bio, "Hello  world");
});

test("sanitizeInput preserves allowed HTML tags", () => {
  const req = createRequest({
    bio: "I love <strong>RemoteFlex</strong> and <a href=\"https://example.com\">links</a>",
  });
  const res = createResponse();
  const next = createNext();

  sanitizeInput(req, res, next.callback);

  assert.equal(next.called, true);
  assert.equal(req.body.bio, "I love <strong>RemoteFlex</strong> and <a href=\"https://example.com\">links</a>");
});
