import { useState } from "react";

export default function EntryCreate({ projectId, onCreate }) {
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [hours, setHours] = useState("");
    const [notes, setNotes] = useState("");
    const [billable, setBillable] = useState(true);
    const [saving, setSaving] = useState(false);

    const canSubmit =
        projectId &&
        date &&
        hours !== "" &&
        !Number.isNaN(Number(hours)) &&
        Number(hours) > 0 &&
        !saving;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            setSaving(true);
            await onCreate({
                projectId,
                date,
                hours: Number(hours),
                notes: notes.trim() || null,
                billable,
            });

            // reset light
            setHours("");
            setNotes("");
            setBillable(true);
            // keep the date at current selection for convenience
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {/* Date */}
            <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
            </div>

            {/* Hours */}
            <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">Hours</label>
                <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g. 1.5"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
            </div>

            {/* Notes */}
            <div className="flex flex-col sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1">Notes</label>
                <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="(optional)"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
            </div>

            {/* Billable + Add */}
            <div className="flex items-end gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={billable}
                        onChange={(e) => setBillable(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-black focus:ring-0"
                    />
                    Billable
                </label>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`ml-auto rounded-xl border px-4 py-2 font-semibold transition
            ${canSubmit
                        ? "border-black bg-black text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        : "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"}`}
                >
                    {saving ? "Saving…" : "Add entry"}
                </button>
            </div>
        </form>
    );
}


// import { useState } from "react";
//
// export default function EntryCreate({ projectId, onCreate }) {
//     const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//     const [date, setDate] = useState(today);
//     const [hours, setHours] = useState("1.0");
//     const [notes, setNotes] = useState("");
//     const [billable, setBillable] = useState(true);
//     const [loading, setLoading] = useState(false);
//
//     const canSubmit = projectId && Number(hours) > 0 && !!date && !loading;
//
//     async function handleSubmit(e) {
//         e.preventDefault();
//         if (!canSubmit) return;
//         try {
//             setLoading(true);
//             await onCreate({
//                 projectId,
//                 date,
//                 hours: Number(hours),
//                 notes: notes?.trim() || "",
//                 billable,
//             });
//             setHours("1.0");
//             setNotes("");
//             setBillable(true);
//         } finally {
//             setLoading(false);
//         }
//     }
//
//     return (
//         <form onSubmit={handleSubmit}
//               style={{ display: "grid", gap: 8, gridTemplateColumns: "140px 100px 1fr 120px 110px", alignItems: "center", marginTop: 12 }}>
//             <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
//                    style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
//             <input type="number" step="0.25" min="0" value={hours} onChange={(e) => setHours(e.target.value)}
//                    style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} placeholder="Hours" />
//             <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes"
//                    style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
//             <label className="muted small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                 <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
//                 Billable
//             </label>
//             <button type="submit" disabled={!canSubmit}
//                     style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #000", background: "#000", color: "#fff", fontWeight: 600 }}>
//                 {loading ? "Saving…" : "Add entry"}
//             </button>
//         </form>
//     );
// }
