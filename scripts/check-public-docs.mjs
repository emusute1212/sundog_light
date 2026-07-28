import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { findPublicDocumentationViolations } from "./public-docs-policy.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

async function findMarkdownFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name);

            if (entry.isDirectory()) {
                return findMarkdownFiles(path);
            }

            return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
        }),
    );

    return files.flat();
}

const documentationFiles = [
    join(repositoryRoot, "AGENTS.md"),
    join(repositoryRoot, "README.md"),
    ...(await findMarkdownFiles(join(repositoryRoot, "docs"))),
].sort();

const violations = (
    await Promise.all(
        documentationFiles.map(async (path) => {
            const content = await readFile(path, "utf8");
            const file = relative(repositoryRoot, path);

            return findPublicDocumentationViolations(content).map((violation) => ({
                file,
                ...violation,
            }));
        }),
    )
).flat();

if (violations.length > 0) {
    console.error("Public documentation guard failed:");
    for (const violation of violations) {
        console.error(
            `${violation.file}:${violation.line} ${violation.description} (${violation.ruleId})`,
        );
    }
    process.exitCode = 1;
} else {
    console.log(
        `Public documentation guard passed (${documentationFiles.length} files).`,
    );
}
