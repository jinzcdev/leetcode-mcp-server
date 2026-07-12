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
            "Searches the authenticated user's personal notes across all problems (read-only, requires auth, CN only). Keyword search with pagination. Use get_note when you know the specific questionId; use this to find notes by keyword across problems.",
            {
                keyword: z
                    .string()
                    .optional()
                    .describe(
                        "Search term to filter notes by content or title. Omit to list all notes."
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe("Max notes per page (default: 10)"),
                skip: z
                    .number()
                    .optional()
                    .default(0)
                    .describe("Notes to skip for pagination (default: 0)"),
                orderBy: z
                    .enum(["ASCENDING", "DESCENDING"])
                    .optional()
                    .default("DESCENDING")
                    .describe(
                        "'DESCENDING' = newest first (default); 'ASCENDING' = oldest first"
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
            "Retrieves personal notes for a specific problem by questionId (read-only, requires auth, CN only). Use search_notes to find notes across problems by keyword when you don't know the questionId.",
            {
                questionId: z
                    .string()
                    .describe(
                        "Numeric problem ID (e.g., '42' for Trapping Rain Water)—not the titleSlug"
                    ),
                limit: z
                    .number()
                    .optional()
                    .default(10)
                    .describe("Max notes per page (default: 10)"),
                skip: z
                    .number()
                    .optional()
                    .default(0)
                    .describe("Notes to skip for pagination (default: 0)")
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
            "Creates a new personal note for a problem (write operation, requires auth, CN only). Supports markdown content. Returns { success, note } as JSON. Use update_note to modify an existing note by noteId.",
            {
                questionId: z
                    .string()
                    .describe(
                        "Numeric problem ID (e.g., '42')—not the titleSlug"
                    ),
                content: z.string().describe("Note body (markdown supported)"),
                title: z
                    .string()
                    .optional()
                    .default("")
                    .describe("Optional short title or summary")
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
            "Updates an existing personal note by noteId (write operation, requires auth, CN only). Use create_note for new notes; use get_note or search_notes first to find the noteId.",
            {
                noteId: z
                    .string()
                    .describe("Note ID from get_note or search_notes response"),
                content: z
                    .string()
                    .default("")
                    .describe("New note body (markdown supported)"),
                title: z
                    .string()
                    .default("")
                    .describe("New short title or summary")
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
