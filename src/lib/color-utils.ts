export function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate pastel/bright colors
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
}

export function getInitials(name: string) {
    if (!name) return "";
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
