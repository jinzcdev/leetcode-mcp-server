import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeetCodeBaseService } from "../../src/leetcode/leetcode-base-service.js";
import { UserToolRegistry } from "../../src/mcp/tools/user-tools.js";

async function callGetUserProfile(username: string) {
    const fetchUserProfile = vi.fn().mockResolvedValue({
        matchedUser: { username },
        allQuestionsCount: [],
        recentSubmissionList: []
    });

    const service = {
        isCN: () => false,
        isAuthenticated: () => false,
        fetchUserProfile
    } as unknown as LeetCodeBaseService;

    const server = new McpServer({
        name: "test-server",
        version: "1.0.0"
    });

    new UserToolRegistry(server, service).registerTools();

    const client = new Client({
        name: "test-client",
        version: "1.0.0"
    });

    const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();

    try {
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        const result = await client.callTool({
            name: "get_user_profile",
            arguments: { username }
        });

        return { result, fetchUserProfile };
    } finally {
        await client.close();
        await server.close();
    }
}

describe("get_user_profile input validation", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("rejects a malformed username before fetching the profile", async () => {
        const { result, fetchUserProfile } = await callGetUserProfile(
            "<b>tofu-poc</b>{{7*7}}"
        );

        expect(result.isError).toBe(true);
        expect(fetchUserProfile).not.toHaveBeenCalled();
    });

    it.each(["tofu-poc", "user_123"])(
        "accepts a valid username: %s",
        async (username) => {
            const { result, fetchUserProfile } =
                await callGetUserProfile(username);

            expect(fetchUserProfile).toHaveBeenCalledOnce();
            expect(fetchUserProfile).toHaveBeenCalledWith(username);
            expect(result.isError).not.toBe(true);

            const content = result.content.find(
                (item): item is { type: "text"; text: string } =>
                    typeof item === "object" &&
                    item !== null &&
                    "type" in item &&
                    item.type === "text" &&
                    "text" in item &&
                    typeof item.text === "string"
            );

            expect(content).toBeDefined();

            if (content) {
                const response = JSON.parse(content.text);
                expect(response).not.toHaveProperty("username");
                expect(response).toHaveProperty("profile");
            }
        }
    );

    it("rejects an empty username before fetching the profile", async () => {
        const { result, fetchUserProfile } = await callGetUserProfile("");

        expect(result.isError).toBe(true);
        expect(fetchUserProfile).not.toHaveBeenCalled();
    });
});
