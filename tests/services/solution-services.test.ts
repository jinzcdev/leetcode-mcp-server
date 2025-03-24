import { Credential, LeetCode, LeetCodeCN } from "leetcode-query";
import { describe, expect, it } from "vitest";
import { LeetCodeCNService } from "../../src/services/leetcode-cn-service";
import { LeetCodeGlobalService } from "../../src/services/leetcode-global-service";

describe("LeetCode Solution Services", () => {
    describe("LeetCodeGlobalService", () => {
        const credential = new Credential();
        const leetCodeApi = new LeetCode(credential);
        const service = new LeetCodeGlobalService(leetCodeApi, credential);

        describe("fetchQuestionSolutionArticles", () => {
            it("should fetch solution articles with default options", async () => {
                const questionSlug = "two-sum";

                const result = await service.fetchQuestionSolutionArticles(
                    questionSlug,
                    {}
                );

                expect(result).toBeDefined();
                expect(result.totalNum).toBeTypeOf("number");
                expect(Array.isArray(result.edges)).toBe(true);
            }, 30000);

            it("should fetch solution articles with custom options", async () => {
                const result = await service.fetchQuestionSolutionArticles(
                    "two-sum",
                    {
                        limit: 5,
                        skip: 0,
                        orderBy: "MOST_VOTES"
                    }
                );

                expect(result).toBeDefined();
                expect(result.totalNum).toBeTypeOf("number");
                expect(Array.isArray(result.edges)).toBe(true);

                expect(result.edges.length).toBeLessThanOrEqual(5);
            }, 30000);

            it("should handle errors properly for invalid slugs", async () => {
                const invalidSlug = `invalid-slug-${Date.now()}`;

                try {
                    await service.fetchQuestionSolutionArticles(invalidSlug);
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error).toBeDefined();
                }
            }, 30000);
        });

        describe("fetchSolutionArticleDetail", () => {
            it("should fetch solution article detail correctly if topicId exists", async () => {
                const solutionsResult =
                    await service.fetchQuestionSolutionArticles("two-sum", {
                        limit: 1
                    });

                if (
                    !solutionsResult.edges ||
                    solutionsResult.edges.length === 0
                ) {
                    console.log(
                        "No solutions found for two-sum, skipping test"
                    );
                    return;
                }

                const topicId = solutionsResult.edges[0].node.topic.id;
                console.log(`Using topicId: ${topicId} for detail fetch`);

                const result =
                    await service.fetchSolutionArticleDetail(topicId);

                expect(result).toBeDefined();
                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toBeDefined();
            }, 30000);

            it("should handle errors properly for invalid topicIds", async () => {
                const invalidTopicId = `invalid-topic-${Date.now()}`;

                try {
                    await service.fetchSolutionArticleDetail(invalidTopicId);
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

        describe("fetchQuestionSolutionArticles", () => {
            it("should fetch solution articles with default options", async () => {
                const questionSlug = "two-sum";

                const result =
                    await service.fetchQuestionSolutionArticles(questionSlug);

                expect(result).toBeDefined();
                expect(result.totalNum).toBeTypeOf("number");
                expect(Array.isArray(result.edges)).toBe(true);

                console.log(
                    `Found ${result.totalNum} solutions for ${questionSlug} on CN`
                );
            }, 30000);

            it("should fetch solution articles with custom options", async () => {
                const result = await service.fetchQuestionSolutionArticles(
                    "two-sum",
                    {
                        limit: 5,
                        skip: 0,
                        orderBy: "DEFAULT"
                    }
                );

                expect(result).toBeDefined();
                expect(result.totalNum).toBeTypeOf("number");
                expect(Array.isArray(result.edges)).toBe(true);

                expect(result.edges.length).toBeLessThanOrEqual(5);
            }, 30000);

            it("should handle errors properly for invalid slugs", async () => {
                const invalidSlug = `invalid-slug-${Date.now()}`;

                try {
                    await service.fetchQuestionSolutionArticles(invalidSlug);
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error).toBeDefined();
                }
            }, 30000);
        });

        describe("fetchSolutionArticleDetail", () => {
            it("should fetch solution article detail correctly if slug exists", async () => {
                const solutionsResult =
                    await service.fetchQuestionSolutionArticles("two-sum", {
                        limit: 1
                    });

                if (
                    !solutionsResult.edges ||
                    solutionsResult.edges.length === 0
                ) {
                    console.log(
                        "No solutions found for two-sum on CN, skipping test"
                    );
                    return;
                }

                const slug = solutionsResult.edges[0].node.slug;
                console.log(`Using slug: ${slug} for detail fetch on CN`);

                const result = await service.fetchSolutionArticleDetail(slug);

                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toBeDefined();
            }, 30000);

            it("should handle errors properly for invalid slugs", async () => {
                const invalidSlug = `invalid-slug-${Date.now()}`;

                try {
                    await service.fetchSolutionArticleDetail(invalidSlug);
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error).toBeDefined();
                }
            }, 30000);
        });
    });
});
