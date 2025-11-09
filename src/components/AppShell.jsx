import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../auth/AuthContext";


export default function AppShell({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:bg-slate-900/60 dark:border-slate-800">
                <div className="container-page flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                        <span className="brand-pill">HT</span>
                        <span className="font-semibold">HoursTracker</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle/>
                    </div>
                    <div className="flex items-center gap-3">
                        {user && (
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                            Hi, <span className="font-medium">{user.username}</span> 👋
                             </span>
                        )}
                        <button
                            onClick={logout}
                            className="text-sm rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </header>
            <main className="container-page py-6">
                {children}
            </main>
        </div>
    );
}
