import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PROGRAMMING_LANGS } from "../../common/constants.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * User tool registry class that handles registration of LeetCode user-related tools.
 * This class manages tools for accessing user profiles, submissions, and progress data.
 */
export class UserToolRegistry extends ToolRegistry {
    protected registerCommon(): void {
        // User profile tool
        this.server.tool(
            "get_user_profile",
            "Retrieves any user's public profile by username (read-only, no auth). Returns ranking, avatar, bio, submission stats, and platform-specific progress. Use this to look up other users or public stats. Use get_user_status (requires auth) instead to verify the current session user's login state—not for looking up arbitrary users.",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username (case-sensitive). Public profile lookup; no authentication required."
                    )
            },
            async ({ username }) => {
                const data =
                    await this.leetcodeService.fetchUserProfile(username);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                username: username,
                                profile: data
                            })
                        }
                    ]
                };
            }
        );
    }

    protected registerGlobal(): void {
        // Recent submissions tool (Global-specific)
        this.server.tool(
            "get_recent_submissions",
            "Retrieves a user's recent submission history on LeetCode Global (read-only, no auth). Includes both accepted and failed submissions. Global only—not available on CN. Use get_recent_ac_submissions for accepted-only results, or get_all_submissions (auth, current user) for paginated full history with filters.",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username whose public recent submissions to fetch"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe(
                        "Max submissions to return (default: 10). Increase for more history within the recent window."
                    )
            },
            async ({ username, limit }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchUserRecentSubmissions(
                            username,
                            limit
                        );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    username,
                                    submissions: data
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
                                    error: "Failed to fetch recent submissions",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        // Recent accepted submissions tool (Global-specific)
        this.server.tool(
            "get_recent_ac_submissions",
            "Retrieves a user's recent accepted (AC) submissions (read-only, no auth). Available on both Global and CN. Use get_recent_submissions (Global only) to include failed attempts, or get_all_submissions (auth, current user) for full paginated history.",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username whose public recent AC submissions to fetch"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe("Max AC submissions to return (default: 10)")
            },
            async ({ username, limit }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchUserRecentACSubmissions(
                            username,
                            limit
                        );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    username,
                                    submissions: data
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
                                    error: "Failed to fetch recent submissions",
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
        // User recent AC submissions tool (CN-specific)
        this.server.tool(
            "get_recent_ac_submissions",
            "Retrieves a user's recent accepted (AC) submissions on LeetCode CN (read-only, no auth). Use get_all_submissions (auth, current user) for full paginated history with lang/status filters.",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode CN username whose public recent AC submissions to fetch"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe("Max AC submissions to return (default: 10)")
            },
            async ({ username, limit }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchUserRecentACSubmissions(
                            username,
                            limit
                        );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    username,
                                    acSubmissions: data
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
                                    error: "Failed to fetch recent AC submissions",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );
    }

    /**
     * Registers common tools that require authentication and are available on both Global and CN platforms.
     */
    protected registerAuthenticatedCommon(): void {
        // User status tool (requires authentication)
        this.server.tool(
            "get_user_status",
            "Checks the authenticated user's LeetCode login session (read-only, requires auth). Returns isSignedIn, username, avatar, and admin flag as JSON. Only available when credentials are configured. Use this to verify login state or identify the current user—not to look up other users (use get_user_profile for that). Errors return { error: message } if credentials are missing or invalid.",
            async () => {
                try {
                    const status = await this.leetcodeService.fetchUserStatus();
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    status: status
                                })
                            }
                        ]
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ error: error.message })
                            }
                        ]
                    };
                }
            }
        );

        // Submission detail tool (requires authentication)
        this.server.tool(
            "get_problem_submission_report",
            "Retrieves full details for one submission by ID (read-only, requires auth). Returns source code, runtime, memory, and test results as JSON. Use when you have a submission ID from get_all_submissions or get_recent_submissions. Use get_all_submissions to browse/list submissions; do not use it when you only need one submission's code and results.",
            {
                id: z
                    .number()
                    .describe(
                        "Numeric submission ID (e.g., from get_all_submissions or get_recent_submissions response)"
                    )
            },
            async ({ id }) => {
                try {
                    const submissionDetail =
                        await this.leetcodeService.fetchUserSubmissionDetail(
                            id
                        );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    submissionId: id,
                                    detail: submissionDetail
                                })
                            }
                        ]
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ error: error.message })
                            }
                        ]
                    };
                }
            }
        );

        // User progress questions tool (requires authentication)
        this.server.tool(
            "get_problem_progress",
            "Retrieves the authenticated user's per-problem solving progress (read-only, requires auth). Filter by ATTEMPTED/SOLVED status and difficulty; supports pagination. Use for tracking which problems the current user has tried or solved. Use get_all_submissions for individual submission records with code/runtime, or get_recent_ac_submissions for another user's public AC list.",
            {
                offset: z
                    .number()
                    .default(0)
                    .describe(
                        "Pagination offset—number of questions to skip (default: 0)"
                    ),
                limit: z
                    .number()
                    .default(100)
                    .describe("Max questions per page (default: 100)"),
                questionStatus: z
                    .enum(["ATTEMPTED", "SOLVED"])
                    .optional()
                    .describe(
                        "'ATTEMPTED' = tried but not necessarily solved; 'SOLVED' = successfully completed. Omit to return all."
                    ),
                difficulty: z
                    .array(z.string())
                    .optional()
                    .describe(
                        "Filter by difficulty, e.g. ['EASY', 'MEDIUM', 'HARD']. Omit for all levels."
                    )
            },
            async ({ offset, limit, questionStatus, difficulty }) => {
                try {
                    const filters = {
                        offset,
                        limit,
                        questionStatus,
                        difficulty
                    };

                    const progressQuestions =
                        await this.leetcodeService.fetchUserProgressQuestionList(
                            filters
                        );
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    filters,
                                    questions: progressQuestions
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
                                    error: "Failed to fetch user progress questions",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );
    }

    /**
     * Registers tools specific to the Global LeetCode site that require authentication.
     */
    protected registerAuthenticatedGlobal(): void {
        // Global user submissions tool (requires authentication)
        this.server.tool(
            "get_all_submissions",
            "Retrieves paginated submission history for the authenticated user on LeetCode Global (read-only, requires auth). Optionally filter by problem slug. Use get_recent_submissions/get_recent_ac_submissions to view any user's public recent history. Use get_problem_submission_report when you have a specific submission ID and need source code and test results.",
            {
                limit: z
                    .number()
                    .default(20)
                    .describe("Submissions per page (default: 20)"),
                offset: z
                    .number()
                    .default(0)
                    .describe(
                        "Pagination offset—submissions to skip (default: 0)"
                    ),
                questionSlug: z
                    .string()
                    .optional()
                    .describe(
                        "Filter by problem slug (e.g., 'two-sum'). Omit for all problems."
                    )
            },
            async ({ questionSlug, limit, offset }) => {
                try {
                    const submissions =
                        await this.leetcodeService.fetchUserAllSubmissions({
                            offset,
                            limit,
                            questionSlug
                        });
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    problem: questionSlug,
                                    submissions: submissions
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
                                    error: "Failed to fetch user submissions",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );
    }

    /**
     * Registers tools specific to the China LeetCode site that require authentication.
     */
    protected registerAuthenticatedChina(): void {
        // China user submissions tool (requires authentication, enhanced version with more parameters)
        this.server.tool(
            "get_all_submissions",
            "Retrieves paginated submission history for the authenticated user on LeetCode CN (read-only, requires auth). Supports filtering by problem slug, language, and AC/WA status; uses lastKey for cursor pagination. Use get_recent_ac_submissions for another user's public AC list. Use get_problem_submission_report for full details of a single submission by ID.",
            {
                limit: z
                    .number()
                    .default(20)
                    .describe("Submissions per page (default: 20)"),
                offset: z
                    .number()
                    .default(0)
                    .describe(
                        "Pagination offset—submissions to skip (default: 0)"
                    ),
                questionSlug: z
                    .string()
                    .optional()
                    .describe(
                        "Filter by problem slug (e.g., 'two-sum'). Omit for all problems."
                    ),
                lang: z
                    .enum(PROGRAMMING_LANGS as [string])
                    .optional()
                    .describe(
                        "Filter by language (e.g., 'python3', 'java', 'cpp'). Omit for all languages."
                    ),
                status: z
                    .enum(["AC", "WA"])
                    .optional()
                    .describe(
                        "'AC' = accepted, 'WA' = wrong answer. Omit for all statuses."
                    ),
                lastKey: z
                    .string()
                    .optional()
                    .describe(
                        "Cursor token from previous response's lastKey for next page"
                    )
            },
            async ({ questionSlug, limit, offset, lang, status, lastKey }) => {
                try {
                    const submissions =
                        await this.leetcodeService.fetchUserAllSubmissions({
                            offset,
                            limit,
                            questionSlug,
                            lang,
                            status,
                            lastKey
                        });
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(submissions)
                            }
                        ]
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    error: "Failed to fetch user submissions",
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
 * Registers all user-related tools with the MCP server.
 *
 * @param server - The MCP server instance to register tools with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerUserTools(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new UserToolRegistry(server, leetcodeService);
    registry.registerTools();
}
