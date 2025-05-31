# LeetCode MCP 服务器

[![NPM Version](https://img.shields.io/npm/v/@jinzcdev/leetcode-mcp-server.svg)](https://www.npmjs.com/package/@jinzcdev/leetcode-mcp-server)
[![GitHub License](https://img.shields.io/github/license/jinzcdev/leetcode-mcp-server.svg)](https://www.npmjs.com/package/@jinzcdev/leetcode-mcp-server)
[![smithery badge](https://smithery.ai/badge/@jinzcdev/leetcode-mcp-server)](https://smithery.ai/server/@jinzcdev/leetcode-mcp-server)
[![English Doc](https://img.shields.io/badge/English-Click-blue)](README.md)
[![Stars](https://img.shields.io/github/stars/jinzcdev/leetcode-mcp-server)](https://github.com/jinzcdev/leetcode-mcp-server)

LeetCode MCP Server 是一个基于 [模型上下文协议 (MCP)](https://modelcontextprotocol.io/introduction) 的服务，提供与 LeetCode API 的无缝集成，实现与 LeetCode 编程题目、竞赛、题解和用户数据的高级自动化和智能交互。

<a href="https://glama.ai/mcp/servers/@jinzcdev/leetcode-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jinzcdev/leetcode-mcp-server/badge" alt="LeetCode Server MCP server" />
</a>

## 特性

- 🌐 **多站点支持**：同时支持 leetcode.com（全球）和 leetcode.cn（中国）站点
- 📊 ​**题目数据获取**：获取详细的题目描述、约束条件、示例、官方题解和用户提交的解答
- 👤 **用户数据访问**：检索用户资料、提交历史和竞赛表现
- 🔒 **私有数据访问**：创建和查询用户笔记，跟踪题目解答进度，分析提交详情（AC/WA 报告）
- 🔍 **高级搜索功能**：按标签、难度级别、分类和关键字筛选题目
- 📅 **每日一题获取**：轻松访问每日一题

## 前提条件

1. Node.js (v20.x 或更高版本)
2. （可选）LeetCode 会话 cookie，用于授权访问 API

## 安装

### 通过 Smithery 安装

使用 [Smithery](https://smithery.ai/server/@jinzcdev/leetcode-mcp-server) 为 Claude Desktop 自动安装 leetcode-mcp-server：

```bash
npx -y @smithery/cli install @jinzcdev/leetcode-mcp-server --client claude
```

### 手动安装

```bash
# 从 npm 安装
npm install @jinzcdev/leetcode-mcp-server -g

# 使用中国站点配置运行
npx -y @jinzcdev/leetcode-mcp-server --site cn

# 使用认证运行（访问私有数据）
npx -y @jinzcdev/leetcode-mcp-server --site cn --session <您的 LEETCODE 会话 COOKIE>
```

或者，您可以克隆仓库并在本地运行：

```bash
# 克隆仓库
git clone https://github.com/jinzcdev/leetcode-mcp-server.git

# 导航到项目目录
cd leetcode-mcp-server

# 构建项目
npm install && npm run build

# 运行服务器
node build/index.js --site cn
```

## 使用方法

### Visual Studio Code 集成

在您的用户设置 (JSON) 文件中添加以下配置。通过按 `Ctrl/Cmd + Shift + P` 并搜索 `Preferences: Open User Settings (JSON)` 来访问此文件。

#### 方式一：使用环境变量

```json
{
  "mcp": {
    "servers": {
      "leetcode": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@jinzcdev/leetcode-mcp-server"],
        "env": {
          "LEETCODE_SITE": "cn",
          "LEETCODE_SESSION": "<您的 LEETCODE 会话 COOKIE>"
        }
      }
    }
  }
}
```

#### 方式二：使用命令行参数

```json
{
  "mcp": {
    "servers": {
      "leetcode": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "-y",
          "@jinzcdev/leetcode-mcp-server",
          "--site",
          "cn",
          "--session",
          "<您的 LEETCODE 会话 COOKIE>"
        ]
      }
    }
  }
}
```

对于 LeetCode 全球站点，请将 `--site` 参数修改为 `global`。

> [!TIP]
>
> 服务支持以下可选的环境变量：
>
> - `LEETCODE_SITE`：LeetCode API 端点（'global' 或 'cn'，默认为 'global'）
> - `LEETCODE_SESSION`：用于授权 API 访问的 LeetCode 会话 cookie（默认为空）
>
> **优先级说明**：
>
> 当同时指定命令行参数和环境变量时，命令行参数优先。例如：
>
> - 如果设置了 `LEETCODE_SITE=cn` 但您运行 `leetcode-mcp-server --site global`，服务器将使用 `global`。
> - 如果存在 `LEETCODE_SESSION` 但您提供了 `--session "new_cookie"`，将使用命令行中的参数值。

## 可用工具

### 题目

| 工具                    | 全球站 | 中国站 | 需要认证 | 描述                               |
| ----------------------- | :----: | :----: | :------: | ---------------------------------- |
| **get_daily_challenge** |   ✅   |   ✅   |    ❌    | 获取今天的 LeetCode 每日一题       |
| **get_problem**         |   ✅   |   ✅   |    ❌    | 获取特定 LeetCode 题目详细信息     |
| **search_problems**     |   ✅   |   ✅   |    ❌    | 使用多种过滤条件搜索 LeetCode 题目 |

### 用户

| 工具                              | 全球站 | 中国站 | 需要认证 | 描述                         |
| --------------------------------- | :----: | :----: | :------: | ---------------------------- |
| **get_user_profile**              |   ✅   |   ✅   |    ❌    | 获取 LeetCode 用户的简介信息 |
| **get_user_contest_ranking**      |   ✅   |   ✅   |    ❌    | 获取用户的竞赛排名统计       |
| **get_recent_ac_submissions**     |   ✅   |   ✅   |    ❌    | 获取用户的近期已接受提交     |
| **get_recent_submissions**        |   ✅   |   ❌   |    ❌    | 获取用户的近期提交历史       |
| **get_user_status**               |   ✅   |   ✅   |    ✅    | 获取用户的当前状态           |
| **get_problem_submission_report** |   ✅   |   ✅   |    ✅    | 提供详细的提交分析           |
| **get_problem_progress**          |   ✅   |   ✅   |    ✅    | 获取用户的答题进度           |
| **get_all_submissions**           |   ✅   |   ✅   |    ✅    | 获取用户提交的分页列表       |

### 笔记

| 工具             | 全球站 | 中国站 | 需要认证 | 描述                           |
| ---------------- | :----: | :----: | :------: | ------------------------------ |
| **search_notes** |   ❌   |   ✅   |    ✅    | 使用过滤选项搜索用户笔记       |
| **get_note**     |   ❌   |   ✅   |    ✅    | 通过题目 ID 获取特定题目的笔记 |
| **create_note**  |   ❌   |   ✅   |    ✅    | 为特定题目创建新笔记           |
| **update_note**  |   ❌   |   ✅   |    ✅    | 使用新内容更新现有笔记         |

### 题解

| 工具                       | 全球站 | 中国站 | 需要认证 | 描述                           |
| -------------------------- | :----: | :----: | :------: | ------------------------------ |
| **list_problem_solutions** |   ✅   |   ✅   |    ❌    | 获取特定题目的社区题解文章列表 |
| **get_problem_solution**   |   ✅   |   ✅   |    ❌    | 获取特定题解文章的完整内容     |

## 工具参数

### 题目

- **get_daily_challenge** - 获取今天的 LeetCode 每日一题及完整详情

  - 无需参数

- **get_problem** - 获取特定 LeetCode 题目的详情

  - `titleSlug`：题目的 URL 标识符（字符串，必需）

- **search_problems** - 基于多种过滤条件搜索 LeetCode 题目
  - `category`：题目类别过滤器（字符串，可选，默认："all-code-essentials"）
  - `tags`：按主题标签过滤题目的列表（字符串数组，可选）
  - `difficulty`：题目难度级别过滤器（枚举："EASY"、"MEDIUM"、"HARD"，可选）
  - `searchKeywords`：在题目标题和描述中搜索的关键词（字符串，可选）
  - `limit`：返回的最大题目数量（数字，可选，默认：10）
  - `offset`：要跳过的题目数量（数字，可选）

### 用户

- **get_user_profile** - 获取 LeetCode 用户的资料信息

  - `username`：LeetCode 用户名（字符串，必需）

- **get_user_contest_ranking** - 获取用户的竞赛排名信息

  - `username`：LeetCode 用户名（字符串，必需）
  - `attended`：是否只包括用户参加过的竞赛（布尔值，可选，默认：true）

- **get_recent_submissions** - 获取用户在 LeetCode 全球站的近期提交

  - `username`：LeetCode 用户名（字符串，必需）
  - `limit`：返回的最大提交数量（数字，可选，默认：10）

- **get_recent_ac_submissions** - 获取用户的近期已接受提交

  - `username`：LeetCode 用户名（字符串，必需）
  - `limit`：返回的最大提交数量（数字，可选，默认：10）

- **get_user_status** - 获取当前已认证用户的状态

  - 无需参数

- **get_problem_submission_report** - 获取特定提交的详细信息

  - `id`：提交的数字 ID（数字，必需）

- **get_problem_progress** - 获取已认证用户的题目解决状态

  - `offset`：要跳过的题目数量（数字，可选，默认：0）
  - `limit`：返回的最大题目数量（数字，可选，默认：100）
  - `questionStatus`：按题目状态过滤（枚举："ATTEMPTED"、"SOLVED"，可选）
  - `difficulty`：按难度级别过滤（字符串数组，可选）

- **get_all_submissions** - 获取用户提交的分页列表
  - `limit`：返回的最大提交数量（数字，默认：20）
  - `offset`：要跳过的提交数量（数字，默认：0）
  - `questionSlug`：可选的题目标识符（字符串，可选）
  - `lang`：编程语言过滤器（字符串，可选，仅中国站）
  - `status`：提交状态过滤器（枚举："AC"、"WA"，可选，仅中国站）
  - `lastKey`：用于检索下一页的分页令牌（字符串，可选，仅中国站）

### 笔记

- **search_notes** - 搜索 LeetCode 中国站上的用户笔记

  - `keyword`：过滤笔记的搜索词（字符串，可选）
  - `limit`：返回的最大笔记数量（数字，可选，默认：10）
  - `skip`：要跳过的笔记数量（数字，可选，默认：0）
  - `orderBy`：返回笔记的排序顺序（枚举："ASCENDING"、"DESCENDING"，可选，默认："DESCENDING"）

- **get_note** - 获取特定 LeetCode 题目的用户笔记

  - `questionId`：LeetCode 题目的题目 ID（字符串，必需）
  - `limit`：返回的最大笔记数量（数字，可选，默认：10）
  - `skip`：要跳过的笔记数量（数字，可选，默认：0）

- **create_note** - 为特定 LeetCode 题目创建新笔记

  - `questionId`：LeetCode 题目的题目 ID（字符串，必需）
  - `content`：笔记内容，支持 markdown 格式（字符串，必需）
  - `summary`：可选的笔记简短摘要或标题（字符串，可选）

- **update_note** - 使用新内容或摘要更新现有笔记
  - `noteId`：要更新的笔记 ID（字符串，必需）
  - `content`：笔记的新内容，支持 markdown 格式（字符串，必需）
  - `summary`：可选的新简短摘要或标题（字符串，可选）

### 题解

- **list_problem_solutions** - 获取特定题目的社区题解文章列表

  - `questionSlug`：题目的 URL 标识符（字符串，必需）
  - `limit`：返回的最大题解文章数量（数字，可选，默认：10）
  - `skip`：要跳过的题解文章数量（数字，可选）
  - `userInput`：过滤题解文章的搜索词（字符串，可选）
  - `tagSlugs`：用于过滤题解文章的标签标识符数组（字符串数组，可选，默认：[])
  - `orderBy`：题解文章的排序条件
    - 全球站：枚举："HOT"、"MOST_RECENT"、"MOST_VOTES"，可选，默认："HOT"
    - 中国站：枚举："DEFAULT"、"MOST_UPVOTE"、"HOT"、"NEWEST_TO_OLDEST"、"OLDEST_TO_NEWEST"，可选，默认："DEFAULT"

- **get_problem_solution** - 获取特定题解文章的完整内容
  - `topicId`：题解文章的唯一主题 ID（字符串，必需，仅全球站）
  - `slug`：题解文章的唯一标识符（字符串，必需，仅中国站）

## 可用资源

| 资源名称               | 全球站 | 中国站 | 需要认证 | 描述                         |
| ---------------------- | :----: | :----: | :------: | ---------------------------- |
| **problem-categories** |   ✅   |   ✅   |    ❌    | 所有题目分类类别的列表       |
| **problem-tags**       |   ✅   |   ✅   |    ❌    | 算法和数据结构标签的详细集合 |
| **problem-langs**      |   ✅   |   ✅   |    ❌    | 所有支持的编程语言的完整列表 |
| **problem-detail**     |   ✅   |   ✅   |    ❌    | 提供特定题目的详情           |
| **problem-solution**   |   ✅   |   ✅   |    ❌    | 提供特定题解文章的完整内容   |

## 资源 URI

- **problem-categories** - 所有题目分类类别的列表

  - URI: `categories://problems/all`

- **problem-tags** - 算法和数据结构标签的详细集合

  - URI: `tags://problems/all`

- **problem-langs** - LeetCode 支持的所有编程语言的完整列表

  - URI: `langs://problems/all`

- **problem-detail** - 提供特定 LeetCode 题目的详情

  - URI: `problem://{titleSlug}`
  - 参数:
    - `titleSlug`: LeetCode URL 中显示的题目标识符

- **problem-solution** - 提供特定题解文章的完整内容
  - 全球站 URI: `solution://{topicId}`
    - 参数:
      - `topicId`: 题解文章的唯一主题 ID
  - 中国站 URI: `solution://{slug}`
    - 参数:
      - `slug`: 题解文章的唯一标识符

## 认证

访问用户特定数据需要 LeetCode 会话认证:

1. 登录 LeetCode（[全球站](https://leetcode.com) 或 [中国站](https://leetcode.cn)）
2. 从浏览器开发者工具中提取 `LEETCODE_SESSION` cookie
3. 使用 `--session` 标志或 `LEETCODE_SESSION` 环境变量配置服务器

## 响应格式

所有工具都返回具有以下结构的 JSON 格式响应:

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

`JSON_DATA_STRING` 包含请求的数据或失败请求的错误消息。

## 许可证

本项目采用 MIT 许可证。
