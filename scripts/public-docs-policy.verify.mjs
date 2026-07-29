import assert from "node:assert/strict";
import test from "node:test";

import { findPublicDocumentationViolations } from "./public-docs-policy.mjs";

const unsafeExamples = [
    ["concrete-endpoint", "POST /internal/example"],
    ["authentication-mechanism", "OAuth provider flow"],
    ["authentication-provider", "Example uses Google login"],
    ["internal-infrastructure", "Redis stores application state"],
    ["connection-topology", "Requests use a proxy rewrite"],
    ["environment-control", "APPLICATION_MODE=true"],
    ["sensitive-identifier", "APPLICATION_SECRET"],
    ["internal-header", "X-Internal-Mode"],
    ["wire-format", "外部契約では24-bit整数を送信します"],
    ["security-response", "401 responses redirect to another page"],
    ["personal-path", "/Users/example/project/spec.json"],
    ["deployment-url", "https://sample.vercel.app"],
    ["external-design-artifact", "https://www.figma.com/design/example/file"],
];

for (const [ruleId, content] of unsafeExamples) {
    test(`detects ${ruleId}`, () => {
        const violations = findPublicDocumentationViolations(content);
        assert.ok(violations.some((violation) => violation.ruleId === ruleId));
    });
}

test("allows product-level documentation", () => {
    const content = [
        "参加者は共有URLからライト画面を開きます。",
        "securityに関わる具体的な実装詳細は公開文書へ記載しません。",
        "開発時はAPI clientと既存の型を再利用します。",
        "http://localhost:3000 を開きます。",
    ].join("\n");

    assert.deepEqual(findPublicDocumentationViolations(content), []);
});
