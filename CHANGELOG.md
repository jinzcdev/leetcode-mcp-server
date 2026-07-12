# Changelog

## [1.4.0](https://github.com/jinzcdev/leetcode-mcp-server/compare/v1.3.0...v1.4.0) (2026-07-12)

### Features

- **tools**: enhance tool descriptions for clarity and consistency
- upgrade mcp sdk to 1.29.0

## [1.3.0](https://github.com/jinzcdev/leetcode-mcp-server/compare/v1.2.0...v1.3.0) (2026-03-18)

### Features

- **submissions:** add run_code and submit_solution tools ([c777de3](https://github.com/jinzcdev/leetcode-mcp-server/commit/c777de388215b63422e702e56594b53faae8cbaf))

## [1.2.0](https://github.com/jinzcdev/leetcode-mcp-server/compare/v1.1.0...v1.2.0) (2025-05-31)

### Bug Fixes

- **lint:** update ESLint ignores and refine Prettier format command ([a02eb37](https://github.com/jinzcdev/leetcode-mcp-server/commit/a02eb37a0e3af504db76d1b6babfef6d71a68856))
- **logging:** improve error logging format in LeetCode services ([a43ac8e](https://github.com/jinzcdev/leetcode-mcp-server/commit/a43ac8e4b2ed695c8cf78bfcba7489a63a7a6001))

### Features

- **note-tools:** rename summary parameter to title for clarity ([513a666](https://github.com/jinzcdev/leetcode-mcp-server/commit/513a666d09dce50f34f27383d0d857f752fc3bb8))
- **tests:** add fetchDailyChallenge test ([5c5ee6f](https://github.com/jinzcdev/leetcode-mcp-server/commit/5c5ee6f90124d61203b1bbcb8b71df71df6fdcf6))

## [1.1.0](https://github.com/jinzcdev/leetcode-mcp-server/compare/v1.0.1...v1.1.0) (2025-04-25)

### Features

- simplify user profile response and question list structure ([285dfd8](https://github.com/jinzcdev/leetcode-mcp-server/commit/285dfd839cd5ef1acca367a837763aa97287faa2))
- **userStatus:** simplify user status response in LeetCode services ([cfb8df7](https://github.com/jinzcdev/leetcode-mcp-server/commit/cfb8df7257a2bee199dacd122e816140563ee4e8))

## [1.0.1](https://github.com/jinzcdev/leetcode-mcp-server/compare/v0.1.1...v1.0.1) (2025-04-20)

### Bug Fixes

- update default `limit` for notes retrieval to 10 ([7af01bd](https://github.com/jinzcdev/leetcode-mcp-server/commit/7af01bd541fccbde911c6192860c56080d987160))
- update lint-staged configuration to include JSX and additional file types ([48184e2](https://github.com/jinzcdev/leetcode-mcp-server/commit/48184e2fd742203ed056bdc797fe8342ce1e5ce9))
- update pre-commit hook and format smithery.yaml for better readability ([6570ded](https://github.com/jinzcdev/leetcode-mcp-server/commit/6570dedb8c48bad6a01d9d0f6787d32dc0aba079))

### Features

- add create and update note functionalities for LeetCode CN ([21a0bd7](https://github.com/jinzcdev/leetcode-mcp-server/commit/21a0bd740e05195a0d3d9ce53e350dc7c7a4ce33))
- add fetchProblemSimplified method to LeetCode services and corresponding tests ([9ea4dc4](https://github.com/jinzcdev/leetcode-mcp-server/commit/9ea4dc4531dca680c2f5be021d3617475a424425))
- add user notes feature for LeetCode CN ([d906371](https://github.com/jinzcdev/leetcode-mcp-server/commit/d906371f7fccb7f3f673f090b4310f7d27aae904))
- integrate pino for structured logging and add logger utility ([2e1fc05](https://github.com/jinzcdev/leetcode-mcp-server/commit/2e1fc057cdf572226718d8cdea1995f5d3baad0c))
- update Dockerfile to use environment variables for LeetCode site and session ([cf2542a](https://github.com/jinzcdev/leetcode-mcp-server/commit/cf2542a3158ef09fc8a1881b4e3ef66407760cb3))
- update logger configuration ([5a9fae5](https://github.com/jinzcdev/leetcode-mcp-server/commit/5a9fae5e078255f4c42032cb103400d37acd2042))
- update version to v1.0.1 ([7b4b0f5](https://github.com/jinzcdev/leetcode-mcp-server/commit/7b4b0f5772f2f8766f229d37f6b41461f376bd98))

## [0.1.1](https://github.com/jinzcdev/leetcode-mcp-server/compare/89ca0778fa1d811696d4c22b781d5b5857cb1d71...v0.1.1) (2025-04-14)

### Bug Fixes

- Rename registerCommonTools to registerCommon and remove unused tool registration methods ([a365142](https://github.com/jinzcdev/leetcode-mcp-server/commit/a3651420ef64b0f10072dc71bcba487677f804d5))
- Rename tool identifier from leetcode_problem_detail to leetcode_problem for consistency ([43c72a9](https://github.com/jinzcdev/leetcode-mcp-server/commit/43c72a90cf83c441760181495ee11a32e70d41d2))
- update package names and commands in README, package.json, and package-lock.json ([e62c22a](https://github.com/jinzcdev/leetcode-mcp-server/commit/e62c22a0ad5d6fbfe7800bb5fc8f5fcc41683e35))
- update README installation commands and correct test assertions for solution articles ([cf39d50](https://github.com/jinzcdev/leetcode-mcp-server/commit/cf39d50ceba87a7d7f3ea1ad0a32c2e88309677b))
- update workflow trigger to use release event and bump version to 0.1.1 ([9a9a465](https://github.com/jinzcdev/leetcode-mcp-server/commit/9a9a465d8d689361f14834715356075a6a951f8b))

### Features

- Add default values for pagination parameters in user progress tool ([149daf5](https://github.com/jinzcdev/leetcode-mcp-server/commit/149daf5fb168d9ca39224a2e829ddf747903c33b))
- Add GraphQL API for searching LeetCode problems with searchKeywords ([11f1ba9](https://github.com/jinzcdev/leetcode-mcp-server/commit/11f1ba9ff8cfaebb90fb1f56cea61d7059c53a3f))
- Add launch configuration for MCP Server in VSCode ([58970a0](https://github.com/jinzcdev/leetcode-mcp-server/commit/58970a0d9ec304b73bbe7a4cb041fe414af02cd5))
- Add pre-commit hook and update ESLint configuration ([e7a70ad](https://github.com/jinzcdev/leetcode-mcp-server/commit/e7a70ad220e58a9a0efc2d231a505ef4c21c8bf9))
- add prepare release workflow for version bump and changelog generation ([bb7a60b](https://github.com/jinzcdev/leetcode-mcp-server/commit/bb7a60b57b917ef1c230dd089682355c3212879d))
- Add solution article fetching functionality for LeetCode CN and Global ([f2496b6](https://github.com/jinzcdev/leetcode-mcp-server/commit/f2496b621794c4a2398514c3a981fc602ef4292f))
- command-line arguments take precedence over env variables ([cfdf4ee](https://github.com/jinzcdev/leetcode-mcp-server/commit/cfdf4ee563fe900a66f75381314c67f954362923))
- Implement LeetCode API service structure ([89ca077](https://github.com/jinzcdev/leetcode-mcp-server/commit/89ca0778fa1d811696d4c22b781d5b5857cb1d71))
- Implement resource and tool registries for LeetCode solutions and problems ([e0ae9b6](https://github.com/jinzcdev/leetcode-mcp-server/commit/e0ae9b653bd1e5866fd28e4242bcc026e130c50b))
- update npm-publish workflow and add pull request creation step; enhance README and package.json metadata ([92ad02f](https://github.com/jinzcdev/leetcode-mcp-server/commit/92ad02f31af57f0080d1eca7a0f1fcb4667be2fe))
