import { useState } from "react";

export default function ProjectCreate({ onCreate }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = name.trim().length > 0 && !loading;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        try {
            setLoading(true);
            await onCreate({ name: name.trim(), active: true });
            setName("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            <input
                placeholder="Project name"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    // quick visibility check in the console:
                    console.log("typing:", e.target.value);
                }}
                // Remove the "card" class to avoid any hidden color rules
                style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#fff",
                    color: "#111",        // force dark text
                    outlineColor: "#999", // focus outline visible
                }}
            />
            <button
                type="submit"
                disabled={!canSubmit}
                style={{
                    minWidth: 90,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #000",
                    background: "#000",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                }}
            >
                {loading ? "Saving…" : "Add"}
            </button>
        </form>
    );
}
