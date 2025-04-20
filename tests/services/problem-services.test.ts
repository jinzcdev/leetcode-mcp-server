import { Credential, LeetCode, LeetCodeCN } from "leetcode-query";
import { describe, expect, it } from "vitest";
import { LeetCodeCNService } from "../../src/leetcode/leetcode-cn-service.js";
import { LeetCodeGlobalService } from "../../src/leetcode/leetcode-global-service.js";

describe("LeetCode Problem Services", () => {
    describe("LeetCodeGlobalService", () => {
        const credential = new Credential();
        const leetCodeApi = new LeetCode(credential);
        const service = new LeetCodeGlobalService(leetCodeApi, credential);

        describe("fetchProblemSimplified", () => {
            it("should return simplified problem data", async () => {
                const titleSlug = "two-sum";
                const result = await service.fetchProblemSimplified(titleSlug);

                expect(result).toBeDefined();
                expect(result.titleSlug).toBe(titleSlug);
                expect(result.title).toBe("Two Sum");
                expect(result.questionId).toBeDefined();
                expect(result.questionFrontendId).toBeDefined();
                expect(result.content).toBeDefined();
                expect(result.difficulty).toBeDefined();
                expect(Array.isArray(result.topicTags)).toBe(true);
                expect(Array.isArray(result.codeSnippets)).toBe(true);
                expect(result.hints).toBeDefined();

                if (result.similarQuestions) {
                    expect(Array.isArray(result.similarQuestions)).toBe(true);
                }
            }, 30000);

            it("should handle invalid problems correctly", async () => {
                const invalidSlug = `invalid-problem-${Date.now()}`;

                try {
                    await service.fetchProblemSimplified(invalidSlug);
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error).toBeDefined();
                }
            }, 30000);
        });
    });

    describe("LeetCodeCNService", () => {
        const credential = new Credential();
        const leetCodeApi = new LeetCodeCN(credential);
        const service = new LeetCodeCNService(leetCodeApi, credential);

        describe("fetchProblemSimplified", () => {
            it("should return simplified problem data", async () => {
                const titleSlug = "two-sum";
                const result = await service.fetchProblemSimplified(titleSlug);

                expect(result).toBeDefined();
                expect(result.titleSlug).toBe(titleSlug);
                expect(result.questionId).toBeDefined();
                expect(result.questionFrontendId).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toBeDefined();
                expect(result.difficulty).toBeDefined();
                expect(Array.isArray(result.topicTags)).toBe(true);
                expect(Array.isArray(result.codeSnippets)).toBe(true);
                expect(result.hints).toBeDefined();

                if (result.similarQuestions) {
                    expect(Array.isArray(result.similarQuestions)).toBe(true);
                }

                console.log(
                    `Successfully fetched simplified data for ${titleSlug}`
                );
            }, 30000);

            it("should handle invalid problems correctly", async () => {
                const invalidSlug = `invalid-problem-${Date.now()}`;

                try {
                    await service.fetchProblemSimplified(invalidSlug);
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error).toBeDefined();
                }
            }, 30000);
        });
    });
});
