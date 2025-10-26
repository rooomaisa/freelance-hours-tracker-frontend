import { useEffect, useState } from "react";
import { ProjectsAPI } from "./api";

function App() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await ProjectsAPI.list();
                console.log("Projects API response:", data);
                setProjects(data);
            } catch (e) {
                setError(e.message);
            }
        })();
    }, []);

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
            <h1>HourTracker (Frontend)</h1>
            <p>Fetching from: <code>{import.meta.env.VITE_API_URL}</code></p>

            {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
            {!projects && !error && <p>Loading projects…</p>}

            {Array.isArray(projects) && projects.length === 0 && (
                <p style={{ color: "#555" }}>No projects yet.</p>
            )}

            {Array.isArray(projects) && projects.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {projects.map((p) => (
                        <li key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginBottom: 8 }}>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            {p.client && (
                                <div style={{ color: "#666" }}>
                                    {p.client.name ?? p.client.email ?? `Client #${p.client.id}`}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;
