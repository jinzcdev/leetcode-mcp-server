import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import logger from "../utils/logger.js";

type McpRequest = IncomingMessage & { body?: unknown };
type McpResponse = ServerResponse & {
    status(code: number): McpResponse;
    json(body: unknown): void;
    send(body: string): void;
};

export interface StreamableHttpOptions {
    host: string;
    port: number;
    endpoint: string;
    createServer: () => Promise<McpServer> | McpServer;
}

/**
 * Starts the MCP server using the Streamable HTTP transport.
 *
 * Implements stateful session management with POST, GET (SSE), and DELETE endpoints
 * as defined in the MCP Streamable HTTP specification.
 */
export async function startStreamableHttpTransport(
    options: StreamableHttpOptions
): Promise<void> {
    const { host, port, endpoint, createServer } = options;
    const app = createMcpExpressApp({ host });
    const transports: Record<string, StreamableHTTPServerTransport> = {};

    const mcpPostHandler = async (req: McpRequest, res: McpResponse) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        try {
            let transport: StreamableHTTPServerTransport;

            if (sessionId && transports[sessionId]) {
                transport = transports[sessionId];
            } else if (!sessionId && isInitializeRequest(req.body)) {
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (id) => {
                        transports[id] = transport;
                        logger.info("MCP session initialized: %s", id);
                    }
                });

                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid && transports[sid]) {
                        logger.info("MCP session closed: %s", sid);
                        delete transports[sid];
                    }
                };

                const server = await createServer();
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
                return;
            } else {
                res.status(400).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32000,
                        message: "Bad Request: No valid session ID provided"
                    },
                    id: null
                });
                return;
            }

            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            logger.error("Error handling MCP POST request: %s", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32603,
                        message: "Internal server error"
                    },
                    id: null
                });
            }
        }
    };

    const mcpGetHandler = async (req: McpRequest, res: McpResponse) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (!sessionId || !transports[sessionId]) {
            res.status(400).send("Invalid or missing session ID");
            return;
        }

        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    };

    const mcpDeleteHandler = async (req: McpRequest, res: McpResponse) => {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (!sessionId || !transports[sessionId]) {
            res.status(400).send("Invalid or missing session ID");
            return;
        }

        logger.info("MCP session termination requested: %s", sessionId);

        try {
            const transport = transports[sessionId];
            await transport.handleRequest(req, res);
        } catch (error) {
            logger.error("Error handling MCP session termination: %s", error);
            if (!res.headersSent) {
                res.status(500).send("Error processing session termination");
            }
        }
    };

    app.post(endpoint, mcpPostHandler);
    app.get(endpoint, mcpGetHandler);
    app.delete(endpoint, mcpDeleteHandler);

    const closeAllTransports = async () => {
        for (const sessionId of Object.keys(transports)) {
            try {
                await transports[sessionId].close();
                delete transports[sessionId];
            } catch (error) {
                logger.error(
                    "Error closing transport for session %s: %s",
                    sessionId,
                    error
                );
            }
        }
    };

    process.on("SIGINT", async () => {
        logger.info("Shutting down Streamable HTTP server...");
        await closeAllTransports();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        logger.info("Shutting down Streamable HTTP server...");
        await closeAllTransports();
        process.exit(0);
    });

    await new Promise<void>((resolve, reject) => {
        app.listen(port, host, (error?: Error) => {
            if (error) {
                reject(error);
                return;
            }

            logger.info(
                "LeetCode MCP Server (Streamable HTTP) listening on http://%s:%d%s",
                host,
                port,
                endpoint
            );
            resolve();
        });
    });
}
