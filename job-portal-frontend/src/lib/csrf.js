export function getCsrfToken() {
  if (typeof document === "undefined") {
    return null;
  }

  const tokenCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrfToken="));

  return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;
}
