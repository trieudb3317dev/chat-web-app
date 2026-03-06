import { use } from "react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_PREFIX || ""}`;

async function apiFetch(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<any> {
  const url = `${API_BASE}${path}`;
  const opts: RequestInit = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  };

  const res = await fetch(url, opts);

  if (res.status === 401 && retry) {
    // try refresh once
    const refreshed = await fetch(`${API_BASE}/users/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      // retry original request once
      return apiFetch(path, init, false);
    }
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
    console.log("API response data:", data);
  } catch (e) {
    data = { message: text };
  }

  if (!res.ok) {
    const msg = data?.message || res.statusText || "Request failed";
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
}) {
  return apiFetch(`/users/register`, {
    method: "POST",
    body: JSON.stringify({ ...payload, username: payload.name }),
  });
}

export async function activateUser(payload: { token: string }) {
  return apiFetch(
    `/users/activate?token=${encodeURIComponent(payload.token)}`,
    {
      method: "POST",
    },
  );
}

export async function loginUser(payload: {
  username: string;
  password: string;
}) {
  return apiFetch(`/users/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser() {
  return apiFetch(`/users/logout`, { method: "POST" });
}

export async function me() {
  return apiFetch(`/users/me`, { method: "GET" });
}

export async function refreshToken() {
  return apiFetch(`/users/refresh-token`, { method: "POST" });
}

export async function updateProfile(payload: any) {
  return apiFetch(`/users/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(file: File) {
  const url = `${API_BASE}/users/upload-avatar`;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }
  if (!res.ok) {
    const msg = data?.message || res.statusText || "Upload failed";
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function resetPassword(payload: any) {
  return apiFetch(`/users/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: any) {
  return apiFetch(`/users/change-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getFriendsList(params?: {
  page?: number;
  per_page?: number;
  q?: string;
}) {
  const qparts: string[] = [];
  if (params?.page)
    qparts.push(`page=${encodeURIComponent(String(params.page))}`);
  if (params?.per_page)
    qparts.push(`per_page=${encodeURIComponent(String(params.per_page))}`);
  if (params?.q) qparts.push(`q=${encodeURIComponent(params.q)}`);
  const qs = qparts.length ? `?${qparts.join("&")}` : "";
  return apiFetch(`/friends/list${qs}`, { method: "GET" });
}

export async function getChatWith(
  id: string | number,
  params?: { page?: number; per_page?: number },
) {
  const qparts: string[] = [];
  if (params?.page)
    qparts.push(`page=${encodeURIComponent(String(params.page))}`);
  if (params?.per_page)
    qparts.push(`per_page=${encodeURIComponent(String(params.per_page))}`);
  const qs = qparts.length ? `?${qparts.join("&")}` : "";
  return apiFetch(`/chats/with/${id}${qs}`, { method: "GET" });
}

export default {
  apiFetch,
  registerUser,
  loginUser,
  logoutUser,
  me,
  refreshToken,
  updateProfile,
  uploadAvatar,
  resetPassword,
  changePassword,
  getFriendsList,
  getChatWith,
};
