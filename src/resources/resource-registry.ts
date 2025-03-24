import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RegistryBase } from "../common/registry-base.js";
import { LeetCodeBaseService } from "../services/leetcode-base-service.js";

/**
 * Base registry class for LeetCode resources that provides site type detection and authentication status checks.
 * This abstract class defines the framework for registering different categories of resources based on
 * site version (Global or CN) and authentication requirements.
 */
export abstract class ResourceRegistry extends RegistryBase {
    /**
     * Creates a new resource registry instance.
     *
     * @param server - The MCP server instance to register resources with
     * @param leetcodeService - The LeetCode service implementation to use for API calls
     */
    constructor(
        protected server: McpServer,
        protected leetcodeService: LeetCodeBaseService
    ) {
        super(server, leetcodeService);
    }

    /**
     * Registers all applicable resources based on site version and authentication status.
     */
    public registerResources(): void {
        this.register();
    }
}
