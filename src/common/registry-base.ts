import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LeetCodeBaseService } from "../services/leetcode-base-service.js";

/**
 * Abstract base registry class for LeetCode components that provides site type detection and authentication status checks.
 * This class defines the framework for registering different categories of components based on
 * site version (Global or CN) and authentication requirements.
 */
export abstract class RegistryBase {
    /**
     * Creates a new registry instance.
     *
     * @param server - The MCP server instance to register components with
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
     * Registers all applicable components based on site version and authentication status.
     * This method follows a specific registration sequence to ensure proper component organization.
     */
    public register(): void {
        // 1. Register unauthenticated common components (available on both Global and CN)
        this.registerCommon();

        // 2. Register unauthenticated site-specific components based on site version
        if (this.isCN()) {
            this.registerChina();
        } else {
            this.registerGlobal();
        }

        // 3. Register authenticated components only if authentication credentials are available
        if (this.isAuthenticated()) {
            this.registerAuthenticatedCommon();

            if (this.isCN()) {
                this.registerAuthenticatedChina();
            } else {
                this.registerAuthenticatedGlobal();
            }
        }
    }

    /**
     * Registers common components available on both Global and CN platforms that don't require authentication.
     * Implementing classes must define this method to register their specific common components.
     */
    protected registerCommon(): void {}

    /**
     * Registers components specific to the Global LeetCode site that don't require authentication.
     * Implementing classes must define this method to register their Global-specific components.
     */
    protected registerGlobal(): void {}

    /**
     * Registers components specific to the China LeetCode site that don't require authentication.
     * Implementing classes must define this method to register their China-specific components.
     */
    protected registerChina(): void {}

    /**
     * Registers common components available on both Global and CN platforms that require authentication.
     * Implementing classes must define this method to register their authenticated common components.
     */
    protected registerAuthenticatedCommon(): void {}

    /**
     * Registers components specific to the Global LeetCode site that require authentication.
     * Implementing classes must define this method to register their authenticated Global-specific components.
     */
    protected registerAuthenticatedGlobal(): void {}

    /**
     * Registers components specific to the China LeetCode site that require authentication.
     * Implementing classes must define this method to register their authenticated China-specific components.
     */
    protected registerAuthenticatedChina(): void {}
}
