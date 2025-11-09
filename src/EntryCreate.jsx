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
                    className="input"
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
                    className="input"
                />
            </div>

            {/* Notes */}
            <div className="flex flex-col sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1">Notes</label>
                <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="(optional)"
                    className="input"
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
                    className={`ml-auto ${
                        canSubmit
                            ? "btn-primary"
                            : "btn cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-400"
                    }`}
                >
                    {saving ? "Saving…" : "Add entry"}
                </button>
            </div>
        </form>
    );
}
