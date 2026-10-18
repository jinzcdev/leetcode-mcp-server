import { GraphQLExecutor, unwrapGraphQL } from "./graphql-executor.js";
import {
    BATCH_ADD_QUESTIONS_TO_FAVORITE_MUTATION,
    CREATE_FAVORITE_MUTATION,
    FAVORITE_DETAIL_QUERY,
    FAVORITE_QUESTION_LIST_QUERY,
    MY_COLLECTED_FAVORITE_LISTS_QUERY,
    MY_CREATED_FAVORITE_LISTS_QUERY,
    REMOVE_QUESTION_FROM_FAVORITE_MUTATION,
    REORDER_FAVORITE_QUESTION_MUTATION,
    UPDATE_FAVORITE_IS_PUBLIC_MUTATION,
    UPDATE_FAVORITE_NAME_DESCRIPTION_MUTATION
} from "./graphql/common/favorite-queries.js";

export { unwrapGraphQL } from "./graphql-executor.js";
export type { GraphQLExecutor, GraphQLRequest } from "./graphql-executor.js";

/**
 * Shared implementation of the LeetCode problem list ("favorites") operations.
 *
 * LeetCode Global and LeetCode CN expose the same V2 favorites GraphQL API, so
 * both service implementations delegate to these functions. Each function takes
 * a GraphQL executor (the `graphql` method of a leetcode-query client), which is
 * responsible for sending the session cookie and CSRF token.
 */

/**
 * The favorite type used for all user-created problem lists.
 */
export const FAVORITE_TYPE_NORMAL = "NORMAL";

/**
 * Default page size when listing the questions of a problem list.
 */
export const DEFAULT_FAVORITE_QUESTIONS_LIMIT = 50;

/**
 * Page size used when the whole list has to be read (e.g. before reordering).
 */
export const FAVORITE_QUESTIONS_PAGE_SIZE = 100;

/**
 * API version of `favoriteQuestionList`. Pagination (`limit` / `skip`) is only
 * applied by the server for "v2".
 */
export const FAVORITE_QUESTION_LIST_VERSION = "v2";

/**
 * Sort fields accepted by `favoriteQuestionList` (verified on both sites).
 * CUSTOM is the order shown on the problem list page of the website.
 */
export const FAVORITE_QUESTION_SORT_FIELDS = [
    "CUSTOM",
    "FRONTEND_ID",
    "DIFFICULTY",
    "AC_RATE",
    "FREQUENCY",
    "CONTEST_POINT"
] as const;

export type FavoriteQuestionSortField =
    (typeof FAVORITE_QUESTION_SORT_FIELDS)[number];

/**
 * Sort fields that can serve as the target of a reorder (CUSTOM is the order
 * being rewritten, so it is excluded).
 */
export const FAVORITE_QUESTION_REORDER_SORT_FIELDS = [
    "FRONTEND_ID",
    "DIFFICULTY",
    "AC_RATE",
    "FREQUENCY",
    "CONTEST_POINT"
] as const;

/**
 * Sort directions accepted by `favoriteQuestionList`.
 */
export const FAVORITE_QUESTION_SORT_ORDERS = [
    "ASCENDING",
    "DESCENDING"
] as const;

export type FavoriteQuestionSortOrder =
    (typeof FAVORITE_QUESTION_SORT_ORDERS)[number];

/**
 * Sort specification passed to `favoriteQuestionList`.
 */
export interface FavoriteQuestionSortBy {
    sortField: FavoriteQuestionSortField;
    sortOrder: FavoriteQuestionSortOrder;
}

/**
 * Default sort for `favoriteQuestionList`: the order shown on the website.
 */
export const FAVORITE_QUESTIONS_SORT_BY: FavoriteQuestionSortBy = {
    sortField: "CUSTOM",
    sortOrder: "ASCENDING"
};

/**
 * Result shape shared by all favorites mutations.
 */
export interface FavoriteMutationResult {
    ok: boolean;
    error: string | null;
}

/**
 * Options for reading the questions of a problem list.
 */
export interface FetchFavoriteQuestionsOptions {
    limit?: number;
    skip?: number;
    searchKeyword?: string;
    sortField?: FavoriteQuestionSortField;
    sortOrder?: FavoriteQuestionSortOrder;
}

/**
 * Options for reordering a problem list: exactly one of `sortField` (sort the
 * whole list by that field) or `questionSlugs` (move these questions to the top
 * in the given order) must be provided.
 */
export interface ReorderFavoriteQuestionsOptions {
    sortField?: FavoriteQuestionSortField;
    sortOrder?: FavoriteQuestionSortOrder;
    questionSlugs?: string[];
}

/**
 * Question entry as returned by the favorites helpers.
 */
export interface FavoriteQuestion {
    questionId: unknown;
    questionFrontendId: string;
    title: string;
    translatedTitle: string | null;
    titleSlug: string;
    difficulty: string;
    status: string | null;
    paidOnly: boolean;
    topicTags: string[];
}

function simplifyFavoriteQuestion(question: any): FavoriteQuestion {
    return {
        questionId: question.id,
        questionFrontendId: question.questionFrontendId,
        title: question.title,
        translatedTitle: question.translatedTitle ?? null,
        titleSlug: question.titleSlug,
        difficulty: question.difficulty,
        status: question.status ?? null,
        paidOnly: question.paidOnly === true,
        topicTags: (question.topicTags ?? []).map((tag: any) => tag.slug)
    };
}

function resolveSortBy(options?: {
    sortField?: FavoriteQuestionSortField;
    sortOrder?: FavoriteQuestionSortOrder;
}): FavoriteQuestionSortBy {
    return {
        sortField: options?.sortField ?? FAVORITE_QUESTIONS_SORT_BY.sortField,
        sortOrder: options?.sortOrder ?? FAVORITE_QUESTIONS_SORT_BY.sortOrder
    };
}

function normalizeMutationResult(result: any): FavoriteMutationResult {
    return {
        ok: result?.ok === true,
        error: result?.error ?? null
    };
}

function normalizeFavoritePage(page: any) {
    return {
        hasMore: page?.hasMore ?? false,
        totalLength: page?.totalLength ?? 0,
        favorites: Array.isArray(page?.favorites) ? page.favorites : []
    };
}

/**
 * Retrieves the problem lists owned by the authenticated user and, optionally,
 * the lists the user has saved from other creators.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param options.includeCollected - Also fetch saved (collected) lists
 * @returns `{ created, collected? }`, each with `hasMore`, `totalLength`, `favorites`
 */
export async function fetchMyFavoriteLists(
    graphql: GraphQLExecutor,
    options?: { includeCollected?: boolean }
): Promise<any> {
    const createdData = unwrapGraphQL(
        await graphql({ query: MY_CREATED_FAVORITE_LISTS_QUERY }),
        "myCreatedFavoriteList"
    );

    const result: Record<string, unknown> = {
        created: normalizeFavoritePage(createdData.myCreatedFavoriteList)
    };

    if (options?.includeCollected) {
        const collectedData = unwrapGraphQL(
            await graphql({ query: MY_COLLECTED_FAVORITE_LISTS_QUERY }),
            "myCollectedFavoriteList"
        );
        result.collected = normalizeFavoritePage(
            collectedData.myCollectedFavoriteList
        );
    }

    return result;
}

/**
 * Retrieves the metadata of a single problem list.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @returns The list metadata (slug, name, description, visibility, size, creator)
 * @throws Error when the list does not exist or is not visible to the user
 */
export async function fetchFavoriteDetail(
    graphql: GraphQLExecutor,
    favoriteSlug: string
): Promise<any> {
    const data = unwrapGraphQL(
        await graphql({
            query: FAVORITE_DETAIL_QUERY,
            variables: { favoriteSlug }
        }),
        "favoriteDetailV2"
    );

    if (!data.favoriteDetailV2) {
        throw new Error(`Problem list ${favoriteSlug} not found`);
    }

    return data.favoriteDetailV2;
}

/**
 * Retrieves a page of the questions contained in a problem list.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param options.limit - Maximum number of questions to return (default: 50)
 * @param options.skip - Number of questions to skip (default: 0)
 * @param options.searchKeyword - Optional keyword to filter questions by title
 * @param options.sortField - Sort field (default: CUSTOM, the website order)
 * @param options.sortOrder - ASCENDING (default) or DESCENDING
 * @returns `{ hasMore, totalLength, questions }` with simplified question entries
 */
export async function fetchFavoriteQuestions(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    options?: FetchFavoriteQuestionsOptions
): Promise<any> {
    const variables = {
        favoriteSlug,
        limit: options?.limit ?? DEFAULT_FAVORITE_QUESTIONS_LIMIT,
        skip: options?.skip ?? 0,
        searchKeyword: options?.searchKeyword,
        sortBy: resolveSortBy(options),
        version: FAVORITE_QUESTION_LIST_VERSION
    };

    const data = unwrapGraphQL(
        await graphql({ query: FAVORITE_QUESTION_LIST_QUERY, variables }),
        "favoriteQuestionList"
    );

    const list = data.favoriteQuestionList;
    if (!list) {
        return { hasMore: false, totalLength: 0, questions: [] };
    }

    const questions = Array.isArray(list.questions) ? list.questions : [];
    return {
        hasMore: list.hasMore ?? false,
        totalLength: list.totalLength ?? questions.length,
        questions: questions.map(simplifyFavoriteQuestion)
    };
}

/**
 * Reads every question of a problem list by following the pagination.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param sortBy - Sort specification (default: CUSTOM ascending)
 * @returns All questions of the list in the requested order
 */
export async function fetchAllFavoriteQuestions(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    sortBy?: Partial<FavoriteQuestionSortBy>
): Promise<FavoriteQuestion[]> {
    const questions: FavoriteQuestion[] = [];
    let skip = 0;

    for (;;) {
        const page = await fetchFavoriteQuestions(graphql, favoriteSlug, {
            limit: FAVORITE_QUESTIONS_PAGE_SIZE,
            skip,
            ...resolveSortBy(sortBy)
        });
        questions.push(...page.questions);
        if (!page.hasMore || page.questions.length === 0) {
            break;
        }
        skip += page.questions.length;
    }

    return questions;
}

/**
 * Creates a new, empty problem list.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param options.name - Display name of the list
 * @param options.description - Optional description (default: "")
 * @param options.isPublic - Whether the list is public (default: false)
 * @returns `{ ok, error, favoriteSlug }`
 */
export async function createFavorite(
    graphql: GraphQLExecutor,
    options: { name: string; description?: string; isPublic?: boolean }
): Promise<FavoriteMutationResult & { favoriteSlug: string | null }> {
    const variables = {
        name: options.name,
        description: options.description ?? "",
        favoriteType: FAVORITE_TYPE_NORMAL,
        isPublicFavorite: options.isPublic ?? false
    };

    const data = unwrapGraphQL(
        await graphql({ query: CREATE_FAVORITE_MUTATION, variables }),
        "createEmptyFavorite"
    );

    const result = data.createEmptyFavorite;
    return {
        ...normalizeMutationResult(result),
        favoriteSlug: result?.favoriteSlug ?? null
    };
}

/**
 * Renames a problem list and/or updates its description. LeetCode requires the
 * name on every call, so callers that only change the description must pass the
 * current name.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param name - New (or unchanged) display name
 * @param description - New (or unchanged) description (default: "")
 * @returns `{ ok, error }`
 */
export async function updateFavoriteNameDescription(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    name: string,
    description?: string
): Promise<FavoriteMutationResult> {
    const data = unwrapGraphQL(
        await graphql({
            query: UPDATE_FAVORITE_NAME_DESCRIPTION_MUTATION,
            variables: { favoriteSlug, name, description: description ?? "" }
        }),
        "updateFavoriteNameDescriptionV2"
    );

    return normalizeMutationResult(data.updateFavoriteNameDescriptionV2);
}

/**
 * Changes the public visibility of a problem list.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param isPublic - True to make the list public, false for private
 * @returns `{ ok, error }`
 */
export async function updateFavoriteIsPublic(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    isPublic: boolean
): Promise<FavoriteMutationResult> {
    const data = unwrapGraphQL(
        await graphql({
            query: UPDATE_FAVORITE_IS_PUBLIC_MUTATION,
            variables: { favoriteSlug, isPublic }
        }),
        "updateFavoriteIsPublicV2"
    );

    return normalizeMutationResult(data.updateFavoriteIsPublicV2);
}

/**
 * Adds questions to a problem list in a single request.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param questionSlugs - Title slugs of the questions to add
 * @returns `{ ok, error }`
 */
export async function addQuestionsToFavorite(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    questionSlugs: string[]
): Promise<FavoriteMutationResult> {
    const data = unwrapGraphQL(
        await graphql({
            query: BATCH_ADD_QUESTIONS_TO_FAVORITE_MUTATION,
            variables: { favoriteSlug, questionSlugs }
        }),
        "batchAddQuestionsToFavorite"
    );

    return normalizeMutationResult(data.batchAddQuestionsToFavorite);
}

/**
 * Removes questions from a problem list. The API removes one question per
 * request, so the questions are processed sequentially and the outcome of each
 * removal is reported individually.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param questionSlugs - Title slugs of the questions to remove
 * @returns One `{ questionSlug, ok, error }` entry per requested question
 */
export async function removeQuestionsFromFavorite(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    questionSlugs: string[]
): Promise<Array<FavoriteMutationResult & { questionSlug: string }>> {
    const results: Array<FavoriteMutationResult & { questionSlug: string }> =
        [];

    for (const questionSlug of questionSlugs) {
        try {
            const data = unwrapGraphQL(
                await graphql({
                    query: REMOVE_QUESTION_FROM_FAVORITE_MUTATION,
                    variables: { favoriteSlug, questionSlug }
                }),
                "removeQuestionFromFavoriteV2"
            );
            results.push({
                questionSlug,
                ...normalizeMutationResult(data.removeQuestionFromFavoriteV2)
            });
        } catch (error: any) {
            results.push({
                questionSlug,
                ok: false,
                error: error?.message ?? String(error)
            });
        }
    }

    return results;
}

/**
 * Moves one question to a new zero-based position in the list's custom order.
 * The server removes the question and re-inserts it at the index, so an index
 * past the end moves it to the end.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param questionSlug - Title slug of the question to move
 * @param newIndex - Zero-based target position
 * @returns `{ ok, error }`
 */
export async function reorderFavoriteQuestion(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    questionSlug: string,
    newIndex: number
): Promise<FavoriteMutationResult> {
    const data = unwrapGraphQL(
        await graphql({
            query: REORDER_FAVORITE_QUESTION_MUTATION,
            variables: { favoriteSlug, questionSlug, reorderNewIndex: newIndex }
        }),
        "reorderFavoriteQuestionV2"
    );

    return normalizeMutationResult(data.reorderFavoriteQuestionV2);
}

/**
 * One move performed while reordering a list.
 */
export interface FavoriteReorderMove extends FavoriteMutationResult {
    questionSlug: string;
    newIndex: number;
}

/**
 * Outcome of reordering a problem list.
 */
export interface ReorderFavoriteQuestionsResult {
    mode: "sortField" | "questionSlugs";
    before: Array<{ questionFrontendId: string; titleSlug: string }>;
    target: string[];
    after: Array<{ questionFrontendId: string; titleSlug: string }>;
    moves: FavoriteReorderMove[];
    success: boolean;
}

function toOrderEntries(questions: FavoriteQuestion[]) {
    return questions.map((question) => ({
        questionFrontendId: question.questionFrontendId,
        titleSlug: question.titleSlug
    }));
}

/**
 * Rewrites the custom order of a problem list.
 *
 * The target order comes either from the server (`sortField` + `sortOrder`:
 * the list sorted by that field) or from the caller (`questionSlugs`: those
 * questions first, in the given order, followed by the remaining questions in
 * their current relative order). The current order is then swept from the
 * front and every question that is out of place is moved to its target index
 * with one `reorderFavoriteQuestionV2` call, so questions already in position
 * cost no request. The sweep stops at the first failed move.
 *
 * @param graphql - GraphQL executor bound to an authenticated client
 * @param favoriteSlug - Slug of the problem list
 * @param options - Exactly one of `sortField` or `questionSlugs`
 * @returns The order before and after, the target order and every move made
 * @throws Error when the options are invalid, a requested slug is not in the
 *   list, or a request fails
 */
export async function reorderFavoriteQuestions(
    graphql: GraphQLExecutor,
    favoriteSlug: string,
    options: ReorderFavoriteQuestionsOptions
): Promise<ReorderFavoriteQuestionsResult> {
    const hasSortField = options.sortField !== undefined;
    const hasSlugs =
        Array.isArray(options.questionSlugs) &&
        options.questionSlugs.length > 0;
    if (hasSortField === hasSlugs) {
        throw new Error(
            "Provide exactly one of sortField or questionSlugs to reorder a problem list"
        );
    }

    const before = await fetchAllFavoriteQuestions(graphql, favoriteSlug);
    const currentSlugs = before.map((question) => question.titleSlug);

    let target: string[];
    let mode: ReorderFavoriteQuestionsResult["mode"];
    if (hasSortField) {
        mode = "sortField";
        const sorted = await fetchAllFavoriteQuestions(graphql, favoriteSlug, {
            sortField: options.sortField,
            sortOrder: options.sortOrder
        });
        target = sorted.map((question) => question.titleSlug);
    } else {
        mode = "questionSlugs";
        const requested = [...new Set(options.questionSlugs)];
        const missing = requested.filter(
            (slug) => !currentSlugs.includes(slug)
        );
        if (missing.length > 0) {
            throw new Error(
                `Questions not in problem list ${favoriteSlug}: ${missing.join(", ")}`
            );
        }
        target = [
            ...requested,
            ...currentSlugs.filter((slug) => !requested.includes(slug))
        ];
    }

    const working = [...currentSlugs];
    const moves: FavoriteReorderMove[] = [];
    for (let index = 0; index < target.length; index++) {
        const slug = target[index];
        if (working[index] === slug) {
            continue;
        }
        const from = working.indexOf(slug);
        if (from < 0) {
            moves.push({
                questionSlug: slug,
                newIndex: index,
                ok: false,
                error: "question not in list"
            });
            break;
        }

        const result = await reorderFavoriteQuestion(
            graphql,
            favoriteSlug,
            slug,
            index
        );
        moves.push({ questionSlug: slug, newIndex: index, ...result });
        if (!result.ok) {
            break;
        }
        working.splice(from, 1);
        working.splice(index, 0, slug);
    }

    const after =
        moves.length === 0
            ? before
            : await fetchAllFavoriteQuestions(graphql, favoriteSlug);
    const afterSlugs = after.map((question) => question.titleSlug);
    const success =
        afterSlugs.length === target.length &&
        afterSlugs.every((slug, index) => slug === target[index]);

    return {
        mode,
        before: toOrderEntries(before),
        target,
        after: toOrderEntries(after),
        moves,
        success
    };
}
