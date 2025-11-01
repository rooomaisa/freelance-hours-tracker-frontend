import { useEffect, useState } from "react";
import { ClientsAPI } from "./api";

const NEW = "__new__";

export default function ProjectCreate({ onCreate, clients = [], onClientsChange }) {
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState(""); // "", existing id, or "__new__"
    const [loading, setLoading] = useState(false);

    // new-client fields (only shown when clientId === NEW)
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");

    // (Optional) if parent didn't provide clients yet, fetch them here as a fallback
    useEffect(() => {
        if (!clients || clients.length === 0) {
            (async () => {
                try {
                    const list = await ClientsAPI.list();
                    onClientsChange?.(list);
                } catch (e) {
                    console.error("Failed to load clients:", e);
                    onClientsChange?.([]);
                }
            })();
        }
    }, []); // eslint-disable-line

    const canSubmit =
        name.trim().length > 0 &&
        !loading &&
        (clientId !== NEW || newName.trim().length > 0); // require new client name if NEW

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            setLoading(true);
            let chosenClientId = clientId ? (clientId === NEW ? null : Number(clientId)) : null;

            // If user picked "New client…", create it first
            if (clientId === NEW) {
                const createdClient = await ClientsAPI.create({
                    name: newName.trim(),
                    email: newEmail.trim() || null,
                });
                // add to global list and select it
                const updated = [...(clients || []), createdClient];
                onClientsChange?.(updated);
                chosenClientId = createdClient.id;
            }

            // Create the project with the final clientId (may be null)
            await onCreate({
                name: name.trim(),
                active: true,
                clientId: chosenClientId,
            });

            // reset form
            setName("");
            setClientId("");
            setNewName("");
            setNewEmail("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}
        >
            <input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                    flex: "1 1 200px",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#fff",
                    color: "#111",
                }}
            />

            <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{
                    minWidth: 200,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    color: "#111",
                    appearance: "auto",
                    cursor: "pointer",
                }}
            >
                <option value="">No client</option>
                {clients?.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
                <option value={NEW}>+ New client…</option>
            </select>

            <button
                type="submit"
                disabled={!canSubmit}
                style={{
                    minWidth: 110,
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

            {/* inline new-client fields */}
            {clientId === NEW && (
                <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 8 }}>
                    <input
                        placeholder="New client name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{
                            flex: "0 0 220px",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #ddd",
                            background: "#fff",
                            color: "#111",
                        }}
                    />
                    <input
                        placeholder="New client email (optional)"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        style={{
                            flex: "1 1 240px",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #ddd",
                            background: "#fff",
                            color: "#111",
                        }}
                    />
                </div>
            )}
        </form>
    );
}
