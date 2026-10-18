/**
 * GraphQL documents for looking up problems by their frontend id (the problem
 * number shown on the website, e.g. "1143" or "LCP 82").
 *
 * LeetCode has no query that takes a frontend id directly. The problem set
 * search (`problemsetQuestionListV2` with `searchKeyword`) matches a numeric
 * keyword against the frontend id and ranks the exact match first, so several
 * numbers can be resolved in a single request by giving each lookup its own
 * alias. The search requires an authenticated session on both sites.
 */

/**
 * Prefix of the alias used for lookup `i` (`q0`, `q1`, ...).
 */
export const QUESTION_LOOKUP_ALIAS_PREFIX = "q";

/**
 * Prefix of the variable holding the keyword of lookup `i` (`k0`, `k1`, ...).
 */
export const QUESTION_LOOKUP_VARIABLE_PREFIX = "k";

/**
 * Builds a query that runs `count` independent keyword searches in one request.
 * Lookup `i` reads its keyword from variable `$k{i}` and is returned under the
 * alias `q{i}`; every lookup returns at most `$limit` questions.
 *
 * @param count - Number of keywords to look up (must be at least 1)
 * @returns The GraphQL document
 */
export function buildQuestionLookupQuery(count: number): string {
    if (!Number.isInteger(count) || count < 1) {
        throw new Error(
            "buildQuestionLookupQuery requires at least one lookup"
        );
    }

    const variableDefinitions = Array.from(
        { length: count },
        (_, index) => `    $${QUESTION_LOOKUP_VARIABLE_PREFIX}${index}: String!`
    ).join("\n");

    const selections = Array.from(
        { length: count },
        (_, index) => `
    ${QUESTION_LOOKUP_ALIAS_PREFIX}${index}: problemsetQuestionListV2(
        categorySlug: ""
        limit: $limit
        skip: 0
        searchKeyword: $${QUESTION_LOOKUP_VARIABLE_PREFIX}${index}
    ) {
        questions {
            questionFrontendId
            titleSlug
            title
            difficulty
            paidOnly
        }
    }`
    ).join("");

    return `
query questionLookupByFrontendId(
    $limit: Int!
${variableDefinitions}
) {${selections}
}`;
}
