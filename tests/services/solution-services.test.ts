import { Credential, LeetCode, LeetCodeCN } from "leetcode-query";
import { describe, expect, it } from "vitest";
import { LeetCodeCNService } from "../../src/leetcode/leetcode-cn-service.js";
import { LeetCodeGlobalService } from "../../src/leetcode/leetcode-global-service.js";
import logger from "../../src/utils/logger.js";

describe("LeetCode Solution Services", () => {
    describe("LeetCodeGlobalService", () => {
        const credential = new Credential();
        const leetCodeApi = new LeetCode(credential);
        const service = new LeetCodeGlobalService(leetCodeApi, credential);

        describe("fetchQuestionSolutionArticles", () => {
            it("should fetch solutions with default options", async () => {
                const questionSlug = "two-sum";

                const result = await service.fetchQuestionSolutionArticles(
                    questionSlug,
                    {}
                );

                expect(result).toBeDefined();
                expect(result.totalNum).toBeTypeOf("number");
                expect(Array.isArray(result.articles)).toBe(true);
            }, 30000);

            it("should fetch solutions with custom options", async () => {
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
                expect(Array.isArray(result.articles)).toBe(true);

                expect(result.articles.length).toBeLessThanOrEqual(5);
            }, 30000);

            it("should handle errors properly for invalid slugs", async () => {
                const invalidSlug = `invalid-slug-${Date.now()}`;

                const data =
                    await service.fetchQuestionSolutionArticles(invalidSlug);

                expect(data).toBeDefined();
                expect(data.totalNum).toBe(0);
                expect(data.articles).toBeDefined();
                expect(data.articles.length).toBe(0);
            }, 30000);
        });

        describe("fetchSolutionArticleDetail", () => {
            it("should fetch solution detail correctly if topicId exists", async () => {
                const solutionsResult =
                    await service.fetchQuestionSolutionArticles("two-sum", {
                        limit: 1
                    });

                if (
                    !solutionsResult.edges ||
                    solutionsResult.edges.length === 0
                ) {
                    logger.info(
                        "No solutions found for two-sum, skipping test"
                    );
                    return;
                }

                const topicId = solutionsResult.edges[0].node.topic.id;
                logger.info(`Using topicId: ${topicId} for detail fetch`);

                const result =
                    await service.fetchSolutionArticleDetail(topicId);

                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toBeDefined();
            }, 30000);

            it("should handle errors properly for invalid topicIds", async () => {
                const invalidTopicId = `invalid-topic-${Date.now()}`;
                await expect(
                    service.fetchSolutionArticleDetail(invalidTopicId)
                ).resolves.toBeNull();
            }, 30000);
        });
    });

    describe("LeetCodeCNService", () => {
        const credential = new Credential();
        const leetCodeApi = new LeetCodeCN(credential);
        const service = new LeetCodeCNService(leetCodeApi, credential);

        describe("fetchQuestionSolutionArticles", () => {
            it("should fetch solutions with default options", async () => {
                const questionSlug = "two-sum";

                const result =
                    await service.fetchQuestionSolutionArticles(questionSlug);

                expect(result).toBeDefined();
                expect(result.totalNum).toBeTypeOf("number");
                expect(Array.isArray(result.articles)).toBe(true);

                logger.info(
                    `Found ${result.totalNum} solutions for ${questionSlug} on CN`
                );
            }, 30000);

            it("should fetch solutions with custom options", async () => {
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
                expect(Array.isArray(result.articles)).toBe(true);

                expect(result.articles.length).toBeLessThanOrEqual(5);
            }, 30000);

            it("should handle errors properly for invalid slugs", async () => {
                const invalidSlug = `invalid-slug-${Date.now()}`;
                const data =
                    await service.fetchQuestionSolutionArticles(invalidSlug);

                expect(data).toBeDefined();
                expect(data.totalNum).toBe(0);
                expect(data.articles).toBeDefined();
                expect(data.articles.length).toBe(0);
            }, 30000);
        });

        describe("fetchSolutionArticleDetail", () => {
            it("should fetch solution detail correctly if slug exists", async () => {
                const solutionsResult =
                    await service.fetchQuestionSolutionArticles("two-sum", {
                        limit: 1
                    });

                if (
                    !solutionsResult.edges ||
                    solutionsResult.edges.length === 0
                ) {
                    logger.info(
                        "No solutions found for two-sum on CN, skipping test"
                    );
                    return;
                }

                const slug = solutionsResult.edges[0].node.slug;
                logger.info(`Using slug: ${slug} for detail fetch on CN`);

                const result = await service.fetchSolutionArticleDetail(slug);

                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toBeDefined();
            }, 30000);

            it("should handle errors properly for invalid slugs", async () => {
                const invalidSlug = `invalid-slug-${Date.now()}`;

                await expect(
                    service.fetchSolutionArticleDetail(invalidSlug)
                ).resolves.toBeNull();
            }, 30000);
        });
    });
});
