import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * Contest tool registry class that handles registration of LeetCode contest-related tools.
 * This class manages tools for accessing contest rankings, history, and user performance in contests.
 */
export class ContestToolRegistry extends ToolRegistry {
    protected registerCommon(): void {
        // User contest ranking tool
        this.server.tool(
            "get_user_contest_ranking",
            "Retrieves a user's contest ranking and participation history (read-only, no auth). Returns overall rating, ranking, and per-contest performance as JSON. Use get_user_profile for general stats and ranking; use this specifically for contest performance data.",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username whose contest ranking to fetch"
                    ),
                attended: z
                    .boolean()
                    .optional()
                    .default(true)
                    .describe(
                        "true = only contests the user attended (default); false = include all contests in history"
                    )
            },
            async ({ username, attended = true }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchUserContestRanking(
                            username,
                            attended
                        );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    username,
                                    contestRanking: data
                                })
                            }
                        ]
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    error: "Failed to fetch user contest ranking",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );
    }
}

/**
 * Registers all contest-related tools with the MCP server.
 *
 * @param server - The MCP server instance to register tools with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerContestTools(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new ContestToolRegistry(server, leetcodeService);
    registry.registerTools();
}
