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
}
