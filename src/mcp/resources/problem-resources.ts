import {
    McpServer,
    ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    PROBLEM_CATEGORIES,
    PROBLEM_TAGS,
    PROGRAMMING_LANGS
} from "../../common/constants.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ResourceRegistry } from "./resource-registry.js";

/**
 * Problem resource registry class that handles registration of LeetCode problem-related resources.
 * This class manages resources for accessing problem details, categories, tags, and supported languages.
 */
export class ProblemResourceRegistry extends ResourceRegistry {
    protected registerCommon(): void {
        // Problem Categories resource
        this.server.resource(
            "problem-categories",
            "categories://problems/all",
            {
                description:
                    "A list of all problem classification categories in LeetCode platform, including difficulty levels (Easy, Medium, Hard) and algorithmic domains. These categories help organize and filter coding problems for users based on their complexity and topic area. Returns an array of all available problem categories.",
                mimeType: "application/json"
            },
            async (uri, extra) => {
                return {
                    contents: [
                        {
                            uri: uri.toString(),
                            text: JSON.stringify(PROBLEM_CATEGORIES),
                            mimeType: "application/json"
                        }
                    ]
                };
            }
        );

        // Problem Tags resource
        this.server.resource(
            "problem-tags",
            "tags://problems/all",
            {
                description:
                    "A detailed collection of algorithmic and data structure tags used by LeetCode to categorize problems. These tags represent specific algorithms (like 'dynamic-programming', 'binary-search') or data structures (such as 'array', 'queue', 'tree') that are relevant to solving each problem. Returns an array of all available problem tags for filtering and searching problems.",
                mimeType: "application/json"
            },
            async (uri, extra) => {
                return {
                    contents: [
                        {
                            uri: uri.toString(),
                            text: JSON.stringify(PROBLEM_TAGS),
                            mimeType: "application/json"
                        }
                    ]
                };
            }
        );

        // Problem Languages resource
        this.server.resource(
            "problem-langs",
            "langs://problems/all",
            {
                description:
                    "A complete list of all programming languages officially supported by LeetCode for code submission and problem solving. Returns an array of all available programming languages on the platform.",
                mimeType: "application/json"
            },
            async (uri, extra) => {
                return {
                    contents: [
                        {
                            uri: uri.toString(),
                            text: JSON.stringify(PROGRAMMING_LANGS),
                            mimeType: "application/json"
                        }
                    ]
                };
            }
        );

        // Problem Detail resource
        this.server.resource(
            "problem-detail",
            new ResourceTemplate("problem://{titleSlug}", {
                list: undefined
            }),
            {
                description:
                    "Provides details about a specific LeetCode problem, including its description, examples, constraints, and metadata. The titleSlug parameter in the URI identifies the specific problem.",
                mimeType: "application/json"
            },
            async (uri, variables, extra) => {
                const titleSlug = variables.titleSlug as string;
                try {
                    const problemDetail =
                        await this.leetcodeService.fetchProblem(titleSlug);
                    return {
                        contents: [
                            {
                                uri: uri.toString(),
                                text: JSON.stringify({
                                    titleSlug,
                                    problem: problemDetail
                                }),
                                mimeType: "application/json"
                            }
                        ]
                    };
                } catch (error: any) {
                    return {
                        contents: [
                            {
                                uri: uri.toString(),
                                text: JSON.stringify({
                                    error: "Failed to fetch problem detail",
                                    message: error.message
                                }),
                                mimeType: "application/json"
                            }
                        ]
                    };
                }
            }
        );
    }
}

/**
 * Registers all problem-related resources with the MCP server.
 *
 * @param server - The MCP server instance to register resources with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerProblemResources(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new ProblemResourceRegistry(server, leetcodeService);
    registry.registerResources();
}
