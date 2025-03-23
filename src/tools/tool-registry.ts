import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeBaseService } from "../services/leetcode-base-service.js";

/**
 * Base registry class for LeetCode tools that provides site type detection and authentication status checks.
 * This abstract class defines the framework for registering different categories of tools based on
 * site version (Global or CN) and authentication requirements.
 */
export abstract class ToolRegistry {
    /**
     * Creates a new tool registry instance.
     *
     * @param server - The MCP server instance to register tools with
     * @param leetcodeService - The LeetCode service implementation to use for API calls
     */
    constructor(
        protected server: McpServer,
        protected leetcodeService: LeetCodeBaseService
    ) {}

    /**
     * Determines if the current LeetCode service is for the China version.
     *
     * @returns True if the service is for LeetCode CN, false otherwise
     */
    protected isCN(): boolean {
        return this.leetcodeService.isCN();
    }

    /**
     * Determines if the current LeetCode service has valid authentication credentials.
     *
     * @returns True if authenticated, false otherwise
     */
    protected isAuthenticated(): boolean {
        return this.leetcodeService.isAuthenticated();
    }

    /**
     * Registers all applicable tools based on site version and authentication status.
     * This method follows a specific registration sequence to ensure proper tool organization.
     */
    public registerTools(): void {
        // 1. Register unauthenticated common tools (available on both Global and CN)
        this.registerCommonTools();

        // 2. Register unauthenticated site-specific tools based on site version
        if (this.isCN()) {
            this.registerChinaTools();
        } else {
            this.registerGlobalTools();
        }

        // Register authenticated tools only if authentication credentials are available
        if (this.isAuthenticated()) {
            this.registerAuthenticatedCommonTools();

            if (this.isCN()) {
                this.registerAuthenticatedChinaTools();
            } else {
                this.registerAuthenticatedGlobalTools();
            }
        }
    }

    /**
     * Registers common tools available on both Global and CN platforms that don't require authentication.
     * Implementing classes must define this method to register their specific common tools.
     */
    protected abstract registerCommonTools(): void;

    /**
     * Registers tools specific to the Global LeetCode site that don't require authentication.
     * Implementing classes must define this method to register their Global-specific tools.
     */
    protected abstract registerGlobalTools(): void;

    /**
     * Registers tools specific to the China LeetCode site that don't require authentication.
     * Implementing classes must define this method to register their China-specific tools.
     */
    protected abstract registerChinaTools(): void;

    /**
     * Registers common tools available on both Global and CN platforms that require authentication.
     * Implementing classes must define this method to register their authenticated common tools.
     */
    protected abstract registerAuthenticatedCommonTools(): void;

    /**
     * Registers tools specific to the Global LeetCode site that require authentication.
     * Implementing classes must define this method to register their authenticated Global-specific tools.
     */
    protected abstract registerAuthenticatedGlobalTools(): void;

    /**
     * Registers tools specific to the China LeetCode site that require authentication.
     * Implementing classes must define this method to register their authenticated China-specific tools.
     */
    protected abstract registerAuthenticatedChinaTools(): void;
}
