import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const preferred = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        if (preferred === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
    }, []);

    function toggle() {
        const el = document.documentElement;
        const willDark = !el.classList.contains("dark");
        el.classList.toggle("dark", willDark);
        localStorage.setItem("theme", willDark ? "dark" : "light");
        setIsDark(willDark);
    }

    return (
        <button onClick={toggle} className="btn-ghost h-9 px-3">
            {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>
    );
}
