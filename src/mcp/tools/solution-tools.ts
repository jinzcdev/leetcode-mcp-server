import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * Solution tool registry class that handles registration of LeetCode solution-related tools.
 * This class manages tools for accessing solutions, filtering solutions, and reading solution details.
 */
export class SolutionToolRegistry extends ToolRegistry {
    protected registerGlobal(): void {
        // Problem solutions listing tool (Global-specific)
        this.server.tool(
            "list_problem_solutions",
            "Lists community solution articles for a problem (read-only, no auth). Returns metadata only (topicId)—not full content. Use get_problem_solution with the returned topicId to read the full article. Do not call this when you already have a topicId and need the solution text.",
            {
                questionSlug: z
                    .string()
                    .describe(
                        "Problem URL slug (e.g., 'two-sum')—same as in /problems/{slug}"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe("Max solutions per page (default: 10)"),
                skip: z
                    .number()
                    .optional()
                    .describe("Solutions to skip for pagination (default: 0)"),
                orderBy: z
                    .enum(["HOT", " MOST_RECENT", "MOST_VOTES"])
                    .default("HOT")
                    .optional()
                    .describe(
                        "Sort order: 'HOT' (default), 'MOST_VOTES', or 'MOST_RECENT'"
                    ),
                userInput: z
                    .string()
                    .optional()
                    .describe(
                        "Keyword filter on solution title, content, or author (case-insensitive)"
                    ),
                tagSlugs: z
                    .array(z.string())
                    .optional()
                    .default([])
                    .describe(
                        "Filter by language or algorithm tags, e.g. ['python', 'dynamic-programming']"
                    )
            },
            async ({
                questionSlug,
                limit,
                skip,
                orderBy,
                userInput,
                tagSlugs
            }) => {
                try {
                    const options = {
                        limit,
                        skip,
                        orderBy,
                        userInput,
                        tagSlugs
                    };

                    const data =
                        await this.leetcodeService.fetchQuestionSolutionArticles(
                            questionSlug,
                            options
                        );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    questionSlug,
                                    solutionArticles: data
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
                                    error: "Failed to fetch solutions",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        // Solution article detail tool (Global-specific)
        this.server.tool(
            "get_problem_solution",
            "Retrieves full content of a community solution article (read-only, no auth). Requires topicId from list_problem_solutions. Returns article text, author, and metadata as JSON. Use list_problem_solutions first to discover solutions and obtain topicId.",
            {
                topicId: z
                    .string()
                    .describe(
                        "Solution topicId from list_problem_solutions response"
                    )
            },
            async ({ topicId }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchSolutionArticleDetail(
                            topicId
                        );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    topicId,
                                    solution: data
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
                                    error: "Failed to fetch solution detail",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );
    }

    protected registerChina(): void {
        // Problem solutions listing tool (CN-specific)
        this.server.tool(
            "list_problem_solutions",
            "Lists community solution articles for a problem on LeetCode CN (read-only, no auth). Returns metadata only (slug)—not full content. Use get_problem_solution with the returned slug to read the full article.",
            {
                questionSlug: z
                    .string()
                    .describe(
                        "Problem URL slug (e.g., 'two-sum')—same as in /problems/{slug}"
                    ),
                limit: z
                    .number()
                    .min(1)
                    .optional()
                    .default(10)
                    .describe("Max solutions per page (default: 10)"),
                skip: z
                    .number()
                    .optional()
                    .describe("Solutions to skip for pagination (default: 0)"),
                orderBy: z
                    .enum([
                        "DEFAULT",
                        "MOST_UPVOTE",
                        "HOT",
                        "NEWEST_TO_OLDEST",
                        "OLDEST_TO_NEWEST"
                    ])
                    .default("DEFAULT")
                    .optional()
                    .describe(
                        "Sort order: 'DEFAULT' (default), 'MOST_UPVOTE', 'HOT', 'NEWEST_TO_OLDEST', or 'OLDEST_TO_NEWEST'"
                    ),
                userInput: z
                    .string()
                    .optional()
                    .describe(
                        "Keyword filter on solution title, content, or author (case-insensitive)"
                    ),
                tagSlugs: z
                    .array(z.string())
                    .optional()
                    .default([])
                    .describe(
                        "Filter by language or algorithm tags, e.g. ['python', 'dynamic-programming']"
                    )
            },
            async ({
                questionSlug,
                limit,
                skip,
                orderBy,
                userInput,
                tagSlugs
            }) => {
                try {
                    const options = {
                        limit,
                        skip,
                        orderBy,
                        userInput,
                        tagSlugs
                    };

                    const data =
                        await this.leetcodeService.fetchQuestionSolutionArticles(
                            questionSlug,
                            options
                        );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    questionSlug,
                                    solutionArticles: data
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
                                    error: "Failed to fetch solutions",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        // Solution article detail tool (CN-specific)
        this.server.tool(
            "get_problem_solution",
            "Retrieves full content of a community solution article on LeetCode CN (read-only, no auth). Requires slug from list_problem_solutions (node.slug field). Returns article text, author, and metadata as JSON.",
            {
                slug: z
                    .string()
                    .describe(
                        "Solution slug from list_problem_solutions response (node.slug field)"
                    )
            },
            async ({ slug }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchSolutionArticleDetail(
                            slug
                        );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    slug,
                                    solution: data
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
                                    error: "Failed to fetch solution detail",
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
 * Registers all solution-related tools with the MCP server.
 *
 * @param server - The MCP server instance to register tools with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerSolutionTools(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new SolutionToolRegistry(server, leetcodeService);
    registry.registerTools();
}
