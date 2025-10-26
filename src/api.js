const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    // If there's no body, return undefined safely
    if (res.status === 204) return undefined;

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        return res.json();
    }

    // Fallbacks (some servers return 201 with empty or text body)
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text || undefined; }
}

export const ProjectsAPI = {
    list: () => request("/api/projects"),
    create: (payload) =>
        request("/api/projects", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
};
