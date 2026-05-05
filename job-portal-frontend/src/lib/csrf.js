export function getCsrfToken() {
  if (typeof document === "undefined") {
    return null;
  }

  const tokenCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrfToken="));

  if (tokenCookie) {
    return decodeURIComponent(tokenCookie.split("=")[1]);
  }

  return window.localStorage.getItem("csrfToken");
}
