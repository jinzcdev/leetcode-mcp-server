import { describe, expect, it, vi } from "vitest";
import {
    addQuestionsToFavorite,
    createFavorite,
    FAVORITE_QUESTIONS_PAGE_SIZE,
    fetchAllFavoriteQuestions,
    fetchFavoriteDetail,
    fetchFavoriteQuestions,
    fetchMyFavoriteLists,
    removeQuestionsFromFavorite,
    reorderFavoriteQuestion,
    reorderFavoriteQuestions,
    unwrapGraphQL,
    updateFavoriteIsPublic,
    updateFavoriteNameDescription
} from "../../src/leetcode/favorite-api.js";

/**
 * Builds a raw favoriteQuestionList page as returned by the API.
 */
function questionPage(slugs: string[], hasMore = false) {
    return {
        data: {
            favoriteQuestionList: {
                hasMore,
                totalLength: slugs.length,
                questions: slugs.map((slug, index) => ({
                    id: index + 1,
                    questionFrontendId: String(index + 1),
                    title: slug,
                    translatedTitle: null,
                    titleSlug: slug,
                    difficulty: "EASY",
                    status: "TO_DO",
                    paidOnly: false,
                    topicTags: []
                }))
            }
        }
    };
}

function reorderOk() {
    return { data: { reorderFavoriteQuestionV2: { ok: true, error: null } } };
}

/**
 * Builds a GraphQL executor mock that resolves with the given responses in order.
 */
function graphqlMock(...responses: unknown[]) {
    const executor = vi.fn();
    for (const response of responses) {
        executor.mockResolvedValueOnce(response);
    }
    return executor;
}

describe("favorite-api", () => {
    describe("unwrapGraphQL", () => {
        it("returns data when there are no errors", () => {
            expect(unwrapGraphQL({ data: { foo: 1 } }, "op")).toStrictEqual({
                foo: 1
            });
        });

        it("returns an empty object when data is missing", () => {
            expect(unwrapGraphQL({}, "op")).toStrictEqual({});
            expect(unwrapGraphQL(undefined, "op")).toStrictEqual({});
        });

        it("throws with every GraphQL error message", () => {
            expect(() =>
                unwrapGraphQL(
                    {
                        errors: [{ message: "first" }, { message: "second" }],
                        data: null
                    },
                    "favoriteDetailV2"
                )
            ).toThrow("favoriteDetailV2: first; second");
        });
    });

    describe("fetchMyFavoriteLists", () => {
        it("queries only created lists by default", async () => {
            const graphql = graphqlMock({
                data: {
                    myCreatedFavoriteList: {
                        hasMore: false,
                        totalLength: 1,
                        favorites: [{ slug: "abc", name: "Mine" }]
                    }
                }
            });

            const result = await fetchMyFavoriteLists(graphql);

            expect(graphql).toHaveBeenCalledTimes(1);
            expect(graphql.mock.calls[0][0].query).toContain(
                "myCreatedFavoriteList"
            );
            expect(result).toStrictEqual({
                created: {
                    hasMore: false,
                    totalLength: 1,
                    favorites: [{ slug: "abc", name: "Mine" }]
                }
            });
        });

        it("also queries collected lists when requested", async () => {
            const graphql = graphqlMock(
                { data: { myCreatedFavoriteList: null } },
                {
                    data: {
                        myCollectedFavoriteList: {
                            hasMore: true,
                            totalLength: 7,
                            favorites: [{ slug: "saved" }]
                        }
                    }
                }
            );

            const result = await fetchMyFavoriteLists(graphql, {
                includeCollected: true
            });

            expect(graphql).toHaveBeenCalledTimes(2);
            expect(graphql.mock.calls[1][0].query).toContain(
                "myCollectedFavoriteList"
            );
            expect(result.created).toStrictEqual({
                hasMore: false,
                totalLength: 0,
                favorites: []
            });
            expect(result.collected).toStrictEqual({
                hasMore: true,
                totalLength: 7,
                favorites: [{ slug: "saved" }]
            });
        });
    });

    describe("fetchFavoriteDetail", () => {
        it("passes the slug and returns the detail node", async () => {
            const detail = { slug: "abc", name: "Mine", description: "d" };
            const graphql = graphqlMock({ data: { favoriteDetailV2: detail } });

            await expect(fetchFavoriteDetail(graphql, "abc")).resolves.toBe(
                detail
            );
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc"
            });
        });

        it("throws when the list does not exist", async () => {
            const graphql = graphqlMock({ data: { favoriteDetailV2: null } });

            await expect(
                fetchFavoriteDetail(graphql, "missing")
            ).rejects.toThrow("Problem list missing not found");
        });
    });

    describe("fetchFavoriteQuestions", () => {
        it("applies default pagination and simplifies questions", async () => {
            const graphql = graphqlMock({
                data: {
                    favoriteQuestionList: {
                        hasMore: true,
                        totalLength: 120,
                        questions: [
                            {
                                id: "1",
                                questionFrontendId: "1",
                                title: "Two Sum",
                                translatedTitle: "两数之和",
                                titleSlug: "two-sum",
                                difficulty: "EASY",
                                status: "SOLVED",
                                paidOnly: false,
                                topicTags: [
                                    { name: "Array", slug: "array" },
                                    { name: "Hash Table", slug: "hash-table" }
                                ]
                            }
                        ]
                    }
                }
            });

            const result = await fetchFavoriteQuestions(graphql, "abc");

            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                limit: 50,
                skip: 0,
                searchKeyword: undefined,
                sortBy: { sortField: "CUSTOM", sortOrder: "ASCENDING" },
                version: "v2"
            });
            expect(result.hasMore).toBe(true);
            expect(result.totalLength).toBe(120);
            expect(result.questions).toStrictEqual([
                {
                    questionId: "1",
                    questionFrontendId: "1",
                    title: "Two Sum",
                    translatedTitle: "两数之和",
                    titleSlug: "two-sum",
                    difficulty: "EASY",
                    status: "SOLVED",
                    paidOnly: false,
                    topicTags: ["array", "hash-table"]
                }
            ]);
        });

        it("forwards pagination and keyword options", async () => {
            const graphql = graphqlMock({
                data: { favoriteQuestionList: null }
            });

            const result = await fetchFavoriteQuestions(graphql, "abc", {
                limit: 10,
                skip: 20,
                searchKeyword: "sum"
            });

            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                limit: 10,
                skip: 20,
                searchKeyword: "sum",
                sortBy: { sortField: "CUSTOM", sortOrder: "ASCENDING" },
                version: "v2"
            });
            expect(result).toStrictEqual({
                hasMore: false,
                totalLength: 0,
                questions: []
            });
        });

        it("forwards an explicit sort", async () => {
            const graphql = graphqlMock({
                data: { favoriteQuestionList: null }
            });

            await fetchFavoriteQuestions(graphql, "abc", {
                sortField: "DIFFICULTY",
                sortOrder: "DESCENDING"
            });

            expect(graphql.mock.calls[0][0].variables.sortBy).toStrictEqual({
                sortField: "DIFFICULTY",
                sortOrder: "DESCENDING"
            });
        });
    });

    describe("fetchAllFavoriteQuestions", () => {
        it("follows pagination until hasMore is false", async () => {
            const graphql = graphqlMock(
                questionPage(["a", "b"], true),
                questionPage(["c"], false)
            );

            const questions = await fetchAllFavoriteQuestions(graphql, "abc");

            expect(graphql).toHaveBeenCalledTimes(2);
            expect(graphql.mock.calls[0][0].variables).toMatchObject({
                favoriteSlug: "abc",
                limit: FAVORITE_QUESTIONS_PAGE_SIZE,
                skip: 0,
                sortBy: { sortField: "CUSTOM", sortOrder: "ASCENDING" }
            });
            expect(graphql.mock.calls[1][0].variables.skip).toBe(2);
            expect(
                questions.map((question) => question.titleSlug)
            ).toStrictEqual(["a", "b", "c"]);
        });
    });

    describe("reorderFavoriteQuestion", () => {
        it("sends the slug and zero-based index", async () => {
            const graphql = graphqlMock(reorderOk());

            const result = await reorderFavoriteQuestion(
                graphql,
                "abc",
                "x",
                3
            );

            expect(graphql.mock.calls[0][0].query).toContain(
                "reorderFavoriteQuestionV2"
            );
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                questionSlug: "x",
                reorderNewIndex: 3
            });
            expect(result).toStrictEqual({ ok: true, error: null });
        });
    });

    describe("reorderFavoriteQuestions", () => {
        it("requires exactly one of sortField or questionSlugs", async () => {
            const graphql = graphqlMock();

            await expect(
                reorderFavoriteQuestions(graphql, "abc", {})
            ).rejects.toThrow("exactly one of sortField or questionSlugs");
            await expect(
                reorderFavoriteQuestions(graphql, "abc", {
                    sortField: "DIFFICULTY",
                    questionSlugs: ["a"]
                })
            ).rejects.toThrow("exactly one of sortField or questionSlugs");
            expect(graphql).not.toHaveBeenCalled();
        });

        it("sorts by a field, moving only misplaced questions", async () => {
            const graphql = graphqlMock(
                questionPage(["a", "b", "c", "d"]), // current CUSTOM order
                questionPage(["c", "a", "d", "b"]), // server-sorted target
                reorderOk(), // c -> 0
                reorderOk(), // d -> 2
                questionPage(["c", "a", "d", "b"]) // re-read after moves
            );

            const result = await reorderFavoriteQuestions(graphql, "abc", {
                sortField: "DIFFICULTY",
                sortOrder: "DESCENDING"
            });

            expect(graphql).toHaveBeenCalledTimes(5);
            expect(graphql.mock.calls[1][0].variables.sortBy).toStrictEqual({
                sortField: "DIFFICULTY",
                sortOrder: "DESCENDING"
            });
            expect(graphql.mock.calls[2][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                questionSlug: "c",
                reorderNewIndex: 0
            });
            expect(graphql.mock.calls[3][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                questionSlug: "d",
                reorderNewIndex: 2
            });
            expect(result.mode).toBe("sortField");
            expect(result.target).toStrictEqual(["c", "a", "d", "b"]);
            expect(result.moves).toStrictEqual([
                { questionSlug: "c", newIndex: 0, ok: true, error: null },
                { questionSlug: "d", newIndex: 2, ok: true, error: null }
            ]);
            expect(result.before.map((entry) => entry.titleSlug)).toStrictEqual(
                ["a", "b", "c", "d"]
            );
            expect(result.after.map((entry) => entry.titleSlug)).toStrictEqual([
                "c",
                "a",
                "d",
                "b"
            ]);
            expect(result.success).toBe(true);
        });

        it("moves the given slugs to the top and keeps the rest in order", async () => {
            const graphql = graphqlMock(
                questionPage(["a", "b", "c", "d"]),
                reorderOk(), // d -> 0
                reorderOk(), // b -> 1
                questionPage(["d", "b", "a", "c"])
            );

            const result = await reorderFavoriteQuestions(graphql, "abc", {
                questionSlugs: ["d", "b", "d"]
            });

            expect(graphql).toHaveBeenCalledTimes(4);
            expect(result.mode).toBe("questionSlugs");
            expect(result.target).toStrictEqual(["d", "b", "a", "c"]);
            expect(
                result.moves.map((move) => [move.questionSlug, move.newIndex])
            ).toStrictEqual([
                ["d", 0],
                ["b", 1]
            ]);
            expect(result.success).toBe(true);
        });

        it("does nothing when the list is already in the target order", async () => {
            const graphql = graphqlMock(questionPage(["a", "b"]));

            const result = await reorderFavoriteQuestions(graphql, "abc", {
                questionSlugs: ["a"]
            });

            expect(graphql).toHaveBeenCalledTimes(1);
            expect(result.moves).toStrictEqual([]);
            expect(result.success).toBe(true);
        });

        it("rejects slugs that are not in the list before moving anything", async () => {
            const graphql = graphqlMock(questionPage(["a", "b"]));

            await expect(
                reorderFavoriteQuestions(graphql, "abc", {
                    questionSlugs: ["zzz", "b"]
                })
            ).rejects.toThrow("Questions not in problem list abc: zzz");
            expect(graphql).toHaveBeenCalledTimes(1);
        });

        it("stops at the first failed move and reports the real order", async () => {
            const graphql = graphqlMock(
                questionPage(["a", "b", "c"]),
                questionPage(["c", "b", "a"]),
                {
                    data: {
                        reorderFavoriteQuestionV2: {
                            ok: false,
                            error: "query param error"
                        }
                    }
                },
                questionPage(["a", "b", "c"])
            );

            const result = await reorderFavoriteQuestions(graphql, "abc", {
                sortField: "FRONTEND_ID"
            });

            expect(graphql).toHaveBeenCalledTimes(4);
            expect(result.moves).toStrictEqual([
                {
                    questionSlug: "c",
                    newIndex: 0,
                    ok: false,
                    error: "query param error"
                }
            ]);
            expect(result.success).toBe(false);
        });
    });

    describe("createFavorite", () => {
        it("creates a private NORMAL list by default", async () => {
            const graphql = graphqlMock({
                data: {
                    createEmptyFavorite: {
                        ok: true,
                        error: null,
                        favoriteSlug: "new-slug"
                    }
                }
            });

            const result = await createFavorite(graphql, { name: "My list" });

            expect(graphql.mock.calls[0][0].query).toContain(
                "createEmptyFavorite"
            );
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                name: "My list",
                description: "",
                favoriteType: "NORMAL",
                isPublicFavorite: false
            });
            expect(result).toStrictEqual({
                ok: true,
                error: null,
                favoriteSlug: "new-slug"
            });
        });

        it("reports a rejected creation", async () => {
            const graphql = graphqlMock({
                data: {
                    createEmptyFavorite: {
                        ok: false,
                        error: "Name already exists",
                        favoriteSlug: null
                    }
                }
            });

            const result = await createFavorite(graphql, {
                name: "Dup",
                description: "desc",
                isPublic: true
            });

            expect(graphql.mock.calls[0][0].variables).toMatchObject({
                description: "desc",
                isPublicFavorite: true
            });
            expect(result).toStrictEqual({
                ok: false,
                error: "Name already exists",
                favoriteSlug: null
            });
        });
    });

    describe("updateFavoriteNameDescription", () => {
        it("always sends a description string", async () => {
            const graphql = graphqlMock({
                data: {
                    updateFavoriteNameDescriptionV2: { ok: true, error: null }
                }
            });

            const result = await updateFavoriteNameDescription(
                graphql,
                "abc",
                "Renamed"
            );

            expect(graphql.mock.calls[0][0].query).toContain(
                "updateFavoriteNameDescriptionV2"
            );
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                name: "Renamed",
                description: ""
            });
            expect(result).toStrictEqual({ ok: true, error: null });
        });
    });

    describe("updateFavoriteIsPublic", () => {
        it("uses the isPublic variable name", async () => {
            const graphql = graphqlMock({
                data: { updateFavoriteIsPublicV2: { ok: true, error: null } }
            });

            await updateFavoriteIsPublic(graphql, "abc", true);

            expect(graphql.mock.calls[0][0].query).toContain(
                "updateFavoriteIsPublicV2"
            );
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                isPublic: true
            });
        });
    });

    describe("addQuestionsToFavorite", () => {
        it("adds all slugs in one batch request", async () => {
            const graphql = graphqlMock({
                data: { batchAddQuestionsToFavorite: { ok: true, error: null } }
            });

            const result = await addQuestionsToFavorite(graphql, "abc", [
                "two-sum",
                "add-two-numbers"
            ]);

            expect(graphql).toHaveBeenCalledTimes(1);
            expect(graphql.mock.calls[0][0].query).toContain(
                "batchAddQuestionsToFavorite"
            );
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                questionSlugs: ["two-sum", "add-two-numbers"]
            });
            expect(result).toStrictEqual({ ok: true, error: null });
        });
    });

    describe("removeQuestionsFromFavorite", () => {
        it("removes one question per request and aggregates results", async () => {
            const graphql = graphqlMock(
                {
                    data: {
                        removeQuestionFromFavoriteV2: { ok: true, error: null }
                    }
                },
                {
                    data: {
                        removeQuestionFromFavoriteV2: {
                            ok: false,
                            error: "Question not in list"
                        }
                    }
                }
            );

            const results = await removeQuestionsFromFavorite(graphql, "abc", [
                "two-sum",
                "add-two-numbers"
            ]);

            expect(graphql).toHaveBeenCalledTimes(2);
            expect(graphql.mock.calls[0][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                questionSlug: "two-sum"
            });
            expect(graphql.mock.calls[1][0].variables).toStrictEqual({
                favoriteSlug: "abc",
                questionSlug: "add-two-numbers"
            });
            expect(results).toStrictEqual([
                { questionSlug: "two-sum", ok: true, error: null },
                {
                    questionSlug: "add-two-numbers",
                    ok: false,
                    error: "Question not in list"
                }
            ]);
        });

        it("continues after a GraphQL error on one question", async () => {
            const graphql = graphqlMock(
                { errors: [{ message: "boom" }], data: null },
                {
                    data: {
                        removeQuestionFromFavoriteV2: { ok: true, error: null }
                    }
                }
            );

            const results = await removeQuestionsFromFavorite(graphql, "abc", [
                "bad-slug",
                "two-sum"
            ]);

            expect(results).toStrictEqual([
                {
                    questionSlug: "bad-slug",
                    ok: false,
                    error: "removeQuestionFromFavoriteV2: boom"
                },
                { questionSlug: "two-sum", ok: true, error: null }
            ]);
        });
    });
});
