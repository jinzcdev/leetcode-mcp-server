import {
    McpServer,
    ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ResourceRegistry } from "./resource-registry.js";

/**
 * Solution resource registry class that handles registration of LeetCode solution-related resources.
 * This class manages resources for accessing solution articles and solution details.
 */
export class SolutionResourceRegistry extends ResourceRegistry {
    protected registerGlobal(): void {
        // Global solution article resource
        this.server.resource(
            "solution-article",
            new ResourceTemplate("leetcode://solutions/{topicId}", {
                list: undefined
            }),
            {
                description:
                    "Provides the complete content and metadata of a specific solution article on LeetCode Global, including the full article text, author information, and related navigation links. The topicId parameter in the URI identifies the specific solution article. This ID can be obtained from the 'topicId' field in the response of the 'leetcode_solution_article_list' tool.",
                mimeType: "application/json"
            },
            async (uri, variables, extra) => {
                const topicId = variables.topicId as string;
                try {
                    const solutionDetail =
                        await this.leetcodeService.fetchSolutionArticleDetail(
                            topicId
                        );
                    return {
                        contents: [
                            {
                                uri: uri.toString(),
                                text: JSON.stringify({
                                    topicId,
                                    solution: solutionDetail
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
                                    error: "Failed to fetch solution article",
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

    protected registerChina(): void {
        // China solution article resource
        this.server.resource(
            "solution-article",
            new ResourceTemplate("leetcode://solutions/{slug}", {
                list: undefined
            }),
            {
                description:
                    "Provides the complete content and metadata of a specific solution article, including the full article text, author information, and related navigation links. This slug can be obtained from the 'node.slug' field in the response of the 'leetcode_solution_article_list' tool.",
                mimeType: "application/json"
            },
            async (uri, variables, extra) => {
                const slug = variables.slug as string;
                try {
                    const solutionDetail =
                        await this.leetcodeService.fetchSolutionArticleDetail(
                            slug
                        );
                    return {
                        contents: [
                            {
                                uri: uri.toString(),
                                text: JSON.stringify({
                                    slug,
                                    solution: solutionDetail
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
                                    error: "Failed to fetch solution article",
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
 * Registers all solution-related resources with the MCP server.
 *
 * @param server - The MCP server instance to register resources with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerSolutionResources(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new SolutionResourceRegistry(server, leetcodeService);
    registry.registerResources();
}
