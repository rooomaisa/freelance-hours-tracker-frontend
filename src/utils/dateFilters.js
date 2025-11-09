// --- ISO date helpers for filters ---

export function toDateOnly(d) {
    if (!d) return null;
    const [y, m, day] = d.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, day));
}

export function startOfThisWeek() {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
    const monday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - day));
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
}

export function endOfThisWeek() {
    const s = startOfThisWeek();
    const sunday = new Date(s);
    sunday.setUTCDate(s.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);
    return sunday;
}

export function isInThisWeek(isoDate) {
    const d = toDateOnly(isoDate);
    if (!d) return false;
    return d >= startOfThisWeek() && d <= endOfThisWeek();
}

export function isInThisMonth(isoDate) {
    const d = toDateOnly(isoDate);
    if (!d) return false;
    const now = new Date();
    return d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth();
}
