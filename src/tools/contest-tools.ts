import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LeetCodeBaseService } from "../services/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * Contest tool registry class that handles registration of LeetCode contest-related tools.
 * This class manages tools for accessing contest rankings, history, and user performance in contests.
 */
export class ContestToolRegistry extends ToolRegistry {
    protected registerCommonTools(): void {
        // User contest ranking tool
        this.server.tool(
            "leetcode_user_contest_ranking",
            "Retrieves a user's comprehensive contest ranking information on LeetCode, including overall ranking, participation history, and performance metrics across contests",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username to retrieve contest ranking information for"
                    ),
                attended: z
                    .boolean()
                    .optional()
                    .default(true)
                    .describe(
                        "Whether to include only the contests the user has participated in (true) or all contests (false); defaults to true"
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

    protected registerGlobalTools(): void {}

    protected registerChinaTools(): void {}

    protected registerAuthenticatedCommonTools(): void {}

    protected registerAuthenticatedGlobalTools(): void {}

    protected registerAuthenticatedChinaTools(): void {}
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
