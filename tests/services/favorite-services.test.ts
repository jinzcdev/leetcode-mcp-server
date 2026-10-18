import { Credential, LeetCode, LeetCodeCN } from "leetcode-query";
import { beforeAll, describe, expect, it } from "vitest";
import { LeetCodeBaseService } from "../../src/leetcode/leetcode-base-service.js";
import { LeetCodeCNService } from "../../src/leetcode/leetcode-cn-service.js";
import { LeetCodeGlobalService } from "../../src/leetcode/leetcode-global-service.js";

/**
 * Live, read-only checks for the problem list (favorites) services.
 *
 * They run only when LEETCODE_SESSION is set. The cookie belongs to a single
 * site, so LEETCODE_SITE selects which service is exercised (default: global).
 * No mutations are performed.
 */
const session = process.env.LEETCODE_SESSION;
const site = (process.env.LEETCODE_SITE || "global").toLowerCase();

async function createAuthenticatedService(): Promise<LeetCodeBaseService> {
    const credential = new Credential();
    await credential.init(session);

    return site === "cn"
        ? new LeetCodeCNService(new LeetCodeCN(credential), credential)
        : new LeetCodeGlobalService(new LeetCode(credential), credential);
}

describe.skipIf(!session)(
    `LeetCode Problem List Services (live, ${site})`,
    () => {
        let service: LeetCodeBaseService;

        beforeAll(async () => {
            service = await createAuthenticatedService();
        }, 30000);

        it("lists the current user's problem lists", async () => {
            const result = await service.fetchMyFavoriteLists({
                includeCollected: true
            });

            expect(result.created).toBeDefined();
            expect(Array.isArray(result.created.favorites)).toBe(true);
            expect(result.collected).toBeDefined();
            expect(Array.isArray(result.collected.favorites)).toBe(true);

            for (const favorite of result.created.favorites) {
                expect(typeof favorite.slug).toBe("string");
                expect(typeof favorite.name).toBe("string");
            }
        }, 30000);

        it("fetches detail and questions for the first list", async () => {
            const lists = await service.fetchMyFavoriteLists();
            const first = lists.created.favorites[0];
            if (!first) {
                return;
            }

            const detail = await service.fetchFavoriteDetail(first.slug);
            expect(detail.slug).toBe(first.slug);
            expect(detail.name).toBe(first.name);

            const page = await service.fetchFavoriteQuestions(first.slug, {
                limit: 5,
                skip: 0
            });
            expect(Array.isArray(page.questions)).toBe(true);
            expect(page.questions.length).toBeLessThanOrEqual(5);
            for (const question of page.questions) {
                expect(typeof question.titleSlug).toBe("string");
                expect(Array.isArray(question.topicTags)).toBe(true);
            }
        }, 60000);

        it("sorts a list's questions by problem number", async () => {
            const lists = await service.fetchMyFavoriteLists();
            const first = lists.created.favorites.find(
                (favorite: { questionNumber: number }) =>
                    favorite.questionNumber >= 2
            );
            if (!first) {
                return;
            }

            const page = await service.fetchFavoriteQuestions(first.slug, {
                limit: 10,
                sortField: "FRONTEND_ID",
                sortOrder: "ASCENDING"
            });
            const numericIds = page.questions
                .map((question: { questionFrontendId: string }) =>
                    Number(question.questionFrontendId)
                )
                .filter((id: number) => Number.isFinite(id));
            for (let index = 1; index < numericIds.length; index++) {
                expect(numericIds[index]).toBeGreaterThanOrEqual(
                    numericIds[index - 1]
                );
            }
        }, 60000);

        it("resolves problem numbers to slugs", async () => {
            const result = await service.resolveQuestionsByFrontendId([
                1,
                "1143",
                "999999"
            ]);

            expect(
                result.resolved.map(
                    (question: { titleSlug: string }) => question.titleSlug
                )
            ).toStrictEqual(["two-sum", "longest-common-subsequence"]);
            expect(result.unresolved).toStrictEqual(["999999"]);
        }, 30000);
    }
);

describe("LeetCode Problem List Services (unauthenticated)", () => {
    it("rejects problem list calls without credentials on Global", async () => {
        const credential = new Credential();
        const service = new LeetCodeGlobalService(
            new LeetCode(credential),
            credential
        );

        await expect(service.fetchMyFavoriteLists()).rejects.toThrow(
            "Authentication required"
        );
        await expect(
            service.createFavorite({ name: "should-not-run" })
        ).rejects.toThrow("Authentication required");
        await expect(service.resolveQuestionsByFrontendId([1])).rejects.toThrow(
            "Authentication required"
        );
        await expect(
            service.reorderFavoriteQuestions("any", { sortField: "DIFFICULTY" })
        ).rejects.toThrow("Authentication required");
    });

    it("rejects problem list calls without credentials on CN", async () => {
        const credential = new Credential();
        const service = new LeetCodeCNService(
            new LeetCodeCN(credential),
            credential
        );

        await expect(service.fetchFavoriteDetail("any")).rejects.toThrow(
            "Authentication required"
        );
        await expect(
            service.addQuestionsToFavorite("any", ["two-sum"])
        ).rejects.toThrow("Authentication required");
    });
});
