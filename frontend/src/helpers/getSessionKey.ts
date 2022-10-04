export function getSessionKey() {
  return localStorage.getItem("sessionKey") || undefined;
};