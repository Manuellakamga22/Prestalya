export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE = `${API_ORIGIN}/api`;

function getToken() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u).token : null;
}

async function req(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.errors?.[0] || "Erreur serveur");
  return data;
}

export const api = {
  get:    (path)        => req("GET",    path),
  post:   (path, body)  => req("POST",   path, body),
  put:    (path, body)  => req("PUT",    path, body),
  patch:  (path, body)  => req("PATCH",  path, body),
  delete: (path)        => req("DELETE", path),
};
