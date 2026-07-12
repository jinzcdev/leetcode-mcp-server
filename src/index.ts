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
import { registerNoteTools } from "./mcp/tools/note-tools.js";
import { registerProblemTools } from "./mcp/tools/problem-tools.js";
import { registerSolutionTools } from "./mcp/tools/solution-tools.js";
import { registerSubmissionTools } from "./mcp/tools/submission-tools.js";
import { registerUserTools } from "./mcp/tools/user-tools.js";
import { startStreamableHttpTransport } from "./transport/streamable-http.js";
import logger from "./utils/logger.js";

type TransportMode = "stdio" | "http";

/**
 * Parses and validates command line arguments for the LeetCode MCP Server.
 *
 * @returns Configuration object with site, transport, and optional session information
 */
function parseArgs() {
    const args = minimist(process.argv.slice(2), {
        string: ["site", "session", "transport", "host", "endpoint"],
        boolean: ["help"],
        alias: {
            s: "site",
            c: "session",
            h: "help",
            t: "transport"
        },
        default: {
            port: 3000
        }
    });

    if (args.help) {
        logger.info(`LeetCode MCP Server - Model Context Protocol server for LeetCode

  Usage: leetcode-mcp-server [options]

  Options:
    --site, -s <site>              LeetCode API site: 'global' (leetcode.com) or 'cn' (leetcode.cn), default is 'global'
    --session, -c <cookie>         Optional LeetCode session cookie for authenticated requests
    --transport, -t <transport>    Transport mode: 'stdio' (default) or 'http' (Streamable HTTP)
    --port <port>                  HTTP server port when using Streamable HTTP transport (default: 3000)
    --host <host>                  HTTP server host when using Streamable HTTP transport (default: 127.0.0.1)
    --endpoint <path>              HTTP endpoint path when using Streamable HTTP transport (default: /mcp)
    --help, -h                     Show this help message

  Environment variables:
    LEETCODE_SITE                  Same as --site
    LEETCODE_SESSION               Same as --session
    LEETCODE_TRANSPORT             Same as --transport
    LEETCODE_HTTP_PORT             Same as --port
    LEETCODE_HTTP_HOST             Same as --host
    LEETCODE_HTTP_ENDPOINT         Same as --endpoint`);
        process.exit(0);
    }

    const transport = (args.transport ||
        process.env.LEETCODE_TRANSPORT ||
        "stdio") as TransportMode;

    const options = {
        site: args.site || process.env.LEETCODE_SITE || "global",
        session: args.session || process.env.LEETCODE_SESSION,
        transport,
        port: Number(args.port || process.env.LEETCODE_HTTP_PORT || 3000),
        host: args.host || process.env.LEETCODE_HTTP_HOST || "127.0.0.1",
        endpoint: args.endpoint || process.env.LEETCODE_HTTP_ENDPOINT || "/mcp"
    };

    if (options.site !== "global" && options.site !== "cn") {
        logger.error("The site must be either 'global' or 'cn'");
        process.exit(1);
    }

    if (options.transport !== "stdio" && options.transport !== "http") {
        logger.error("The transport must be either 'stdio' or 'http'");
        process.exit(1);
    }

    if (
        !Number.isInteger(options.port) ||
        options.port < 1 ||
        options.port > 65535
    ) {
        logger.error("The port must be an integer between 1 and 65535");
        process.exit(1);
    }

    if (!options.endpoint.startsWith("/")) {
        logger.error("The endpoint must start with '/'");
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
 * Creates and configures the LeetCode MCP Server instance.
 */
function createMcpServer(leetcodeService: LeetCodeBaseService): McpServer {
    const packageJSON = getPackageJson();

    const server = new McpServer({
        name: "LeetCode MCP Server",
        version: packageJSON.version
    });

    registerProblemTools(server, leetcodeService);
    registerUserTools(server, leetcodeService);
    registerContestTools(server, leetcodeService);
    registerSolutionTools(server, leetcodeService);
    registerNoteTools(server, leetcodeService);
    registerSubmissionTools(server, leetcodeService);

    registerProblemResources(server, leetcodeService);
    registerSolutionResources(server, leetcodeService);

    return server;
}

/**
 * Main function that initializes and starts the LeetCode MCP Server.
 */
async function main() {
    const options = parseArgs();

    const leetcodeService: LeetCodeBaseService =
        await LeetCodeServiceFactory.createService(
            options.site,
            options.session
        );

    if (options.transport === "http") {
        await startStreamableHttpTransport({
            host: options.host,
            port: options.port,
            endpoint: options.endpoint,
            createServer: () => createMcpServer(leetcodeService)
        });
        return;
    }

    const server = createMcpServer(leetcodeService);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    logger.error("Failed to start LeetCode MCP Server: %s", error);
    process.exit(1);
});
