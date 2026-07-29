function normalizeHexColor(color: string) {
    const normalizedColor = color.trim().replace(/^#/, "");

    if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) {
        throw new Error(`Unsupported color format: ${color}`);
    }

    return normalizedColor.toLowerCase();
}

export function hexColorToInt(color: string) {
    return Number.parseInt(normalizeHexColor(color), 16);
}

export function intColorToHex(color: number | null | undefined) {
    if (color == null) {
        return null;
    }

    return `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
}
