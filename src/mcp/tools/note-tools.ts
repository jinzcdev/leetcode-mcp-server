import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";
import { ToolRegistry } from "./tool-registry.js";

/**
 * Note tool registry class that handles registration of LeetCode note-related tools.
 * This class manages tools for accessing and searching user notes on LeetCode CN.
 */
export class NoteToolRegistry extends ToolRegistry {
    protected registerAuthenticatedChina(): void {
        // Notes search tool (CN-specific)
        this.server.tool(
            "search_notes",
            "Searches for user notes on LeetCode with filtering options, returning note content and associated problem information (requires authentication)",
            {
                keyword: z
                    .string()
                    .optional()
                    .describe(
                        "Optional search term to filter notes by content or title"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe(
                        "Maximum number of notes to return per request (defaults to 10)"
                    ),
                skip: z
                    .number()
                    .optional()
                    .default(0)
                    .describe(
                        "Number of notes to skip before returning results (for pagination)"
                    ),
                orderBy: z
                    .enum(["ASCENDING", "DESCENDING"])
                    .optional()
                    .default("DESCENDING")
                    .describe(
                        "Sort order for returned notes: 'DESCENDING' (newest first) or 'ASCENDING' (oldest first)"
                    )
            },
            async ({ keyword, limit, skip, orderBy }) => {
                try {
                    const options = {
                        aggregateType: "QUESTION_NOTE",
                        keyword,
                        orderBy,
                        limit,
                        skip
                    };

                    const data =
                        await this.leetcodeService.fetchUserNotes(options);

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    filters: { keyword, orderBy },
                                    pagination: {
                                        limit,
                                        skip,
                                        totalCount: data.count
                                    },
                                    notes: data.userNotes
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
                                    error: "Failed to search notes",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        // Notes detail tool (CN-specific, requires authentication)
        this.server.tool(
            "get_note",
            "Retrieves user notes for a specific LeetCode problem by its question ID, returning the complete note content and metadata (requires authentication)",
            {
                questionId: z
                    .string()
                    .describe(
                        "The question ID of the LeetCode problem to get notes for (e.g., '42' for 'Trapping Rain Water')"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe(
                        "Maximum number of notes to return per request (defaults to 10)"
                    ),
                skip: z
                    .number()
                    .optional()
                    .default(0)
                    .describe(
                        "Number of notes to skip before returning results (for pagination)"
                    )
            },
            async ({ questionId, limit = 20, skip = 0 }) => {
                try {
                    const data =
                        await this.leetcodeService.fetchNotesByQuestionId(
                            questionId,
                            limit,
                            skip
                        );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    questionId,
                                    count: data.count,
                                    pagination: { limit, skip },
                                    notes: data.userNotes
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
                                    error: "Failed to get note for question",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        // Note creation tool (CN-specific, requires authentication)
        this.server.tool(
            "create_note",
            "Creates a new note for a specific LeetCode problem, allowing users to save personal comments and observations for future reference (requires authentication, CN only)",
            {
                questionId: z
                    .string()
                    .describe(
                        "The question ID of the LeetCode problem to create a note for (e.g., '42' for 'Trapping Rain Water')"
                    ),
                content: z
                    .string()
                    .describe(
                        "The content of the note (supports markdown format)"
                    ),
                title: z
                    .string()
                    .optional()
                    .default("")
                    .describe("An short title or summary for the note")
            },
            async ({ questionId, content, title = "" }) => {
                try {
                    const data = await this.leetcodeService.createUserNote(
                        content,
                        "COMMON_QUESTION",
                        questionId,
                        title
                    );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    success: data.ok,
                                    note: data.note
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
                                    error: "Failed to create note",
                                    message: error.message
                                })
                            }
                        ]
                    };
                }
            }
        );

        // Note update tool (CN-specific, requires authentication)
        this.server.tool(
            "update_note",
            "Updates an existing note with new content or title, allowing users to refine their saved observations (requires authentication, CN only)",
            {
                noteId: z.string().describe("The ID of the note to update"),
                content: z
                    .string()
                    .default("")
                    .describe(
                        "The new content for the note (supports markdown format)"
                    ),
                title: z
                    .string()
                    .default("")
                    .describe("An new short title or summary for the note")
            },
            async ({ noteId, content, title = "" }) => {
                try {
                    const data = await this.leetcodeService.updateUserNote(
                        noteId,
                        content,
                        title
                    );

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    success: data.ok,
                                    note: data.note
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
                                    error: "Failed to update note",
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
 * Registers all note-related tools with the MCP server.
 *
 * @param server - The MCP server instance to register tools with
 * @param leetcodeService - The LeetCode service implementation to use for API calls
 */
export function registerNoteTools(
    server: McpServer,
    leetcodeService: LeetCodeBaseService
): void {
    const registry = new NoteToolRegistry(server, leetcodeService);
    registry.registerTools();
}
