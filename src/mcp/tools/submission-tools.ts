import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PROGRAMMING_LANGS } from "../../common/constants.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

export class SubmissionToolRegistry extends ToolRegistry {
    protected registerAuthenticatedCommon(): void {
        this.server.tool(
            "run_code",
            "Runs code against test cases without submitting (side effect: creates interpret request on LeetCode, requires auth). Polls /check/ until finished; returns start response and final check JSON. Supports custom input via dataInput. Use submit_solution for official judging; use run_code for testing/debugging only.",
            {
                titleSlug: z
                    .string()
                    .min(1)
                    .describe("Problem URL slug (e.g., 'two-sum')"),
                lang: z
                    .enum(PROGRAMMING_LANGS as [string])
                    .describe("Language slug (e.g., 'python3', 'cpp', 'java')"),
                typedCode: z
                    .string()
                    .min(1)
                    .describe("Source code to run (not logged by this server)"),
                dataInput: z
                    .string()
                    .optional()
                    .describe(
                        "Custom test input. Omit to use LeetCode default test cases."
                    ),
                timeoutMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(120000)
                    .describe("Max wait for result in ms (default: 120000)"),
                pollIntervalMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(1500)
                    .describe("Polling interval in ms (default: 1500)")
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
            "Submits code for official judging (side effect: creates submission on LeetCode, requires auth). Polls /check/ until finished; returns start response and final check JSON. Counts toward submission history. Use run_code for dry-run testing with optional custom input; use submit_solution when ready for final judging.",
            {
                titleSlug: z
                    .string()
                    .min(1)
                    .describe("Problem URL slug (e.g., 'two-sum')"),
                lang: z
                    .enum(PROGRAMMING_LANGS as [string])
                    .describe("Language slug (e.g., 'python3', 'cpp', 'java')"),
                typedCode: z
                    .string()
                    .min(1)
                    .describe(
                        "Source code to submit (not logged by this server)"
                    ),
                timeoutMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(120000)
                    .describe("Max wait for result in ms (default: 120000)"),
                pollIntervalMs: z
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .default(1500)
                    .describe("Polling interval in ms (default: 1500)")
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
