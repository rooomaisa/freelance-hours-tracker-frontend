import { useMemo } from "react";
import { isInThisMonth } from "../utils/dateFilters";

export default function SummaryBar({ projects = [], clients = [], selected = null, entries = [] }) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p?.active).length;
    const totalClients = clients.length;

    // hours this month (for the currently selected project)
    const monthHoursSelected = useMemo(() => {
        return (entries || [])
            .filter(en => isInThisMonth(en.date))
            .reduce((sum, e) => sum + (e.hours || 0), 0);
    }, [entries]);

    return (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CardStat label="Projects" value={totalProjects} />
            <CardStat label="Active" value={activeProjects} />
            <CardStat label="Clients" value={totalClients} />
            <CardStat
                label={selected ? `This month · ${selected.name}` : "This month · (select project)"}
                value={selected ? monthHoursSelected.toFixed(2) + " h" : "—"}
                accent
            />
        </div>
    );
}

function CardStat({ label, value, accent = false }) {
    return (
        <div className={`card p-4 ${accent ? "ring-1 ring-brand-200 dark:ring-brand-800" : ""}`}>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
        </div>
    );
}
