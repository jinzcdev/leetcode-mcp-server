import { describe, expect, it, vi } from "vitest";
import { buildQuestionLookupQuery } from "../../src/leetcode/graphql/common/question-lookup-queries.js";
import {
    normalizeQuestionIds,
    QUESTION_LOOKUP_CHUNK_SIZE,
    QUESTION_LOOKUP_RESULTS_PER_ID,
    resolveQuestionsByFrontendId
} from "../../src/leetcode/question-lookup-api.js";

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

function question(frontendId: string, titleSlug: string) {
    return {
        questionFrontendId: frontendId,
        titleSlug,
        title: titleSlug,
        difficulty: "EASY",
        paidOnly: false
    };
}

describe("question-lookup-queries", () => {
    it("builds one aliased lookup per keyword", () => {
        const query = buildQuestionLookupQuery(3);

        expect(query).toContain("$limit: Int!");
        for (const index of [0, 1, 2]) {
            expect(query).toContain(`$k${index}: String!`);
            expect(query).toContain(`q${index}: problemsetQuestionListV2(`);
            expect(query).toContain(`searchKeyword: $k${index}`);
        }
        expect(query).not.toContain("q3:");
        expect(query).toContain("questionFrontendId");
        expect(query).toContain("titleSlug");
    });

    it("rejects an empty lookup", () => {
        expect(() => buildQuestionLookupQuery(0)).toThrow(
            "at least one lookup"
        );
    });
});

describe("normalizeQuestionIds", () => {
    it("stringifies, trims, drops blanks and removes duplicates in order", () => {
        expect(
            normalizeQuestionIds([
                1143,
                " 1 ",
                "",
                "1143",
                "LCP 82",
                "lcp82",
                1
            ])
        ).toStrictEqual(["1143", "1", "LCP 82"]);
    });
});

describe("resolveQuestionsByFrontendId", () => {
    it("resolves exact frontend id matches in input order", async () => {
        const graphql = graphqlMock({
            data: {
                q0: {
                    questions: [question("1143", "longest-common-subsequence")]
                },
                q1: {
                    questions: [
                        question("1", "two-sum"),
                        question("191", "number-of-1-bits")
                    ]
                },
                q2: { questions: [] }
            }
        });

        const result = await resolveQuestionsByFrontendId(graphql, [
            1143,
            "1",
            "999999"
        ]);

        expect(graphql).toHaveBeenCalledTimes(1);
        expect(graphql.mock.calls[0][0].variables).toStrictEqual({
            limit: QUESTION_LOOKUP_RESULTS_PER_ID,
            k0: "1143",
            k1: "1",
            k2: "999999"
        });
        expect(graphql.mock.calls[0][0].query).toContain("$k2: String!");
        expect(result.resolved.map((q) => q.titleSlug)).toStrictEqual([
            "longest-common-subsequence",
            "two-sum"
        ]);
        expect(result.resolved[0]).toStrictEqual({
            questionFrontendId: "1143",
            titleSlug: "longest-common-subsequence",
            title: "longest-common-subsequence",
            difficulty: "EASY",
            paidOnly: false
        });
        expect(result.unresolved).toStrictEqual(["999999"]);
    });

    it("ignores fuzzy matches that do not carry the requested id", async () => {
        const graphql = graphqlMock({
            data: {
                q0: {
                    questions: [
                        question("191", "number-of-1-bits"),
                        question("1139", "largest-1-bordered-square")
                    ]
                }
            }
        });

        const result = await resolveQuestionsByFrontendId(graphql, ["1"]);

        expect(result.resolved).toStrictEqual([]);
        expect(result.unresolved).toStrictEqual(["1"]);
    });

    it("matches non-numeric ids ignoring whitespace and case", async () => {
        const graphql = graphqlMock({
            data: { q0: { questions: [question("LCP 82", "cnHoX6")] } }
        });

        const result = await resolveQuestionsByFrontendId(graphql, ["lcp82"]);

        expect(result.resolved[0].questionFrontendId).toBe("LCP 82");
        expect(result.resolved[0].titleSlug).toBe("cnHoX6");
        expect(result.unresolved).toStrictEqual([]);
    });

    it("splits large batches into chunks", async () => {
        const ids = Array.from(
            { length: QUESTION_LOOKUP_CHUNK_SIZE + 1 },
            (_, index) => String(index + 1)
        );
        const firstChunk: Record<string, unknown> = {};
        for (let index = 0; index < QUESTION_LOOKUP_CHUNK_SIZE; index++) {
            firstChunk[`q${index}`] = {
                questions: [question(ids[index], `slug-${ids[index]}`)]
            };
        }
        const graphql = graphqlMock(
            { data: firstChunk },
            {
                data: {
                    q0: {
                        questions: [
                            question(
                                ids[QUESTION_LOOKUP_CHUNK_SIZE],
                                `slug-${ids[QUESTION_LOOKUP_CHUNK_SIZE]}`
                            )
                        ]
                    }
                }
            }
        );

        const result = await resolveQuestionsByFrontendId(graphql, ids);

        expect(graphql).toHaveBeenCalledTimes(2);
        expect(Object.keys(graphql.mock.calls[0][0].variables)).toHaveLength(
            QUESTION_LOOKUP_CHUNK_SIZE + 1
        );
        expect(graphql.mock.calls[1][0].variables).toStrictEqual({
            limit: QUESTION_LOOKUP_RESULTS_PER_ID,
            k0: ids[QUESTION_LOOKUP_CHUNK_SIZE]
        });
        expect(graphql.mock.calls[1][0].query).not.toContain("q1:");
        expect(result.resolved).toHaveLength(ids.length);
        expect(result.unresolved).toStrictEqual([]);
    });

    it("skips the request when every id is blank", async () => {
        const graphql = graphqlMock();

        const result = await resolveQuestionsByFrontendId(graphql, ["", "  "]);

        expect(graphql).not.toHaveBeenCalled();
        expect(result).toStrictEqual({ resolved: [], unresolved: [] });
    });

    it("throws when the search rejects the request", async () => {
        const graphql = graphqlMock({
            errors: [{ message: "Please Register or Sign in" }],
            data: null
        });

        await expect(
            resolveQuestionsByFrontendId(graphql, ["1"])
        ).rejects.toThrow(
            "problemsetQuestionListV2: Please Register or Sign in"
        );
    });
});
