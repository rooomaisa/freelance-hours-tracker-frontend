import { useEffect, useState } from "react";
import { ProjectsAPI, EntriesAPI, ClientsAPI } from "./api";
import ProjectCreate from "./ProjectCreate";
import EntryCreate from "./EntryCreate";
import { adaptProject, adaptEntry } from "./adapters";
import { isInThisWeek, isInThisMonth } from "./utils/dateFilters";
import AppShell from "./components/AppShell";
import Toast from "./components/Toast";
import SummaryBar from "./components/SummaryBar";
import { useAuth } from "./auth/AuthContext";
import LoginPage from "./auth/LoginPage";




// NOTE: no App.css import — Tailwind is handling styles via index.css

export default function App() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState("all");
    const [clients, setClients] = useState([]);
    const [toast, setToast] = useState(null);




    useEffect(() => {
        (async () => {
            try {
                const data = await ProjectsAPI.list();
                const items = Array.isArray(data) ? data : (data?.content ?? []);
                setProjects(items.map(adaptProject));
            } catch (e) {
                setError(e.message);
                showToast("Could not load projects", "error");
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
                showToast("Could not load clients", "error");
            }
        })();
    }, []);


    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <LoginPage />;
    }


    async function handleCreate(payload) {
        try {
            const created = await ProjectsAPI.create(payload);
            const item = adaptProject(created);

            if (!item.name || item.name.startsWith("(untitled")) {
                if (payload?.name && payload.name.trim().length > 0) {
                    item.name = payload.name.trim();
                }
            }
            if (!item.clientName && payload?.clientId) {
                const select = document.querySelector("select");
                const opt = Array.from(select?.options || []).find(
                    (o) => Number(o.value) === Number(payload.clientId)
                );
                if (opt) item.clientName = opt.textContent || null;
            }

            setProjects((prev) => (prev ? [item, ...prev] : [item]));
            showToast(`Project “${item.name || "New project"}” created ✅`, "success");
        } catch (e) {
            setError(e.message);
            showToast("Failed to create project", "error");
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
            showToast("Entry deleted 🗑️", "success");
        } catch (e) {
            console.error(e);
            setError(String(e.message || e));
            showToast("Failed to delete entry", "error");
        }
    }

    function showToast(message, type = "success") {
        setToast({ message, type });
    }

    const filteredEntries = (entries || []).filter((en) => {
        if (filter === "all") return true;
        if (filter === "week") return isInThisWeek(en.date);
        if (filter === "month") return isInThisMonth(en.date);
        return true;
    });

    const filteredTotal = filteredEntries.reduce((sum, e) => sum + (e.hours || 0), 0);

    return (
        <AppShell>
            <div className="container-page py-6">
                {/* Mini gradient header */}
                <div className="rounded-2xl p-4 bg-gradient-to-r from-brand-50 to-transparent dark:from-brand-900/20">
                    <h1 className="section-title">HoursTracker (Frontend)</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Fetching from: <code className="font-mono">{import.meta.env.VITE_API_URL}</code>
                    </p>
                </div>

                <SummaryBar
                    projects={projects || []}
                    clients={clients || []}
                    selected={selected}
                    entries={entries || []}
                />


                <ProjectCreate
                    onCreate={handleCreate}
                    clients={clients}
                    onClientsChange={setClients}
                />

                {/* status messages */}
                {error && <p className="mt-3 text-sm text-red-600">Error: {error}</p>}
                {!projects && !error && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Loading projects…</p>}
                {Array.isArray(projects) && projects.length === 0 && (
                    <div className="card mt-4 p-8 text-center">
                        <div className="text-4xl mb-2">📝</div>
                        <div className="font-medium">No projects yet</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Create your first project using the form above.
                        </p>
                    </div>
                )}

                {/* projects list */}
                {Array.isArray(projects) && projects.length > 0 && (
                    <ul className="mt-4 grid gap-3">
                        {projects.map((p) => (
                            <li
                                key={p.id}
                                onClick={() => handleSelect(p)}
                                className="card p-4 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-200 dark:hover:ring-brand-800 transition cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    {/* avatar-ish square */}
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold">
                                        {String(p.name || "?").slice(0, 1).toUpperCase()}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="text-base font-medium">{p.name}</div>
                                            {/* brandy Active badge */}
                                            <span
                                                className={
                                                    p.active
                                                        ? "badge border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300"
                                                        : "badge-amber"
                                                }
                                            >
                    {p.active ? "Active" : "Paused"}
                  </span>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            Client: {p.clientName ?? "—"}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* selected project */}
                {selected && (
                    <div className="card mt-4 p-4">
                        <div className="text-base font-semibold">Selected project</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            #{selected.id} — {selected.name}
                        </div>

                        {/* ---- Add Entry form ---- */}
                        <EntryCreate
                            projectId={selected.id}
                            onCreate={async (payload) => {
                                try {
                                    const created = await EntriesAPI.create(payload);
                                    const item = adaptEntry(created);
                                    setEntries((prev) => [item, ...(prev || [])]);
                                    showToast("Entry added ✨", "success");
                                } catch (e) {
                                    console.error(e);
                                    showToast("Failed to add entry", "error");
                                }
                            }}
                        />


                        {/* ---- Filter controls (brand segmented) ---- */}
                        <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="text-slate-600 dark:text-slate-400">Show:</span>
                            <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 dark:bg-slate-900 dark:border-slate-700">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`px-3 h-8 rounded-lg transition ${
                                        filter === "all"
                                            ? "bg-brand-600 text-white dark:bg-brand-500 dark:text-slate-900"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter("week")}
                                    className={`px-3 h-8 rounded-lg transition ${
                                        filter === "week"
                                            ? "bg-brand-600 text-white dark:bg-brand-500 dark:text-slate-900"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    This week
                                </button>
                                <button
                                    onClick={() => setFilter("month")}
                                    className={`px-3 h-8 rounded-lg transition ${
                                        filter === "month"
                                            ? "bg-brand-600 text-white dark:bg-brand-500 dark:text-slate-900"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    This month
                                </button>
                            </div>
                        </div>

                        {/* ---- Totals + Entries list (filtered) ---- */}
                        {filteredEntries.length > 0 ? (
                            <>
                                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                    Total: {filteredTotal.toFixed(2)} h
                                    {filter !== "all" && <span> (filtered)</span>}
                                </div>

                                <ul className="mt-2 grid gap-2">
                                    {filteredEntries.map((en) => (
                                        <li
                                            key={en.id}
                                            className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 grid grid-cols-[120px_80px_1fr_100px_40px] items-center gap-2"
                                        >
                                            <div className="text-sm text-slate-600 dark:text-slate-400">{en.date || "—"}</div>
                                            <div className="text-base font-semibold m-0">
                                                {typeof en.hours === "number" ? en.hours.toFixed(2) : en.hours}h
                                            </div>
                                            <div className="text-sm text-slate-700 dark:text-slate-200">
                                                {en.notes || "(no notes)"}
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                {en.billable ? "Billable" : "Non-billable"}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEntry(en.id)}
                                                title="Delete entry"
                                                className="btn-ghost h-8 px-2"
                                            >
                                                🗑️
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                {filter === "all" ? "No entries yet." : "No entries in this range."}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

        </AppShell>

    );
}
