export function adaptProject(raw) {
    // try multiple possible fields for the project title
    const rawName =
        raw?.name ??
        raw?.projectName ??
        raw?.title ??
        raw?.project?.name ?? // in case project is nested for some reason
        null;

    const name = rawName && String(rawName).trim().length > 0
        ? String(rawName).trim()
        : `(untitled project #${raw?.id ?? "?"})`;

    const clientName =
        raw?.clientName ??
        raw?.client?.name ??
        null;

    return {
        id: raw?.id,
        name,
        clientName,
        active: Boolean(raw?.active),
    };



// Normalize backend -> UI shape for a time entry
    export function adaptEntry(raw) {
        return {
            id: raw?.id,
            // your backend may return projectId or a nested project object
            projectId: raw?.projectId ?? raw?.project?.id ?? null,
            date: raw?.date ?? null,                                    // 'YYYY-MM-DD'
            hours: typeof raw?.hours === "number" ? raw.hours : Number(raw?.hours || 0),
            notes: raw?.notes ?? "",
            billable: Boolean(raw?.billable),
        };
    }

}
