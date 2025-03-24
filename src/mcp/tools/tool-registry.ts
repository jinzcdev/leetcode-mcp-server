import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RegistryBase } from "../../common/registry-base.js";
import { LeetCodeBaseService } from "../../leetcode/leetcode-base-service.js";

/**
 * Base registry class for LeetCode tools that provides site type detection and authentication status checks.
 * This abstract class defines the framework for registering different categories of tools based on
 * site version (Global or CN) and authentication requirements.
 */
export abstract class ToolRegistry extends RegistryBase {
    /**
     * Creates a new tool registry instance.
     *
     * @param server - The MCP server instance to register tools with
     * @param leetcodeService - The LeetCode service implementation to use for API calls
     */
    constructor(
        protected server: McpServer,
        protected leetcodeService: LeetCodeBaseService
    ) {
        super(server, leetcodeService);
    }

    /**
     * Registers all applicable tools based on site version and authentication status.
     * This method follows a specific registration sequence to ensure proper tool organization.
     */
    public registerTools(): void {
        this.register();
    }
}
