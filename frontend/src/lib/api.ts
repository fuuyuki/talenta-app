const API_URL = "/api"; // Proxied by Nginx (and by Next.js rewrites in local dev)

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return data;
}

export async function apiFetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return apiFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/** Fetches an authenticated file and triggers a browser download. */
export async function apiDownload(endpoint: string, filename: string) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
