# LeetCode MCP Server

[![NPM Version](https://img.shields.io/npm/v/@jinzcdev/leetcode-mcp-server.svg)](https://www.npmjs.com/package/@jinzcdev/leetcode-mcp-server)
[![Chinese Doc](https://img.shields.io/badge/docs-中文-blue)](README_zh-CN.md)
[![NPM Downloads](https://img.shields.io/npm/dm/@jinzcdev/leetcode-mcp-server.svg)](https://www.npmjs.com/package/@jinzcdev/leetcode-mcp-server)
[![GitHub License](https://img.shields.io/github/license/jinzcdev/leetcode-mcp-server.svg)](./LICENSE)
[![LeetCode MCP Server on Glama](https://glama.ai/mcp/servers/jinzcdev/leetcode-mcp-server/badges/score.svg)](https://glama.ai/mcp/servers/jinzcdev/leetcode-mcp-server)
[![Stars](https://img.shields.io/github/stars/jinzcdev/leetcode-mcp-server)](https://github.com/jinzcdev/leetcode-mcp-server)

The LeetCode MCP Server is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that provides seamless integration with LeetCode APIs, enabling advanced automation and intelligent interaction with LeetCode's programming problems, contests, solutions, and user data.

## Features

- 🌐 **Multi-site Support**: Support​ both leetcode.com (Global) and leetcode.cn (China) platforms
- 🔌 **Dual Transport Modes**: Run as a stdio process (default) or as a [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports) server for web-based integrations
- 📊 **Problem Data Retrieval**: Obtain detailed problem descriptions, constraints, examples, official editorials, and ​user-submitted solutions
- 👤 **User Data Access**: Retrieve user profiles, submission history, and contest performance
- 🔒 **​Private Data Access**: Create and query user notes, track problem-solving progress, and analyze submission details (AC/WA analysis)
- 🔍 **Advanced Search Capabilities**: Filter problems by tags, difficulty levels, categories, and keywords
- 📅 **Daily Challenge Access**: Easily access daily challenge problems

## Prerequisites

1. Node.js (v20.x or above)
2. (Optional) LeetCode session cookie for authenticated API access

## Installation

```bash
# Install from npm
npm install @jinzcdev/leetcode-mcp-server -g

# Run with Global site configuration (stdio transport, default)
npx -y @jinzcdev/leetcode-mcp-server --site global

# Run with authentication (for accessing private data)
npx -y @jinzcdev/leetcode-mcp-server --site global --session <YOUR_LEETCODE_SESSION_COOKIE>

# Run as a Streamable HTTP server
npx -y @jinzcdev/leetcode-mcp-server --transport http --port 3000 --site global
```

Alternatively, you can clone the repository and run it locally:

```bash
# Clone the repository
git clone https://github.com/jinzcdev/leetcode-mcp-server.git

# Navigate to the project directory
cd leetcode-mcp-server

# Build the project
npm install && npm run build

# Run the server (stdio transport)
node build/index.js --site global

# Or run as a Streamable HTTP server
node build/index.js --transport http --port 3000 --site global
```

## Usage

The server supports two transport modes:

| Transport         | Description                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `stdio` (default) | Standard input/output transport for local MCP clients                                                                              |
| `http`            | [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports) transport for web-based integrations and remote access |

### Command-Line Options

| Option        | Alias | Default     | Description                                                      |
| ------------- | ----- | ----------- | ---------------------------------------------------------------- |
| `--site`      | `-s`  | `global`    | LeetCode API site: `global` (leetcode.com) or `cn` (leetcode.cn) |
| `--session`   | `-c`  | —           | LeetCode session cookie for authenticated requests               |
| `--transport` | `-t`  | `stdio`     | Transport mode: `stdio` or `http`                                |
| `--port`      | —     | `3000`      | HTTP server port (Streamable HTTP only)                          |
| `--host`      | —     | `127.0.0.1` | HTTP server host (Streamable HTTP only)                          |
| `--endpoint`  | —     | `/mcp`      | HTTP endpoint path (Streamable HTTP only)                        |

### MCP Client Configuration (stdio)

Add the following server entry to your MCP client configuration file:

#### Option 1: Using Environment Variables

```json
{
  "mcpServers": {
    "leetcode": {
      "command": "npx",
      "args": ["-y", "@jinzcdev/leetcode-mcp-server"],
      "env": {
        "LEETCODE_SITE": "global",
        "LEETCODE_SESSION": "<YOUR_LEETCODE_SESSION_COOKIE>"
      }
    }
  }
}
```

#### Option 2: Using Command Line Arguments

```json
{
  "mcpServers": {
    "leetcode": {
      "command": "npx",
      "args": [
        "-y",
        "@jinzcdev/leetcode-mcp-server",
        "--site",
        "global",
        "--session",
        "<YOUR_LEETCODE_SESSION_COOKIE>"
      ]
    }
  }
}
```

For LeetCode China site, modify the `--site` parameter to `cn`.

> [!NOTE]
>
> The exact configuration file location and JSON structure may vary by MCP client. Some clients use an `mcp.servers` wrapper or a `type` field — refer to your client's documentation and adapt the example accordingly.

### MCP Client Configuration (Streamable HTTP)

First, start the server in HTTP mode:

```bash
npx -y @jinzcdev/leetcode-mcp-server --transport http --port 3000 --site global
```

Then connect your MCP client to the running server:

```json
{
  "mcpServers": {
    "leetcode": {
      "type": "http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

To use authenticated endpoints, pass the session cookie when starting the server:

```bash
npx -y @jinzcdev/leetcode-mcp-server --transport http --port 3000 --site global --session <YOUR_LEETCODE_SESSION_COOKIE>
```

> [!NOTE]
> Some MCP clients use `"type": "http"` or `"type": "streamableHttp"` alongside the `url` field. Refer to your client's documentation for the exact HTTP transport configuration format.

> [!TIP]
>
> The server supports the following optional environment variables:
>
> - `LEETCODE_SITE`: LeetCode API endpoint (`global` or `cn`, default: `global`)
> - `LEETCODE_SESSION`: LeetCode session cookie for authenticated API access (default: empty)
> - `LEETCODE_TRANSPORT`: Transport mode (`stdio` or `http`, default: `stdio`)
> - `LEETCODE_HTTP_PORT`: HTTP server port when using Streamable HTTP (default: `3000`)
> - `LEETCODE_HTTP_HOST`: HTTP server host when using Streamable HTTP (default: `127.0.0.1`)
> - `LEETCODE_HTTP_ENDPOINT`: HTTP endpoint path when using Streamable HTTP (default: `/mcp`)
>
> **Priority Note**:
> Command-line arguments take precedence over environment variables when both are specified. For example:
>
> - If `LEETCODE_SITE=cn` is set but you run `leetcode-mcp-server --site global`, the server will use `global`.
> - If `LEETCODE_SESSION` exists but you provide `--session "new_cookie"`, the command-line session value will be used.

## Available Tools

### Problems

| Tool                    | Global | CN  | Auth Required | Description                                                  |
| ----------------------- | :----: | :-: | :-----------: | ------------------------------------------------------------ |
| **get_daily_challenge** |   ✅   | ✅  |      ❌       | Retrieves today's LeetCode Daily Challenge problem           |
| **get_problem**         |   ✅   | ✅  |      ❌       | Retrieves details for a specific LeetCode problem            |
| **search_problems**     |   ✅   | ✅  |      ❌       | Searches for LeetCode problems with multiple filter criteria |

### Users

| Tool                              | Global | CN  | Auth Required | Description                                                  |
| --------------------------------- | :----: | :-: | :-----------: | ------------------------------------------------------------ |
| **get_user_profile**              |   ✅   | ✅  |      ❌       | Retrieves profile information for a LeetCode user            |
| **get_user_contest_ranking**      |   ✅   | ✅  |      ❌       | Obtains contest ranking statistics for a user                |
| **get_recent_ac_submissions**     |   ✅   | ✅  |      ❌       | Retrieves a user's recent accepted submissions               |
| **get_recent_submissions**        |   ✅   | ❌  |      ❌       | Retrieves a user's recent submissions history                |
| **get_user_status**               |   ✅   | ✅  |      ✅       | Retrieves current user's current status                      |
| **get_problem_submission_report** |   ✅   | ✅  |      ✅       | Provides detailed submission analysis for a specific problem |
| **get_problem_progress**          |   ✅   | ✅  |      ✅       | Retrieves current user's problem-solving progress            |
| **get_all_submissions**           |   ✅   | ✅  |      ✅       | Retrieves current user's submission history                  |

### Submissions

| Tool                | Global | CN  | Auth Required | Description                                                   |
| ------------------- | :----: | :-: | :-----------: | ------------------------------------------------------------- |
| **run_code**        |   ✅   | ✅  |      ✅       | Runs code for a problem and polls `/check/` until finished    |
| **submit_solution** |   ✅   | ✅  |      ✅       | Submits code for a problem and polls `/check/` until finished |

### Notes

| Tool             | Global | CN  | Auth Required | Description                                           |
| ---------------- | :----: | :-: | :-----------: | ----------------------------------------------------- |
| **search_notes** |   ❌   | ✅  |      ✅       | Searches for user notes with filtering options        |
| **get_note**     |   ❌   | ✅  |      ✅       | Retrieves notes for a specific problem by question ID |
| **create_note**  |   ❌   | ✅  |      ✅       | Creates a new note for a specific problem             |
| **update_note**  |   ❌   | ✅  |      ✅       | Updates an existing note with new content             |

### Solutions

| Tool                       | Global | CN  | Auth Required | Description                                                    |
| -------------------------- | :----: | :-: | :-----------: | -------------------------------------------------------------- |
| **list_problem_solutions** |   ✅   | ✅  |      ❌       | Retrieves a list of community solutions for a specific problem |
| **get_problem_solution**   |   ✅   | ✅  |      ❌       | Retrieves the complete content of a specific solution          |

## Tool Parameters

### Problems

- **get_daily_challenge** - Retrieves today's LeetCode Daily Challenge problem with complete details

  - No parameters required

- **get_problem** - Retrieves details about a specific LeetCode problem

  - `titleSlug`: The URL slug/identifier of the problem (string, required)

- **search_problems** - Searches for LeetCode problems based on multiple filter criteria
  - `category`: Problem category filter (string, optional, default: "all-code-essentials")
  - `tags`: List of topic tags to filter problems by (string[], optional)
  - `difficulty`: Problem difficulty level filter (enum: "EASY", "MEDIUM", "HARD", optional)
  - `searchKeywords`: Keywords to search in problem titles and descriptions (string, optional)
  - `limit`: Maximum number of problems to return (number, optional, default: 10)
  - `offset`: Number of problems to skip (number, optional)

### Users

- **get_user_profile** - Retrieves profile information about a LeetCode user

  - `username`: LeetCode username (string, required)

- **get_user_contest_ranking** - Retrieves a user's contest ranking information

  - `username`: LeetCode username (string, required)
  - `attended`: Whether to include only the contests the user has participated in (boolean, optional, default: true)

- **get_recent_submissions** - Retrieves a user's recent submissions on LeetCode Global

  - `username`: LeetCode username (string, required)
  - `limit`: Maximum number of submissions to return (number, optional, default: 10)

- **get_recent_ac_submissions** - Retrieves a user's recent accepted submissions

  - `username`: LeetCode username (string, required)
  - `limit`: Maximum number of submissions to return (number, optional, default: 10)

- **get_user_status** - Retrieves the current user's status

  - No parameters required

- **get_problem_submission_report** - Retrieves detailed information about a specific submission

  - `id`: The numerical submission ID (number, required)

- **get_problem_progress** - Retrieves the current user's problem-solving progress

  - `offset`: Number of questions to skip (number, optional, default: 0)
  - `limit`: Maximum number of questions to return (number, optional, default: 100)
  - `questionStatus`: Filter by question status (enum: "ATTEMPTED", "SOLVED", optional)
  - `difficulty`: Filter by difficulty levels (string[], optional)

- **get_all_submissions** - Retrieves paginated list of user's submissions
  - `limit`: Maximum number of submissions to return (number, default: 20)
  - `offset`: Number of submissions to skip (number, default: 0)
  - `questionSlug`: Optional problem identifier (string, optional)
  - `lang`: Programming language filter (string, optional, CN only)
  - `status`: Submission status filter (enum: "AC", "WA", optional, CN only)
  - `lastKey`: Pagination token for retrieving next page (string, optional, CN only)

### Submissions

- **run_code** - Runs code for a specific problem and waits until finished (requires authentication)

  - `titleSlug`: The URL slug/identifier of the problem (string, required)
  - `lang`: Programming language (string enum, required)
  - `typedCode`: Source code to run (string, required)
  - `dataInput`: Custom input to run (string, optional)
  - `timeoutMs`: Polling timeout in milliseconds (number, optional, default: 120000)
  - `pollIntervalMs`: Polling interval in milliseconds (number, optional, default: 1500)

- **submit_solution** - Submits code for a specific problem and waits until finished (requires authentication)

  - `titleSlug`: The URL slug/identifier of the problem (string, required)
  - `lang`: Programming language (string enum, required)
  - `typedCode`: Source code to submit (string, required)
  - `timeoutMs`: Polling timeout in milliseconds (number, optional, default: 120000)
  - `pollIntervalMs`: Polling interval in milliseconds (number, optional, default: 1500)

### Notes

- **search_notes** - Searches for user notes on LeetCode China

  - `keyword`: Search term to filter notes (string, optional)
  - `limit`: Maximum number of notes to return (number, optional, default: 10)
  - `skip`: Number of notes to skip (number, optional, default: 0)
  - `orderBy`: Sort order for returned notes (enum: "ASCENDING", "DESCENDING", optional, default: "DESCENDING")

- **get_note** - Retrieves user notes for a specific LeetCode problem
  - `questionId`: The question ID of the LeetCode problem (string, required)
  - `limit`: Maximum number of notes to return (number, optional, default: 10)
  - `skip`: Number of notes to skip (number, optional, default: 0)
- **create_note** - Creates a new note for a specific LeetCode problem

  - `questionId`: The question ID of the LeetCode problem (string, required)
  - `content`: The content of the note, supports markdown format (string, required)
  - `summary`: An optional short summary or title for the note (string, optional)

- **update_note** - Updates an existing note with new content or summary
  - `noteId`: The ID of the note to update (string, required)
  - `content`: The new content for the note, supports markdown format (string, required)
  - `summary`: An optional new short summary or title for the note (string, optional)

### Solutions

- **list_problem_solutions** - Retrieves a list of community solutions for a specific problem

  - `questionSlug`: The URL slug/identifier of the problem (string, required)
  - `limit`: Maximum number of solutions to return (number, optional, default: 10)
  - `skip`: Number of solutions to skip (number, optional)
  - `userInput`: Search term to filter solutions (string, optional)
  - `tagSlugs`: Array of tag identifiers to filter solutions (string[], optional, default: [])
  - `orderBy`: Sorting criteria for the returned solutions
    - Global: enum: "HOT", "MOST_RECENT", "MOST_VOTES", optional, default: "HOT"
    - CN: enum: "DEFAULT", "MOST_UPVOTE", "HOT", "NEWEST_TO_OLDEST", "OLDEST_TO_NEWEST", optional, default: "DEFAULT"

- **get_problem_solution** - Retrieves the complete content of a specific solution
  - `topicId`: Unique topic ID of the solution (string, required, Global only)
  - `slug`: Unique slug/identifier of the solution (string, required, CN only)

## Available Resources

| Resource Name          | Global | CN  | Auth Required | Description                                                  |
| ---------------------- | :----: | :-: | :-----------: | ------------------------------------------------------------ |
| **problem-categories** |   ✅   | ✅  |      ❌       | A list of all problem classification categories              |
| **problem-tags**       |   ✅   | ✅  |      ❌       | A detailed collection of algorithmic and data structure tags |
| **problem-langs**      |   ✅   | ✅  |      ❌       | A complete list of all supported programming languages       |
| **problem-detail**     |   ✅   | ✅  |      ❌       | Provides details about a specific problem                    |
| **problem-solution**   |   ✅   | ✅  |      ❌       | Provides the complete content of a specific solution         |

## Resource URIs

- **problem-categories** - A list of all problem classification categories

  - URI: `categories://problems/all`

- **problem-tags** - A detailed collection of algorithmic and data structure tags

  - URI: `tags://problems/all`

- **problem-langs** - A complete list of all programming languages supported by LeetCode

  - URI: `langs://problems/all`

- **problem-detail** - Provides details about a specific LeetCode problem

  - URI: `problem://{titleSlug}`
  - Parameters:
    - `titleSlug`: Problem identifier as it appears in the LeetCode URL

- **problem-solution** - Provides the complete content of a specific solution
  - Global URI: `solution://{topicId}`
    - Parameters:
      - `topicId`: Unique topic ID of the solution
  - CN URI: `solution://{slug}`
    - Parameters:
      - `slug`: Unique slug/identifier of the solution

## Authentication

User-specific data access requires LeetCode session authentication:

1. Log in to LeetCode ([Global](https://leetcode.com) or [China](https://leetcode.cn) site)
2. Extract `LEETCODE_SESSION` cookie from browser developer tools
3. Configure server with `--session` flag or `LEETCODE_SESSION` environment variable

## Response Format

All tools return JSON-formatted responses with the following structure:

```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON_DATA_STRING"
    }
  ]
}
```

The `JSON_DATA_STRING` contains either the requested data or an error message for failed requests.

## License

This project is licensed under the MIT License.
