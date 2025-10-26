const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// A small helper to make requests
async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    if (res.status === 204) return undefined;
    return res.json();
}

// A simple API for our projects
export const ProjectsAPI = {
    list: () => request("/api/projects"),
};
