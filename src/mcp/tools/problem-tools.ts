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
            "Retrieves today's Daily Challenge problem with full description (read-only, no auth). Returns problem details for the current date as JSON. Use get_problem when you know a specific titleSlug; use search_problems to discover problems by filters.",
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
            "Retrieves a single LeetCode problem by titleSlug (read-only, no auth). Returns description, examples, constraints, and metadata as JSON. Use search_problems to find problems by keyword/tag/difficulty; use get_daily_challenge for today's featured problem.",
            {
                titleSlug: z
                    .string()
                    .describe(
                        "Problem URL slug (e.g., 'two-sum', 'add-two-numbers')—the path segment after /problems/"
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
            "Searches LeetCode problems by category, tags, difficulty, and keywords (read-only, no auth). Supports pagination via limit/offset. Returns matching problem list as JSON. Use get_problem when you already know the titleSlug; use this to browse or discover problems.",
            {
                category: z
                    .enum(PROBLEM_CATEGORIES as [string])
                    .default("all-code-essentials")
                    .describe(
                        "Problem set category (e.g., 'algorithms', 'database'). Default: 'all-code-essentials'."
                    ),
                tags: z
                    .array(z.enum(PROBLEM_TAGS as [string]))
                    .optional()
                    .describe(
                        "Topic tags to filter by, e.g. ['array', 'dynamic-programming']. Omit for no tag filter."
                    ),
                difficulty: z
                    .enum(["EASY", "MEDIUM", "HARD"])
                    .optional()
                    .describe("Difficulty filter. Omit for all levels."),
                searchKeywords: z
                    .string()
                    .optional()
                    .describe(
                        "Keyword search in problem titles and descriptions"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe("Max results per page (default: 10)"),
                offset: z
                    .number()
                    .optional()
                    .describe("Results to skip for pagination (default: 0)")
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
