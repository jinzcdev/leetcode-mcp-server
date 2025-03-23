import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LANG, PROBLEM_CATEGORIES, PROBLEM_TAGS } from "../constants.js";
import { LeetCodeBaseService } from "../services/leetcode-base-service.js";

/**
 * Registers problem-related resources with the MCP server.
 * These resources provide reference data about problem categories, tags, and supported programming languages.
 *
 * @param server - The MCP server instance to register resources with
 * @param leetcodeService - The LeetCode service implementation (not used directly in this function but kept for consistency)
 */
export function registerProblemResources(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
) {
    /**
     * LeetCode Problem Categories
     */
    server.resource(
        "problem-categories",
        "leetcode://problems/categories/all",
        {
            description:
                "A comprehensive list of all problem classification categories in LeetCode platform, including difficulty levels (Easy, Medium, Hard) and algorithmic domains. These categories help organize and filter coding problems for users based on their complexity and topic area. Returns an array of all available problem categories.",
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

    /**
     * LeetCode Problem Tags
     */
    server.resource(
        "problem-tags",
        "leetcode://problems/tags/all",
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

    /**
     * LeetCode Problem Languages
     */
    server.resource(
        "problem-langs",
        "leetcode://problems/langs/all",
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
                        text: JSON.stringify(LANG),
                        mimeType: "application/json"
                    }
                ]
            };
        }
    );
}
