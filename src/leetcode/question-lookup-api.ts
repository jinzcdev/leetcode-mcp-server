import { GraphQLExecutor, unwrapGraphQL } from "./graphql-executor.js";
import {
    buildQuestionLookupQuery,
    QUESTION_LOOKUP_ALIAS_PREFIX,
    QUESTION_LOOKUP_VARIABLE_PREFIX
} from "./graphql/common/question-lookup-queries.js";

/**
 * Resolves problem numbers (frontend ids) to title slugs.
 *
 * Shared by LeetCode Global and LeetCode CN: both expose the same
 * `problemsetQuestionListV2` search and both require an authenticated session
 * for keyword searches.
 */

/**
 * Maximum number of lookups sent in a single GraphQL request.
 */
export const QUESTION_LOOKUP_CHUNK_SIZE = 20;

/**
 * Search results requested per lookup. The exact frontend id match is ranked
 * first, so a small page is enough; the extra entries only guard against a
 * title match outranking it.
 */
export const QUESTION_LOOKUP_RESULTS_PER_ID = 5;

/**
 * A problem resolved from its frontend id.
 */
export interface ResolvedQuestion {
    questionFrontendId: string;
    titleSlug: string;
    title: string;
    difficulty: string;
    paidOnly: boolean;
}

/**
 * Outcome of resolving a batch of frontend ids. `resolved` keeps the input
 * order; `unresolved` lists the (normalized) ids that matched no problem.
 */
export interface QuestionLookupResult {
    resolved: ResolvedQuestion[];
    unresolved: string[];
}

/**
 * Normalizes user-supplied problem numbers: converts numbers to strings,
 * trims whitespace, drops empty entries and removes duplicates while keeping
 * the first occurrence's position.
 *
 * @param questionIds - Problem numbers as numbers or strings
 * @returns Distinct, trimmed string ids in input order
 */
export function normalizeQuestionIds(
    questionIds: Array<string | number>
): string[] {
    const seen = new Set<string>();
    const normalized: string[] = [];
    for (const raw of questionIds) {
        const id = String(raw).trim();
        if (id.length === 0) {
            continue;
        }
        const key = comparisonKey(id);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        normalized.push(id);
    }
    return normalized;
}

/**
 * Key used to compare frontend ids: whitespace-insensitive and
 * case-insensitive so that "LCP 82", "lcp82" and "LCP  82" are the same id.
 */
function comparisonKey(id: string): string {
    return id.replace(/\s+/g, "").toLowerCase();
}

/**
 * Resolves problem numbers to title slugs using aliased problem set searches,
 * at most `QUESTION_LOOKUP_CHUNK_SIZE` numbers per request. A number counts as
 * resolved only when a returned question's `questionFrontendId` matches it
 * exactly (ignoring whitespace and case); fuzzy title matches are discarded.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param questionIds - Problem numbers as shown on the website
 * @returns `{ resolved, unresolved }` with `resolved` in input order
 * @throws Error when a request fails or the session is not authenticated
 */
export async function resolveQuestionsByFrontendId(
    graphql: GraphQLExecutor,
    questionIds: Array<string | number>
): Promise<QuestionLookupResult> {
    const ids = normalizeQuestionIds(questionIds);
    const resolved: ResolvedQuestion[] = [];
    const unresolved: string[] = [];

    for (
        let start = 0;
        start < ids.length;
        start += QUESTION_LOOKUP_CHUNK_SIZE
    ) {
        const chunk = ids.slice(start, start + QUESTION_LOOKUP_CHUNK_SIZE);
        const variables: Record<string, unknown> = {
            limit: QUESTION_LOOKUP_RESULTS_PER_ID
        };
        chunk.forEach((id, index) => {
            variables[`${QUESTION_LOOKUP_VARIABLE_PREFIX}${index}`] = id;
        });

        const data = unwrapGraphQL(
            await graphql({
                query: buildQuestionLookupQuery(chunk.length),
                variables
            }),
            "problemsetQuestionListV2"
        );

        chunk.forEach((id, index) => {
            const questions =
                data[`${QUESTION_LOOKUP_ALIAS_PREFIX}${index}`]?.questions;
            const match = Array.isArray(questions)
                ? questions.find(
                      (question: any) =>
                          comparisonKey(
                              String(question?.questionFrontendId)
                          ) === comparisonKey(id)
                  )
                : undefined;

            if (match) {
                resolved.push({
                    questionFrontendId: String(match.questionFrontendId),
                    titleSlug: match.titleSlug,
                    title: match.title,
                    difficulty: match.difficulty,
                    paidOnly: match.paidOnly === true
                });
            } else {
                unresolved.push(id);
            }
        });
    }

    return { resolved, unresolved };
}
