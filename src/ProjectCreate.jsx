import { useEffect, useState } from "react";
import { ClientsAPI } from "./api";

const NEW = "__new__";

export default function ProjectCreate({ onCreate, clients = [], onClientsChange }) {
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState("");
    const [loading, setLoading] = useState(false);


    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");


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
        // eslint-disable-next-line
    }, []);

    const canSubmit =
        name.trim().length > 0 &&
        !loading &&
        (clientId !== NEW || newName.trim().length > 0);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            setLoading(true);
            let chosenClientId = clientId ? (clientId === NEW ? null : Number(clientId)) : null;


            if (clientId === NEW) {
                const createdClient = await ClientsAPI.create({
                    name: newName.trim(),
                    email: newEmail.trim() || null,
                });

                const updated = [...(clients || []), createdClient];
                onClientsChange?.(updated);
                chosenClientId = createdClient.id;
            }


            await onCreate({
                name: name.trim(),
                active: true,
                clientId: chosenClientId,
            });


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
            className="my-3 flex flex-wrap items-start gap-2"
        >
            <input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-w-[200px] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />

            <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="min-w-[200px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                className={`min-w-[110px] rounded-xl border px-4 py-2 font-semibold transition
          ${canSubmit
                    ? "border-black bg-black text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    : "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"}`}
            >
                {loading ? "Saving…" : "Add"}
            </button>

            {/* inline new-client fields */}
            {clientId === NEW && (
                <div className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-[220px_1fr]">
                    <input
                        placeholder="New client name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <input
                        placeholder="New client email (optional)"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                </div>
            )}
        </form>
    );
}
