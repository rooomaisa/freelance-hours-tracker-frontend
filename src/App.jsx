import { useEffect, useState } from "react";
import { ProjectsAPI } from "./api";
import "./App.css";


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
        <div className="container">
            <h1 className="title">HourTracker (Frontend)</h1>
            <p className="muted small">
                Fetching from: <code>{import.meta.env.VITE_API_URL}</code>
            </p>

            {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
            {!projects && !error && <p>Loading projects…</p>}

            {Array.isArray(projects) && projects.length === 0 && (
                <p className="muted">No projects yet.</p>
            )}

            {Array.isArray(projects) && projects.length > 0 && (
                <ul className="list">
                    {projects.map((p) => (
                        <li key={p.id} className="card">
                            <div className="card-title">{p.name}</div>
                            {p.client && (
                                <div className="muted">
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
