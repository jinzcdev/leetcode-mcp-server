# LeetCode MCP Server

![stars](https://img.shields.io/github/stars/jinzcdev/leetcode-mcp-server)
![GitHub license](https://img.shields.io/github/license/jinzcdev/leetcode-mcp-server.svg)

The LeetCode MCP Server is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that provides seamless integration with LeetCode APIs, enabling advanced automation and intelligent interaction with LeetCode's programming problems, contests, solutions, and user data.

## Features

- **Multi-site Support**: Supports both leetcode.com and leetcode.cn platforms
- **Problem Data Retrieval**: Obtain detailed problem descriptions, constraints, examples, and solution approaches
- **User Data Access**: Retrieve user profiles, submission history, and contest performance
- **Advanced Search Capabilities**: Filter problems by tags, difficulty levels, and categories
- **Daily Challenge Tracking**: Easily access daily challenge problems

## Prerequisites

1. Node.js runtime environment
2. (Optional) LeetCode session cookie for authenticated API access

## Installation

```bash
# Install from npm
npm install mcp-server-leetcode -g

# Run the server with default settings (Global LeetCode site)
mcp-server-leetcode

# Run with China site configuration
mcp-server-leetcode --site cn

# Run with authentication (for accessing private data)
mcp-server-leetcode --site global --session <YOUR_LEETCODE_SESSION_COOKIE>
```

## Usage

### Visual Studio Code Integration

Add the following JSON configuration to your User Settings (JSON) file Code. Access this by pressing `Ctrl + Shift + P` and searching for `Preferences: Open User Settings (JSON)`.

```json
{
  "mcp": {
    "servers": {
      "leetcode": {
        "type": "stdio",
        "command": "mcp-server-leetcode",
        "args": [
          "--site",
          "global",
          "--session",
          "<YOUR_LEETCODE_SESSION_COOKIE>"
        ]
      }
    }
  }
}
```

For LeetCode China site, modify the `--site` parameter to `cn`.

## Environment Variables

The server supports the following environment variables:

- `LEETCODE_SITE`: LeetCode API endpoint ('global' or 'cn')
- `LEETCODE_SESSION`: LeetCode session cookie for authenticated API access

**Priority Note**:  
Command-line arguments take precedence over environment variables when both are specified. For example:

- If `LEETCODE_SITE=cn` is set but you run `mcp-server-leetcode --site global`, the server will use `global`.
- If `LEETCODE_SESSION` exists but you provide `--session "new_cookie"`, the command-line session value will be used.

## Tools

The server provides a comprehensive suite of tools categorized by functionality and platform compatibility.

### Problem Tools

Available on both Global and China sites, with optional authentication.

| Tool Name                    | Description                                                       | Parameters                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **leetcode_daily_challenge** | Retrieves today's LeetCode Daily Challenge with complete metadata | None                                                                                                                                                                                                                                                                                                   |
| **leetcode_problem**         | Retrieves comprehensive details for a specified LeetCode problem  | `titleSlug` (string, required): Problem URL identifier (e.g., 'two-sum')                                                                                                                                                                                                                               |
| **leetcode_search_problems** | Executes filtered searches across LeetCode problems               | `category` (string, optional): Problem classification<br>`tags` (string[], optional): Topic tags filter<br>`difficulty` (string, optional): Problem complexity level ('EASY', 'MEDIUM', 'HARD')<br>`limit` (number, optional): Maximum results count<br>`offset` (number, optional): Pagination offset |

### User Tools

Provides user-specific data across both platforms.

| Tool Name                         | Description                                                | Parameters                                                                                                            |
| --------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **leetcode_user_profile**         | Retrieves complete profile information for a LeetCode user | `username` (string, required): LeetCode username                                                                      |
| **leetcode_user_contest_ranking** | Obtains contest ranking statistics for a user              | `username` (string, required): LeetCode username<br>`attended` (boolean, optional): Filter for attended contests only |

### Global Site-Specific User Tools

Exclusive to leetcode.com platform.

| Tool Name                          | Description                                             | Parameters                                                                                    |
| ---------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **leetcode_recent_submissions**    | Retrieves a user's recent submission history (Global)   | `username` (string, required): LeetCode username<br>`limit` (number, optional): Results limit |
| **leetcode_recent_ac_submissions** | Retrieves a user's recent accepted submissions (Global) | `username` (string, required): LeetCode username<br>`limit` (number, optional): Results limit |

### China Site-Specific User Tools

Exclusive to leetcode.cn platform.

| Tool Name                               | Description                                   | Parameters                                                                                          |
| --------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **leetcode_user_recent_ac_submissions** | Retrieves recent accepted submissions (China) | `username` (string, required): LeetCode China username<br>`limit` (number, optional): Results limit |

### Authenticated Common Tools

Requires session authentication, available on both platforms.

| Tool Name                              | Description                                   | Parameters                                                                                                                                                                                                                     |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **leetcode_user_status**               | Retrieves authenticated user's current status | None                                                                                                                                                                                                                           |
| **leetcode_problem_submission_detail** | Provides detailed submission analysis         | `id` (number, required): Submission ID                                                                                                                                                                                         |
| **leetcode_user_progress_questions**   | Tracks user's problem-solving progress        | `offset` (number, required): Pagination offset<br>`limit` (number, required): Results limit<br>`questionStatus` (enum, optional): 'ATTEMPTED' or 'SOLVED' filter<br>`difficulty` (string[], optional): Complexity level filter |

### Global Site-Specific Authenticated Tools

Authenticated tools exclusive to leetcode.com.

| Name                              | Description                                     | Parameters                                                                                                                                                  |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **leetcode_user_all_submissions** | Retrieves paginated submission history (Global) | `limit` (number, required): Results limit<br>`offset` (number, required): Pagination offset<br>`questionSlug` (string, optional): Problem identifier filter |

### China Site-Specific Authenticated Tools

Authenticated tools exclusive to leetcode.cn.

| Tool Name                         | Description                                        | Parameters                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **leetcode_user_all_submissions** | Retrieves comprehensive submission history (China) | `limit` (number, required): Results limit<br>`offset` (number, required): Pagination offset<br>`questionSlug` (string, optional): Problem identifier<br>`lang` (string, optional): Programming language filter<br>`status` (string, optional): Submission status filter<br>`lastKey` (string, optional): Pagination token |

## Resources

The server provides reference resources for platform metadata access via URI endpoints.

| Resource Name          | Description                                    | URI                                                                           |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| **problem-categories** | Complete problem classification categories     | `leetcode://problems/categories/all`                                          |
| **problem-tags**       | Algorithmic and data structure tags collection | `leetcode://problems/tags/all`                                                |
| **problem-langs**      | Supported programming languages list           | `leetcode://problems/langs/all`                                               |
| **solution-article**   | A LeetCode solution article                    | global: `leetcode://solutions/{topicId}`<br>cn: `leetcode://solutions/{slug}` |

## Authentication

Advanced features require LeetCode session authentication:

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
