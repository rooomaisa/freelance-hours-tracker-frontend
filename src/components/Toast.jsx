import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => onClose?.(), 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const color =
        type === "success"
            ? "bg-brand-600 text-white"
            : type === "error"
                ? "bg-red-600 text-white"
                : "bg-slate-700 text-white";

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-2 shadow-brand transition transform animate-slide-up ${color}`}
        >
            {message}
        </div>
    );
}

// tailwind helper for fade-up motion
const style = document.createElement("style");
style.innerHTML = `
@keyframes slide-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
`;
document.head.appendChild(style);
