import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LANG } from "../constants.js";
import { LeetCodeBaseService } from "../services/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * User tool registry class that handles registration of LeetCode user-related tools.
 * This class manages tools for accessing user profiles, submissions, and progress data.
 */
export class UserToolRegistry extends ToolRegistry {
    protected registerCommonTools(): void {
        // User profile tool
        this.server.tool(
            "leetcode_user_profile",
            "Retrieves comprehensive profile information about a LeetCode user, including user stats, solved problems, and profile details",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username to retrieve profile information for"
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

    protected registerGlobalTools(): void {
        // Recent submissions tool (Global-specific)
        this.server.tool(
            "leetcode_recent_submissions",
            "Retrieves a user's recent submissions on LeetCode Global, including both accepted and failed submissions with detailed metadata",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username to retrieve recent submissions for"
                    ),
                limit: z
                    .number()
                    .optional()
                    .describe(
                        "Maximum number of submissions to return (optional, defaults to server-defined limit)"
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
            "leetcode_recent_ac_submissions",
            "Retrieves a user's recent accepted (AC) submissions on LeetCode Global, focusing only on successfully completed problems",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode username to retrieve recent accepted submissions for"
                    ),
                limit: z
                    .number()
                    .optional()
                    .describe(
                        "Maximum number of accepted submissions to return (optional, defaults to server-defined limit)"
                    )
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

    protected registerChinaTools(): void {
        // User recent AC submissions tool (CN-specific)
        this.server.tool(
            "leetcode_user_recent_ac_submissions",
            "Retrieves a user's recent accepted (AC) submissions on LeetCode China, with details about each successfully solved problem",
            {
                username: z
                    .string()
                    .describe(
                        "LeetCode China username to retrieve recent accepted submissions for"
                    ),
                limit: z
                    .number()
                    .optional()
                    .describe(
                        "Maximum number of accepted submissions to return (optional, defaults to server-defined limit)"
                    )
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
    protected registerAuthenticatedCommonTools(): void {
        // User status tool (requires authentication)
        this.server.tool(
            "leetcode_user_status",
            "Retrieves the current authenticated user's status on LeetCode, including login status, premium membership details, and user information (requires authentication)",
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
            "leetcode_problem_submission_detail",
            "Retrieves detailed information about a specific LeetCode submission by its ID, including source code, runtime stats, and test results (requires authentication)",
            {
                id: z
                    .number()
                    .describe(
                        "The numerical submission ID to retrieve detailed information for"
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
            "leetcode_user_progress_questions",
            "Retrieves the authenticated user's problem-solving status with filtering options, including detailed solution history for attempted or solved questions (requires authentication)",
            {
                offset: z
                    .number()
                    .describe(
                        "The number of questions to skip for pagination purposes"
                    ),
                limit: z
                    .number()
                    .describe(
                        "The maximum number of questions to return in a single request"
                    ),
                questionStatus: z
                    .enum(["ATTEMPTED", "SOLVED"])
                    .optional()
                    .describe(
                        "Filter by question status: 'ATTEMPTED' for questions that have been tried but not necessarily solved, 'SOLVED' for questions that have been successfully completed"
                    ),
                difficulty: z
                    .array(z.string())
                    .optional()
                    .describe(
                        "Filter by difficulty levels as an array (e.g., ['EASY', 'MEDIUM', 'HARD']); if not provided, questions of all difficulty levels will be returned"
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
    protected registerAuthenticatedGlobalTools(): void {
        // Global user submissions tool (requires authentication)
        this.server.tool(
            "leetcode_user_all_submissions",
            "Retrieves a paginated list of the authenticated user's submissions for a specific problem or all problems on LeetCode Global, with detailed submission metadata (requires authentication)",
            {
                limit: z
                    .number()
                    .describe(
                        "Maximum number of submissions to return per page (typically defaults to 20 if not specified)"
                    ),
                offset: z
                    .number()
                    .describe(
                        "Number of submissions to skip for pagination purposes"
                    ),
                questionSlug: z
                    .string()
                    .optional()
                    .describe(
                        "Optional problem identifier (slug) to filter submissions for a specific problem (e.g., 'two-sum'); if omitted, returns submissions across all problems"
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
    protected registerAuthenticatedChinaTools(): void {
        // China user submissions tool (requires authentication, enhanced version with more parameters)
        this.server.tool(
            "leetcode_user_all_submissions",
            "Retrieves a comprehensive, paginated list of the authenticated user's submissions on LeetCode China with extensive filtering options, including pagination support via lastKey parameter (requires authentication)",
            {
                limit: z
                    .number()
                    .describe(
                        "Maximum number of submissions to return per page (typically defaults to 20 if not specified)"
                    ),
                offset: z
                    .number()
                    .describe(
                        "Number of submissions to skip for pagination purposes"
                    ),
                questionSlug: z
                    .string()
                    .optional()
                    .describe(
                        "Optional problem identifier (slug) to filter submissions for a specific problem (e.g., 'two-sum'); if omitted, returns submissions across all problems"
                    ),
                lang: z
                    .enum(LANG as [string])
                    .optional()
                    .describe(
                        "Programming language filter to show only submissions in a specific language (e.g., 'python3', 'java', 'cpp')"
                    ),
                status: z
                    .enum(["AC", "WA"])
                    .optional()
                    .describe(
                        "Submission status filter (e.g., 'AC' for Accepted, 'WA' for Wrong Answer) to show only submissions with that status; if omitted, returns all submissions"
                    ),
                lastKey: z
                    .string()
                    .optional()
                    .describe(
                        "Pagination token from a previous request used to retrieve the next page of results"
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
