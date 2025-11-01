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

    // export const ClientsAPI = {
    // list: () => request("/api/clients"),
    // };

    export const EntriesAPI = {
    // list entries for a project
    listByProject: (projectId) => request(`/api/projects/${projectId}/time-entries`),

    // list entries in a date range (optional future use)
    listByDateRange: (startIsoDate, endIsoDate) =>
        request(`/api/time-entries?start=${startIsoDate}&end=${endIsoDate}`),

    // create a manual entry
    create: (payload) =>
        request("/api/time-entries", {
            method: "POST",
            body: JSON.stringify(payload), // { projectId, date, hours, notes, billable }
        }),

    // delete an entry
    delete: (entryId) =>
        request(`/api/time-entries/${entryId}`, { method: "DELETE" }),
    };

    export const ClientsAPI = {
    list: () => request("/api/clients"),
    create: (payload) =>
        request("/api/clients", {
            method: "POST",
            body: JSON.stringify(payload), // { name, email? }
        }),
    };



