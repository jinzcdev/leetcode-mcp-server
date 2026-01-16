import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PROGRAMMING_LANGS } from "../../common/constants.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

export class SubmissionToolRegistry extends ToolRegistry {
    protected registerAuthenticatedCommon(): void {
        this.server.tool(
            "run_code",
            "Runs code for a LeetCode problem (requires authentication). Starts an interpret request then polls the /check/ endpoint until finished, returning both the start response and final check JSON.",
            {
                titleSlug: z
                    .string()
                    .min(1)
                    .describe(
                        "The URL slug/identifier of the problem (e.g., 'two-sum')"
                    ),
                lang: z
                    .enum(PROGRAMMING_LANGS as [string])
                    .describe("Programming language (e.g., 'python3', 'cpp')"),
                typedCode: z
                    .string()
                    .min(1)
                    .describe("Source code to run (will not be logged)"),
                dataInput: z
                    .string()
                    .optional()
                    .describe(
                        "Custom test input for run (optional). If omitted, LeetCode may use default test cases."
                    ),
                timeoutMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(120000)
                    .describe(
                        "Polling timeout in milliseconds (optional, default: 120000)"
                    ),
                pollIntervalMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(1500)
                    .describe(
                        "Polling interval in milliseconds (optional, default: 1500)"
                    )
            },
            async ({
                titleSlug,
                lang,
                typedCode,
                dataInput,
                timeoutMs,
                pollIntervalMs
            }) => {
                try {
                    const problem =
                        await this.leetcodeService.fetchProblemSimplified(
                            titleSlug
                        );

                    const questionId = String(problem?.questionId ?? "");
                    if (!questionId) {
                        throw new Error(
                            `Failed to resolve questionId for ${titleSlug}`
                        );
                    }

                    const result = await this.leetcodeService.runCode({
                        titleSlug,
                        questionId,
                        lang,
                        typedCode,
                        dataInput,
                        timeoutMs,
                        pollIntervalMs
                    });

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    titleSlug,
                                    questionId,
                                    start: result.start,
                                    checkUrl: result.checkUrl,
                                    check: result.check
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
                                    error: "Failed to run code",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        this.server.tool(
            "submit_solution",
            "Submits code for a LeetCode problem (requires authentication). Starts a submission then polls the /check/ endpoint until finished, returning both the start response and final check JSON.",
            {
                titleSlug: z
                    .string()
                    .min(1)
                    .describe(
                        "The URL slug/identifier of the problem (e.g., 'two-sum')"
                    ),
                lang: z
                    .enum(PROGRAMMING_LANGS as [string])
                    .describe("Programming language (e.g., 'python3', 'cpp')"),
                typedCode: z
                    .string()
                    .min(1)
                    .describe("Source code to submit (will not be logged)"),
                timeoutMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(120000)
                    .describe(
                        "Polling timeout in milliseconds (optional, default: 120000)"
                    ),
                pollIntervalMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(1500)
                    .describe(
                        "Polling interval in milliseconds (optional, default: 1500)"
                    )
            },
            async ({
                titleSlug,
                lang,
                typedCode,
                timeoutMs,
                pollIntervalMs
            }) => {
                try {
                    const problem =
                        await this.leetcodeService.fetchProblemSimplified(
                            titleSlug
                        );

                    const questionId = String(problem?.questionId ?? "");
                    if (!questionId) {
                        throw new Error(
                            `Failed to resolve questionId for ${titleSlug}`
                        );
                    }

                    const result = await this.leetcodeService.submitSolution({
                        titleSlug,
                        questionId,
                        lang,
                        typedCode,
                        timeoutMs,
                        pollIntervalMs
                    });

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    titleSlug,
                                    questionId,
                                    start: result.start,
                                    checkUrl: result.checkUrl,
                                    check: result.check
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
                                    error: "Failed to submit solution",
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

export function registerSubmissionTools(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new SubmissionToolRegistry(server, leetcodeService);
    registry.registerTools();
}
