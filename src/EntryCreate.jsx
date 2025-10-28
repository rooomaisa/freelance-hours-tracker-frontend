import { useState } from "react";

export default function EntryCreate({ projectId, onCreate }) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const [date, setDate] = useState(today);
    const [hours, setHours] = useState("1.0");
    const [notes, setNotes] = useState("");
    const [billable, setBillable] = useState(true);
    const [loading, setLoading] = useState(false);

    const canSubmit = projectId && Number(hours) > 0 && !!date && !loading;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        try {
            setLoading(true);
            await onCreate({
                projectId,
                date,
                hours: Number(hours),
                notes: notes?.trim() || "",
                billable,
            });
            setHours("1.0");
            setNotes("");
            setBillable(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}
              style={{ display: "grid", gap: 8, gridTemplateColumns: "140px 100px 1fr 120px 110px", alignItems: "center", marginTop: 12 }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                   style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
            <input type="number" step="0.25" min="0" value={hours} onChange={(e) => setHours(e.target.value)}
                   style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} placeholder="Hours" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes"
                   style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
            <label className="muted small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
                Billable
            </label>
            <button type="submit" disabled={!canSubmit}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #000", background: "#000", color: "#fff", fontWeight: 600 }}>
                {loading ? "Saving…" : "Add entry"}
            </button>
        </form>
    );
}
