const rules = [
    {
        id: "concrete-endpoint",
        description: "concrete internal endpoint",
        matches: (line) =>
            /\b(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\/[A-Za-z0-9_[{*.-]/.test(
                line,
            ) || /`\/(?:api|ws)(?:\/[^`\s]*)?`/i.test(line),
    },
    {
        id: "authentication-mechanism",
        description: "authentication implementation detail",
        matches: (line) =>
            /\b(?:OAuth(?:\s*2(?:\.0)?)?|OIDC|SAML|PKCE|JWT|CSRF|Bearer|HttpOnly|SameSite|NextAuth|Auth0|Cognito|Keycloak|Firebase\s+Auth|HttpSession|JSESSIONID)\b/i.test(
                line,
            ),
    },
    {
        id: "authentication-provider",
        description: "authentication provider detail",
        matches: (line) =>
            /(?:Google|GitHub|Apple|Microsoft|LINE).{0,48}(?:login|ログイン|auth|認証|provider|プロバイダー)|(?:login|ログイン|auth|認証|provider|プロバイダー).{0,48}(?:Google|GitHub|Apple|Microsoft|LINE)/i.test(
                line,
            ),
    },
    {
        id: "internal-infrastructure",
        description: "data or realtime infrastructure detail",
        matches: (line) =>
            /\b(?:Spring\s+Boot|MongoDB|Redis|PostgreSQL|MySQL|Neon|Pusher|SockJS|STOMP|WebSocket)\b/i.test(
                line,
            ),
    },
    {
        id: "connection-topology",
        description: "internal connection topology",
        matches: (line) => /\b(?:proxy|rewrite|CORS)\b/i.test(line),
    },
    {
        id: "environment-control",
        description: "concrete environment control",
        matches: (line) => /\b[A-Z][A-Z0-9_]{2,}\s*=/.test(line),
    },
    {
        id: "sensitive-identifier",
        description: "security-sensitive identifier",
        matches: (line) =>
            /\b[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|CONNECTION_STRING|SESSION_KEY)[A-Z0-9_]*\b/.test(
                line,
            ),
    },
    {
        id: "internal-header",
        description: "concrete internal header",
        matches: (line) => /\bX-[A-Za-z0-9-]{3,}\b/.test(line),
    },
    {
        id: "wire-format",
        description: "concrete external wire format",
        matches: (line) =>
            /(?:外部契約|通信契約|wire\s*format).{0,80}(?:\b\d+-?bit\b|整数|integer|#RRGGBB)/i.test(
                line,
            ) ||
            /(?:\b\d+-?bit\b|整数|integer|#RRGGBB).{0,80}(?:外部契約|通信契約|wire\s*format)/i.test(
                line,
            ),
    },
    {
        id: "data-structure-field",
        description: "concrete data-structure field",
        matches: (line) =>
            /^\s*[A-Za-z_$][A-Za-z0-9_$]*\??\s*:\s*(?:string|number|boolean|unknown|object)\b/.test(
                line,
            ) ||
            /^\s*(?:[-*]\s+)?`[a-z][A-Za-z0-9_$]*`:\s+/.test(line),
    },
    {
        id: "security-response",
        description: "access-control response behavior",
        matches: (line) =>
            /\b(?:401|403|503)\b.{0,80}(?:redirect|リダイレクト|header|ヘッダー)/i.test(
                line,
            ),
    },
    {
        id: "personal-path",
        description: "personal absolute filesystem path",
        matches: (line) =>
            /(?:^|[\s`(])\/(?:Users|home)\/[^`\s)]+/.test(line),
    },
    {
        id: "deployment-url",
        description: "concrete project deployment URL",
        matches: (line) => {
            const urls = line.match(
                /https?:\/\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g,
            );

            return (
                urls?.some((candidate) => {
                    try {
                        const hostname = new URL(candidate).hostname.toLowerCase();
                        return (
                            hostname.includes("sundog") ||
                            hostname.endsWith(".vercel.app") ||
                            hostname.endsWith(".run.app")
                        );
                    } catch {
                        return false;
                    }
                }) ?? false
            );
        },
    },
    {
        id: "external-design-artifact",
        description: "concrete external design artifact",
        matches: (line) =>
            /https?:\/\/(?:www\.)?figma\.com\/(?:design|file)\//i.test(line),
    },
];

export function findPublicDocumentationViolations(content) {
    return content.split(/\r?\n/).flatMap((line, index) =>
        rules
            .filter((rule) => rule.matches(line))
            .map((rule) => ({
                line: index + 1,
                ruleId: rule.id,
                description: rule.description,
            })),
    );
}
