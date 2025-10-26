import { useEffect, useState } from "react";
import { ProjectsAPI } from "./api";
import ProjectCreate from "./ProjectCreate";
import { adaptProject } from "./adapters";
import "./App.css";

function App() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null); // 👈 missing before

    useEffect(() => {
        (async () => {
            try {
                const data = await ProjectsAPI.list();
                const items = Array.isArray(data) ? data : (data?.content ?? []);
                console.log("RAW projects:", items);
                const adapted = items.map(adaptProject);
                console.log("ADAPTED projects:", adapted);
                setProjects(adapted);
            } catch (e) {
                setError(e.message);
            }
        })();
    }, []);


    async function handleCreate(payload) {
        try {
            const created = await ProjectsAPI.create(payload);
            const item = adaptProject(created);

            // If backend didn’t echo back the name clearly, fall back to what you typed
            if (!item.name || item.name.startsWith("(untitled")) {
                if (payload?.name && payload.name.trim().length > 0) {
                    item.name = payload.name.trim();
                }
            }

            setProjects(prev => (prev ? [item, ...prev] : [item]));
        } catch (e) {
            setError(e.message);
        }
    }


    return (
        <div className="container">
            <h1 className="title">HourTracker (Frontend)</h1>
            <p className="muted small">
                Fetching from: <code>{import.meta.env.VITE_API_URL}</code>
            </p>

            <ProjectCreate onCreate={handleCreate} />

            {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
            {!projects && !error && <p>Loading projects…</p>}

            {Array.isArray(projects) && projects.length === 0 && (
                <p className="muted">No projects yet.</p>
            )}

            {Array.isArray(projects) && projects.length > 0 && (
                <ul className="list">
                    {projects.map((p) => (
                        <li
                            key={p.id}
                            className="card"
                            onClick={() => setSelected(p)}
                            style={{ cursor: "pointer" }}
                        >
                            {/* TITLE = project name */}
                            <div className="card-title">{p.name}</div>

                            {/* META = client + active */}
                            <div className="muted small">
                                Client: {p.clientName ?? "—"} · Active: {String(p.active)}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {selected && (
                <div className="card" style={{ marginTop: 12 }}>
                    <div className="card-title">Selected project</div>
                    <div className="muted small">
                        #{selected.id} — {selected.name}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
