import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // try both storages to persist the session
    const initialUser = (() => {
        try {
            const savedLocal = localStorage.getItem("user");
            if (savedLocal) return JSON.parse(savedLocal);
        } catch {}
        try {
            const savedSession = sessionStorage.getItem("user");
            if (savedSession) return JSON.parse(savedSession);
        } catch {}
        return null;
    })();

    const [user, setUser] = useState(initialUser);

    function login(username, password, remember = true) {
        // fake login credentials (portfolio-friendly)
        if (username === "admin" && password === "1234") {
            const newUser = { username, role: "ADMIN" };
            setUser(newUser);
            try {
                // persist based on "remember me"
                const json = JSON.stringify(newUser);
                if (remember) {
                    localStorage.setItem("user", json);
                    sessionStorage.removeItem("user");
                } else {
                    sessionStorage.setItem("user", json);
                    localStorage.removeItem("user");
                }
            } catch {}
            return true;
        }
        return false;
    }

    function logout() {
        setUser(null);
        try {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
        } catch {}
    }

    const value = { user, login, logout, isLoggedIn: !!user };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
