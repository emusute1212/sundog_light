export type BeforeLogoutCleanup = () => void;

const beforeLogoutCleanups = new Set<BeforeLogoutCleanup>();

export function registerBeforeLogoutCleanup(
    cleanup: BeforeLogoutCleanup
): () => void {
    beforeLogoutCleanups.add(cleanup);

    return () => {
        beforeLogoutCleanups.delete(cleanup);
    };
}

export function runBeforeLogoutCleanups(): void {
    for (const cleanup of [...beforeLogoutCleanups]) {
        try {
            cleanup();
        } catch (error) {
            console.error("Failed to clean up before logout:", error);
        }
    }
}
