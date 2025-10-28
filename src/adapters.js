export function adaptProject(raw) {
    // try multiple possible fields for the project title
    const rawName =
        raw?.name ??
        raw?.projectName ??
        raw?.title ??
        raw?.project?.name ?? // in case project is nested
        null;

    const name =
        rawName && String(rawName).trim().length > 0
            ? String(rawName).trim()
            : `(untitled project #${raw?.id ?? "?"})`;

    const clientName = raw?.clientName ?? raw?.client?.name ?? null;

    return {
        id: raw?.id,
        name,
        clientName,
        active: Boolean(raw?.active),
    };
}

// 👇 separate function — completely outside adaptProject
export function adaptEntry(raw) {
    return {
        id: raw?.id,
        projectId: raw?.projectId ?? raw?.project?.id ?? null,
        date: raw?.date ?? null, // 'YYYY-MM-DD'
        hours:
            typeof raw?.hours === "number"
                ? raw.hours
                : Number(raw?.hours || 0),
        notes: raw?.notes ?? "",
        billable: Boolean(raw?.billable),
    };
}
