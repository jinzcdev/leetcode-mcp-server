import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PROBLEM_CATEGORIES, PROBLEM_TAGS } from "../../common/constants.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * Problem tool registry class that handles registration of LeetCode problem-related tools.
 * This class manages tools for accessing problem details, searching problems, and daily challenges.
 */
export class ProblemToolRegistry extends ToolRegistry {
    protected registerCommon(): void {
        // Daily challenge tool
        this.server.tool(
            "get_daily_challenge",
            "Retrieves today's LeetCode Daily Challenge problem with complete details, including problem description, constraints, and examples",
            {},
            async () => {
                const data = await this.leetcodeService.fetchDailyChallenge();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                date: new Date().toISOString().split("T")[0],
                                problem: data
                            })
                        }
                    ]
                };
            }
        );

        // Problem details tool
        this.server.tool(
            "get_problem",
            "Retrieves details about a specific LeetCode problem, including its description, examples, constraints, and related information",
            {
                titleSlug: z
                    .string()
                    .describe(
                        "The URL slug/identifier of the problem (e.g., 'two-sum', 'add-two-numbers') as it appears in the LeetCode URL"
                    )
            },
            async ({ titleSlug }) => {
                const data =
                    await this.leetcodeService.fetchProblemSimplified(
                        titleSlug
                    );
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                titleSlug,
                                problem: data
                            })
                        }
                    ]
                };
            }
        );

        // Search problems tool
        this.server.tool(
            "search_problems",
            "Searches for LeetCode problems based on multiple filter criteria including categories, tags, difficulty levels, and keywords, with pagination support",
            {
                category: z
                    .enum(PROBLEM_CATEGORIES as [string])
                    .default("all-code-essentials")
                    .describe(
                        "Problem category filter (e.g., 'algorithms', 'database', 'shell') to narrow down the problem domain"
                    ),
                tags: z
                    .array(z.enum(PROBLEM_TAGS as [string]))
                    .optional()
                    .describe(
                        "List of topic tags to filter problems by (e.g., ['array', 'dynamic-programming', 'tree'])"
                    ),
                difficulty: z
                    .enum(["EASY", "MEDIUM", "HARD"])
                    .optional()
                    .describe(
                        "Problem difficulty level filter to show only problems of a specific difficulty"
                    ),
                searchKeywords: z
                    .string()
                    .optional()
                    .describe(
                        "Keywords to search in problem titles and descriptions"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe(
                        "Maximum number of problems to return in a single request (for pagination)"
                    ),
                offset: z
                    .number()
                    .optional()
                    .describe("Number of problems to skip (for pagination)")
            },
            async ({
                category,
                tags,
                difficulty,
                limit,
                offset,
                searchKeywords
            }) => {
                const data = await this.leetcodeService.searchProblems(
                    category,
                    tags,
                    difficulty,
                    limit,
                    offset,
                    searchKeywords
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                filters: { tags, difficulty, searchKeywords },
                                pagination: { limit, offset },
                                problems: data
                            })
                        }
                    ]
                };
            }
        );
    }
}

/**
 * Registers all problem-related tools with the MCP server.
 *
 * @param server - The MCP server instance to register tools with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerProblemTools(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new ProblemToolRegistry(server, leetcodeService);
    registry.registerTools();
}
