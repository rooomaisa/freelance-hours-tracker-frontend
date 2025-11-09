import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        const ok = login(username, password, remember);
        if (!ok) setError("Invalid credentials (try admin / 1234)");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900/60 backdrop-blur shadow-lg rounded-2xl p-6 w-[320px] flex flex-col gap-3 border border-slate-200 dark:border-slate-800"
            >
                <h1 className="text-xl font-semibold text-center">HoursTracker Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                />

                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-black focus:ring-0"
                    />
                    Remember me
                </label>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button type="submit" className="btn-primary mt-1 py-2 rounded-xl">
                    Login
                </button>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                    Demo creds: <span className="font-mono">admin / 1234</span>
                </p>
            </form>
        </div>
    );
}
