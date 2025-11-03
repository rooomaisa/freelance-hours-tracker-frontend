import ThemeToggle from "./ThemeToggle";

export default function AppShell({ children }) {
    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:bg-slate-900/60 dark:border-slate-800">
                <div className="container-page flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                        <span className="brand-pill">HT</span>
                        <span className="font-semibold">HoursTracker</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="container-page py-6">
                {children}
            </main>
        </div>
    );
}
