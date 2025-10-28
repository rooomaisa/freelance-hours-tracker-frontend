import { useEffect, useState } from "react";
import { ClientsAPI } from "./api";

export default function ProjectCreate({ onCreate }) {
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState(""); // empty string = no client
    const [clients, setClients] = useState(null);
    const [loading, setLoading] = useState(false);

    // load clients once
    useEffect(() => {
        (async () => {
            try {
                const list = await ClientsAPI.list(); // expect [{id, name, ...}]
                setClients(list);
            } catch (e) {
                console.error("Failed to load clients", e);
                setClients([]); // still allow creating without a client
            }
        })();
    }, []);

    const canSubmit = name.trim().length > 0 && !loading;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        const payload = {
            name: name.trim(),
            active: true,
            clientId: clientId ? Number(clientId) : null, // null means no client
        };

        try {
            setLoading(true);
            await onCreate(payload); // parent handles insert/refresh
            setName("");
            setClientId("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            <input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                    flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd",
                    background: "#fff", color: "#111"
                }}
            />

            <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ minWidth: 180,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    color: "#111",
                    appearance: "auto",           // 🔹 shows native dropdown arrow
                    cursor: "pointer", }}
            >
                <option value="">No client</option>
                {clients?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            <button
                type="submit"
                disabled={!canSubmit}
                style={{
                    minWidth: 90, padding: "10px 12px", borderRadius: 8, border: "1px solid #000",
                    background: "#000", color: "#fff", fontWeight: 600,
                    cursor: canSubmit ? "pointer" : "not-allowed"
                }}
            >
                {loading ? "Saving…" : "Add"}
            </button>
        </form>
    );
}
