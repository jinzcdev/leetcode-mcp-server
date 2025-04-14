#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import minimist from "minimist";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LeetCodeBaseService } from "./leetcode/leetcode-base-service.js";
import { LeetCodeServiceFactory } from "./leetcode/leetcode-service-factory.js";
import { registerProblemResources } from "./mcp/resources/problem-resources.js";
import { registerSolutionResources } from "./mcp/resources/solution-resources.js";
import { registerContestTools } from "./mcp/tools/contest-tools.js";
import { registerProblemTools } from "./mcp/tools/problem-tools.js";
import { registerSolutionTools } from "./mcp/tools/solution-tools.js";
import { registerUserTools } from "./mcp/tools/user-tools.js";

/**
 * Parses and validates command line arguments for the LeetCode MCP Server.
 *
 * @returns Configuration object with site and optional session information
 */
function parseArgs() {
    const args = minimist(process.argv.slice(2), {
        string: ["site", "session"],
        boolean: ["help"],
        alias: {
            s: "site",
            c: "session",
            h: "help"
        }
    });

    if (args.help) {
        console.log(`LeetCode MCP Server - Model Context Protocol server for LeetCode

  Usage: leetcode-mcp-server [options]

  Options:
    --site, -s <site>          LeetCode API site: 'global' (leetcode.com) or 'cn' (leetcode.cn), default is 'global'
    --session, -c <cookie>     Optional LeetCode session cookie for authenticated requests
    --help, -h                 Show this help message`);
        process.exit(0);
    }

    const options = {
        site: args.site || process.env.LEETCODE_SITE || "global",
        session: args.session || process.env.LEETCODE_SESSION
    };

    if (options.site !== "global" && options.site !== "cn") {
        console.error("The site must be either 'global' or 'cn'");
        process.exit(1);
    }

    return options;
}

/**
 * Retrieves the package.json object containing metadata about the project.
 *
 * @returns The package.json object containing metadata about the project.
 */
function getPackageJson() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJSONPath = join(__dirname, "..", "package.json");
    const packageJSON = JSON.parse(readFileSync(packageJSONPath, "utf-8"));
    return packageJSON;
}

/**
 * Main function that initializes and starts the LeetCode MCP Server.
 * This function creates the server, sets up the LeetCode service,
 * registers all tools and resources, and connects the server to the stdio transport.
 */
async function main() {
    const options = parseArgs();
    const packageJSON = getPackageJson();

    const server = new McpServer({
        name: "LeetCode MCP Server",
        version: packageJSON.version
    });

    const leetcodeService: LeetCodeBaseService =
        await LeetCodeServiceFactory.createService(
            options.site,
            options.session
        );

    registerProblemTools(server, leetcodeService);
    registerUserTools(server, leetcodeService);
    registerContestTools(server, leetcodeService);
    registerSolutionTools(server, leetcodeService);

    registerProblemResources(server, leetcodeService);
    registerSolutionResources(server, leetcodeService);

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error("Failed to start LeetCode MCP Server:", error);
    process.exit(1);
});
