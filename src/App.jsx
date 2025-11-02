import { useEffect, useState } from "react";
import { ProjectsAPI, EntriesAPI, ClientsAPI } from "./api";
import ProjectCreate from "./ProjectCreate";
import EntryCreate from "./EntryCreate";
import { adaptProject, adaptEntry } from "./adapters";
import { isInThisWeek, isInThisMonth } from "./utils/dateFilters";

// NOTE: no App.css import — Tailwind is handling styles via index.css

export default function App() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState("all");
    const [clients, setClients] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await ProjectsAPI.list();
                const items = Array.isArray(data) ? data : (data?.content ?? []);
                const adapted = items.map(adaptProject);
                setProjects(adapted);
            } catch (e) {
                setError(e.message);
            }
        })();
    }, []);

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

            // keep existing name fallback
            if (!item.name || item.name.startsWith("(untitled")) {
                if (payload?.name && payload.name.trim().length > 0) {
                    item.name = payload.name.trim();
                }
            }

            // if backend didn’t echo clientName, infer it from the dropdown
            if (!item.clientName && payload?.clientId) {
                const select = document.querySelector("select");
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
            setEntries((prev) => prev.filter((e) => e.id !== entryId));
        } catch (e) {
            console.error(e);
            setError(String(e.message || e));
        }
    }

    const filteredEntries = (entries || []).filter((en) => {
        if (filter === "all") return true;
        if (filter === "week") return isInThisWeek(en.date);
        if (filter === "month") return isInThisMonth(en.date);
        return true;
    });

    const filteredTotal = filteredEntries.reduce((sum, e) => sum + (e.hours || 0), 0);

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold tracking-tight">HoursTracker (Frontend)</h1>
            <p className="text-sm text-slate-600 mt-1">
                Fetching from: <code className="font-mono">{import.meta.env.VITE_API_URL}</code>
            </p>

            <ProjectCreate onCreate={handleCreate} clients={clients} onClientsChange={setClients} />

            {/* status messages */}
            {error && <p className="mt-3 text-sm text-red-600">Error: {error}</p>}
            {!projects && !error && <p className="mt-3 text-sm text-slate-600">Loading projects…</p>}
            {Array.isArray(projects) && projects.length === 0 && (
                <p className="mt-3 text-sm text-slate-600">No projects yet.</p>
            )}

            {/* projects list */}
            {Array.isArray(projects) && projects.length > 0 && (
                <ul className="mt-4 grid gap-3">
                    {projects.map((p) => (
                        <li
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md p-4 hover:bg-slate-50 cursor-pointer transition"
                        >
                            <div className="text-base font-medium text-slate-900">{p.name}</div>
                            <div className="text-sm text-slate-600 mt-1">
                                Client: {p.clientName ?? "—"} · Active: {String(p.active)}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* selected project */}
            {selected && (
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                    <div className="text-base font-semibold">Selected project</div>
                    <div className="text-sm text-slate-600">
                        #{selected.id} — {selected.name}
                    </div>

                    {/* ---- Add Entry form ---- */}
                    <EntryCreate
                        projectId={selected.id}
                        onCreate={async (payload) => {
                            const created = await EntriesAPI.create(payload);
                            const item = adaptEntry(created);
                            setEntries((prev) => [item, ...(prev || [])]);
                        }}
                    />

                    {/* ---- Filter controls ---- */}
                    <div className="mt-3 text-sm text-slate-700 flex items-center gap-2">
                        <span>Show:</span>
                        <button
                            onClick={() => setFilter("all")}
                            className={`h-8 rounded-lg px-3 border transition ${
                                filter === "all"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("week")}
                            className={`h-8 rounded-lg px-3 border transition ${
                                filter === "week"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            This week
                        </button>
                        <button
                            onClick={() => setFilter("month")}
                            className={`h-8 rounded-lg px-3 border transition ${
                                filter === "month"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            This month
                        </button>
                    </div>

                    {/* ---- Totals + Entries list (filtered) ---- */}
                    {filteredEntries.length > 0 ? (
                        <>
                            <div className="mt-2 text-sm text-slate-700">
                                Total: {filteredTotal.toFixed(2)} h
                                {filter !== "all" && <span> (filtered)</span>}
                            </div>

                            <ul className="mt-2 grid gap-2">
                                {filteredEntries.map((en) => (
                                    <li
                                        key={en.id}
                                        className="rounded-lg border border-slate-200 p-3 grid grid-cols-[120px_80px_1fr_100px_40px] items-center gap-2"
                                    >
                                        <div className="text-sm text-slate-600">{en.date || "—"}</div>
                                        <div className="text-base font-semibold m-0">
                                            {typeof en.hours === "number" ? en.hours.toFixed(2) : en.hours}h
                                        </div>
                                        <div className="text-sm text-slate-700">{en.notes || "(no notes)"}</div>
                                        <div className="text-xs text-slate-600">
                                            {en.billable ? "Billable" : "Non-billable"}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteEntry(en.id)}
                                            title="Delete entry"
                                            className="border border-slate-300 rounded-lg bg-white hover:bg-slate-50 p-1 leading-none"
                                        >
                                            🗑️
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="mt-2 text-sm text-slate-600">
                            {filter === "all" ? "No entries yet." : "No entries in this range."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
