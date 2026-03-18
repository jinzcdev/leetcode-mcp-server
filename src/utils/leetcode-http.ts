type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(
    value: unknown,
    context: string
): asserts value is JsonRecord {
    if (!isRecord(value)) {
        throw new Error(`${context}: expected JSON object`);
    }
}

function assertStringOrNumberField(
    obj: JsonRecord,
    field: string,
    context: string
): asserts obj is JsonRecord & Record<string, string | number> {
    const value = obj[field];
    const isNonEmptyString = typeof value === "string" && value.length > 0;
    const isFiniteNumber = typeof value === "number" && Number.isFinite(value);
    if (!isNonEmptyString && !isFiniteNumber) {
        throw new Error(`${context}: missing or invalid '${field}'`);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeHtml(text: string): boolean {
    const trimmed = text.trim().toLowerCase();
    return trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html");
}

async function safeReadBodyText(response: Response): Promise<string> {
    try {
        return await response.text();
    } catch {
        return "";
    }
}

export type LeetCodeHttpAuth = {
    csrfToken: string;
    cookie: string;
};

export type PollCheckOptions = {
    timeoutMs?: number;
    pollIntervalMs?: number;
};

export type LeetCodeJson = JsonRecord;

export function buildLeetCodeHttpAuth(params: {
    session: string;
    csrfToken: string;
}): LeetCodeHttpAuth {
    const session = params.session.trim();
    const csrfToken = params.csrfToken.trim();

    if (!session || !csrfToken) {
        throw new Error("Authentication required (missing session/csrf token)");
    }

    const cookieParts: string[] = [];
    if (session.includes("LEETCODE_SESSION=")) {
        cookieParts.push(session);
    } else {
        cookieParts.push(`LEETCODE_SESSION=${session}`);
    }

    if (session.includes("csrftoken=")) {
        // If caller provided a full cookie string that already includes csrftoken,
        // keep it as-is to avoid duplicating keys.
    } else {
        cookieParts.push(`csrftoken=${csrfToken}`);
    }

    return {
        csrfToken,
        cookie: cookieParts.join("; ")
    };
}

export function buildLeetCodeHeaders(params: {
    auth: LeetCodeHttpAuth;
    origin: string;
    referer: string;
}): HeadersInit {
    return {
        "content-type": "application/json",
        cookie: params.auth.cookie,
        "x-csrftoken": params.auth.csrfToken,
        origin: params.origin,
        referer: params.referer
    };
}

async function parseJsonResponse(
    response: Response,
    context: string
): Promise<unknown> {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.toLowerCase().includes("application/json")) {
        return await response.json();
    }

    const text = await safeReadBodyText(response);
    if (looksLikeHtml(text)) {
        throw new Error(
            `${context}: received HTML (likely not authenticated or blocked)`
        );
    }
    throw new Error(`${context}: expected JSON response`);
}

export async function postJson(
    url: string,
    body: unknown,
    headers: HeadersInit
): Promise<unknown> {
    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const text = await safeReadBodyText(response);
        if (looksLikeHtml(text)) {
            throw new Error(
                `POST ${url}: not authenticated or blocked (status ${response.status})`
            );
        }
        throw new Error(
            `POST ${url}: request failed (status ${response.status})`
        );
    }

    return await parseJsonResponse(response, `POST ${url}`);
}

export async function getJson(
    url: string,
    headers: HeadersInit
): Promise<unknown> {
    const response = await fetch(url, { method: "GET", headers });

    if (!response.ok) {
        const text = await safeReadBodyText(response);
        if (looksLikeHtml(text)) {
            throw new Error(
                `GET ${url}: not authenticated or blocked (status ${response.status})`
            );
        }
        throw new Error(
            `GET ${url}: request failed (status ${response.status})`
        );
    }

    return await parseJsonResponse(response, `GET ${url}`);
}

function isPendingState(state: unknown): boolean {
    if (typeof state !== "string") {
        return true;
    }
    const normalized = state.toUpperCase();
    return normalized === "PENDING" || normalized === "STARTED";
}

export async function pollCheck(
    checkUrl: string,
    headers: HeadersInit,
    options?: PollCheckOptions
): Promise<LeetCodeJson> {
    const timeoutMs = options?.timeoutMs ?? 120000;
    const baseIntervalMs = options?.pollIntervalMs ?? 1500;
    const deadline = Date.now() + timeoutMs;

    let intervalMs = Math.max(200, baseIntervalMs);

    while (true) {
        if (Date.now() > deadline) {
            throw new Error(`Polling timed out for ${checkUrl}`);
        }

        const response = await fetch(checkUrl, { method: "GET", headers });

        if (response.status === 429) {
            const retryAfter = response.headers.get("retry-after");
            const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : NaN;
            const backoffMs = Number.isFinite(retryAfterMs)
                ? Math.max(200, retryAfterMs)
                : Math.min(intervalMs * 2, 10000);

            await sleep(backoffMs);
            intervalMs = backoffMs;
            continue;
        }

        if (!response.ok) {
            const text = await safeReadBodyText(response);
            if (looksLikeHtml(text)) {
                throw new Error(
                    `GET ${checkUrl}: not authenticated or blocked (status ${response.status})`
                );
            }
            throw new Error(
                `GET ${checkUrl}: request failed (status ${response.status})`
            );
        }

        const data = await parseJsonResponse(response, `GET ${checkUrl}`);
        assertRecord(data, `GET ${checkUrl}`);

        if (!isPendingState(data.state)) {
            return data;
        }

        await sleep(intervalMs);
    }
}

export function assertRunStartResponse(
    data: unknown,
    context: string
): asserts data is LeetCodeJson & { interpret_id: string | number } {
    assertRecord(data, context);
    // LeetCode currently returns interpret_id as a string like:
    //   {"interpret_id":"runcode_..."}
    // But keep this tolerant in case it changes to a numeric id.
    assertStringOrNumberField(data, "interpret_id", context);
}

export function assertSubmitStartResponse(
    data: unknown,
    context: string
): asserts data is LeetCodeJson & { submission_id: string | number } {
    assertRecord(data, context);
    // LeetCode currently returns submission_id as a number like:
    //   {"submission_id": 1886375866}
    // But keep this tolerant in case it changes to a string id.
    assertStringOrNumberField(data, "submission_id", context);
}
