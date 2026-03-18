import { describe, expect, it, vi } from "vitest";
import { pollCheck } from "../../src/utils/leetcode-http.js";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
        ...init
    });
}

describe("pollCheck", () => {
    it("polls until state is finished", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ state: "PENDING" }))
            .mockResolvedValueOnce(jsonResponse({ state: "STARTED" }))
            .mockResolvedValueOnce(
                jsonResponse({ state: "SUCCESS", ok: true })
            );

        (globalThis as any).fetch = fetchMock;

        const promise = pollCheck(
            "https://example.com/check/",
            {},
            {
                timeoutMs: 10000,
                pollIntervalMs: 1000
            }
        );

        await Promise.resolve();
        await vi.advanceTimersByTimeAsync(1000);
        await vi.advanceTimersByTimeAsync(1000);

        await expect(promise).resolves.toMatchObject({
            state: "SUCCESS",
            ok: true
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);

        vi.useRealTimers();
    });

    it("times out when never finished", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const fetchMock = vi
            .fn()
            .mockResolvedValue(jsonResponse({ state: "STARTED" }));
        (globalThis as any).fetch = fetchMock;

        const promise = pollCheck(
            "https://example.com/check/",
            {},
            {
                timeoutMs: 500,
                pollIntervalMs: 1000
            }
        );

        const rejection = expect(promise).rejects.toThrow(/Polling timed out/);
        await Promise.resolve();
        await vi.advanceTimersByTimeAsync(1000);
        await rejection;

        vi.useRealTimers();
    });

    it("backs off on 429", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                new Response("", {
                    status: 429,
                    headers: { "retry-after": "1" }
                })
            )
            .mockResolvedValueOnce(jsonResponse({ state: "STARTED" }))
            .mockResolvedValueOnce(jsonResponse({ state: "SUCCESS" }));

        (globalThis as any).fetch = fetchMock;

        const promise = pollCheck(
            "https://example.com/check/",
            {},
            {
                timeoutMs: 10000,
                pollIntervalMs: 200
            }
        );

        const resolution = expect(promise).resolves.toMatchObject({
            state: "SUCCESS"
        });

        await Promise.resolve();
        await vi.advanceTimersByTimeAsync(1000);
        await vi.advanceTimersByTimeAsync(1000);

        await resolution;
        expect(fetchMock).toHaveBeenCalledTimes(3);

        vi.useRealTimers();
    });
});
