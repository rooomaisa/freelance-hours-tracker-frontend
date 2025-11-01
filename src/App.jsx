import { useEffect, useState } from "react";
import { ProjectsAPI } from "./api";
import ProjectCreate from "./ProjectCreate";
import { adaptProject } from "./adapters";
import "./App.css";
import { adaptEntry } from "./adapters";
import { EntriesAPI } from "./api";
import EntryCreate from "./EntryCreate";
import { isInThisWeek, isInThisMonth } from "./utils/dateFilters";
import { ClientsAPI } from "./api";





function App() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState("all");



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
    const [clients, setClients] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const list = await ClientsAPI.list();
                setClients(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error(e);
                setClients([]);
            }
        })();
    }, []);


    async function handleCreate(payload) {
        try {
            const created = await ProjectsAPI.create(payload);
            const item = adaptProject(created);

            // keep your existing name fallback
            if (!item.name || item.name.startsWith("(untitled")) {
                if (payload?.name && payload.name.trim().length > 0) {
                    item.name = payload.name.trim();
                }
            }

            // 👇 NEW: if backend didn't echo clientName, infer it from the dropdown
            if (!item.clientName && payload?.clientId) {
                const select = document.querySelector("select"); // our client select
                const opt = Array.from(select?.options || []).find(
                    (o) => Number(o.value) === Number(payload.clientId)
                );
                if (opt) item.clientName = opt.textContent || null;
            }

            setProjects((prev) => (prev ? [item, ...prev] : [item]));
        } catch (e) {
            setError(e.message);
        }
    }

    async function handleSelect(project) {
        setSelected(project);
        try {
            const list = await EntriesAPI.listByProject(project.id);
            setEntries(Array.isArray(list) ? list.map(adaptEntry) : []);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDeleteEntry(entryId) {
        try {
            await EntriesAPI.delete(entryId);
            setEntries(prev => prev.filter(e => e.id !== entryId));
        } catch (e) {
            console.error(e);
            setError(String(e.message || e));
        }
    }


    const filteredEntries = (entries || []).filter(en => {
        if (filter === "all") return true;
        if (filter === "week") return isInThisWeek(en.date);
        if (filter === "month") return isInThisMonth(en.date);
        return true;
    });

    const filteredTotal = filteredEntries.reduce((sum, e) => sum + (e.hours || 0), 0);



    return (
        <div className="container">
            <h1 className="title">HourTracker (Frontend)</h1>
            <p className="muted small">
                Fetching from: <code>{import.meta.env.VITE_API_URL}</code>
            </p>

            <ProjectCreate
                onCreate={handleCreate}
                clients={clients}
                onClientsChange={setClients}/>

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
                            onClick={() => handleSelect(p)}
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

                    {/* ---- Add Entry form (date/hours/notes/billable) ---- */}
                    <EntryCreate
                        projectId={selected.id}
                        onCreate={async (payload) => {
                            const created = await EntriesAPI.create(payload);
                            const item = adaptEntry(created);
                            setEntries((prev) => [item, ...(prev || [])]);
                        }}
                    />

                    {/* ---- Filter controls ---- */}
                    <div
                        className="muted small"
                        style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
                    >
                        <span>Show:</span>
                        <button
                            onClick={() => setFilter("all")}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: filter === "all" ? "1px solid #000" : "1px solid #ddd",
                                background: filter === "all" ? "#000" : "#fff",
                                color: filter === "all" ? "#fff" : "#000",
                                cursor: "pointer",
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("week")}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: filter === "week" ? "1px solid #000" : "1px solid #ddd",
                                background: filter === "week" ? "#000" : "#fff",
                                color: filter === "week" ? "#fff" : "#000",
                                cursor: "pointer",
                            }}
                        >
                            This week
                        </button>
                        <button
                            onClick={() => setFilter("month")}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: filter === "month" ? "1px solid #000" : "1px solid #ddd",
                                background: filter === "month" ? "#000" : "#fff",
                                color: filter === "month" ? "#fff" : "#000",
                                cursor: "pointer",
                            }}
                        >
                            This month
                        </button>
                    </div>

                    {/* ---- Totals + Entries list (filtered) ---- */}
                    {filteredEntries.length > 0 ? (
                        <>
                            <div className="muted small" style={{ marginTop: 8 }}>
                                Total: {filteredTotal.toFixed(2)} h
                                {filter !== "all" && <span> (filtered)</span>}
                            </div>

                            <ul className="list" style={{ marginTop: 8 }}>
                                {filteredEntries.map((en) => (
                                    <li
                                        key={en.id}
                                        className="card"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "120px 80px 1fr 90px 36px",
                                            gap: 8,
                                            alignItems: "center",
                                        }}
                                    >
                                        <div className="muted small">{en.date || "—"}</div>
                                        <div className="card-title" style={{ margin: 0 }}>
                                            {typeof en.hours === "number" ? en.hours.toFixed(2) : en.hours}h
                                        </div>
                                        <div className="muted">{en.notes || "(no notes)"}</div>
                                        <div className="muted small">
                                            {en.billable ? "Billable" : "Non-billable"}
                                        </div>

                                        <button
                                            onClick={() => handleDeleteEntry(en.id)}
                                            title="Delete entry"
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: 8,
                                                background: "#fff",
                                                cursor: "pointer",
                                                padding: 6,
                                                lineHeight: 1,
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="muted small" style={{ marginTop: 8 }}>
                            {filter === "all" ? "No entries yet." : "No entries in this range."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );


}

export default App;
