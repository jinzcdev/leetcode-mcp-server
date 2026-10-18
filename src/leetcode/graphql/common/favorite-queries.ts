/**
 * GraphQL documents for LeetCode problem lists (called "favorites" in the API).
 *
 * The V2 favorites API is shared by LeetCode Global (leetcode.com) and
 * LeetCode CN (leetcode.cn). Lists are identified by their slug, which is the
 * path segment after /problem-list/ in the list URL. All operations require an
 * authenticated session.
 */

/**
 * Fields selected for a problem list summary (used by list and detail queries).
 */
const FAVORITE_SUMMARY_FIELDS = `
            slug
            name
            isPublicFavorite
            favoriteType
            questionNumber
            lastQuestionAddedAt`;

/**
 * GraphQL query for the problem lists created by the authenticated user.
 */
export const MY_CREATED_FAVORITE_LISTS_QUERY = `
query myCreatedFavoriteList {
    myCreatedFavoriteList {
        hasMore
        totalLength
        favorites {${FAVORITE_SUMMARY_FIELDS}
        }
    }
}`;

/**
 * GraphQL query for the problem lists the authenticated user has saved
 * (collected) from other creators.
 */
export const MY_COLLECTED_FAVORITE_LISTS_QUERY = `
query myCollectedFavoriteList {
    myCollectedFavoriteList {
        hasMore
        totalLength
        favorites {${FAVORITE_SUMMARY_FIELDS}
        }
    }
}`;

/**
 * GraphQL query for the metadata of a single problem list.
 *
 * @param favoriteSlug - Slug of the problem list
 */
export const FAVORITE_DETAIL_QUERY = `
query favoriteDetailV2($favoriteSlug: String!) {
    favoriteDetailV2(favoriteSlug: $favoriteSlug) {${FAVORITE_SUMMARY_FIELDS}
        description
        creator {
            userSlug
            realName
        }
    }
}`;

/**
 * GraphQL query for the questions contained in a problem list, with pagination
 * and optional keyword search.
 *
 * The server only honours `limit` and `skip` when `version` is "v2"; without it
 * every question is returned and `hasMore` is always false. `sortBy` with the
 * CUSTOM field keeps the order the list shows on the website.
 *
 * @param favoriteSlug - Slug of the problem list
 * @param limit - Maximum number of questions to return
 * @param skip - Number of questions to skip
 * @param searchKeyword - Optional keyword to filter questions by title
 * @param sortBy - Sort order, e.g. `{ sortField: "CUSTOM", sortOrder: "ASCENDING" }`
 * @param version - API version; must be "v2" for pagination to apply
 */
export const FAVORITE_QUESTION_LIST_QUERY = `
query favoriteQuestionList(
    $favoriteSlug: String!
    $limit: Int
    $skip: Int
    $searchKeyword: String
    $sortBy: QuestionSortByInput
    $version: String = "v2"
) {
    favoriteQuestionList(
        favoriteSlug: $favoriteSlug
        limit: $limit
        skip: $skip
        searchKeyword: $searchKeyword
        sortBy: $sortBy
        version: $version
    ) {
        hasMore
        totalLength
        questions {
            id
            questionFrontendId
            title
            translatedTitle
            titleSlug
            difficulty
            status
            paidOnly
            topicTags {
                name
                slug
            }
        }
    }
}`;

/**
 * GraphQL mutation that creates a new, empty problem list.
 *
 * @param name - Display name of the list
 * @param description - Optional description
 * @param favoriteType - Always "NORMAL" for user-created lists
 * @param isPublicFavorite - Whether the list is publicly visible
 */
export const CREATE_FAVORITE_MUTATION = `
mutation createEmptyFavorite(
    $name: String!
    $description: String
    $favoriteType: FavoriteTypeEnum!
    $isPublicFavorite: Boolean
) {
    createEmptyFavorite(
        name: $name
        description: $description
        favoriteType: $favoriteType
        isPublicFavorite: $isPublicFavorite
    ) {
        ok
        error
        favoriteSlug
    }
}`;

/**
 * GraphQL mutation that renames a problem list and/or changes its description.
 * The server requires the name even when only the description changes.
 *
 * @param favoriteSlug - Slug of the problem list
 * @param name - New (or unchanged) display name
 * @param description - New (or unchanged) description
 */
export const UPDATE_FAVORITE_NAME_DESCRIPTION_MUTATION = `
mutation updateFavoriteNameDescriptionV2(
    $favoriteSlug: String!
    $name: String!
    $description: String
) {
    updateFavoriteNameDescriptionV2(
        favoriteSlug: $favoriteSlug
        name: $name
        description: $description
    ) {
        ok
        error
    }
}`;

/**
 * GraphQL mutation that toggles the public visibility of a problem list.
 *
 * @param favoriteSlug - Slug of the problem list
 * @param isPublic - True to make the list public, false for private
 */
export const UPDATE_FAVORITE_IS_PUBLIC_MUTATION = `
mutation updateFavoriteIsPublicV2($favoriteSlug: String!, $isPublic: Boolean!) {
    updateFavoriteIsPublicV2(favoriteSlug: $favoriteSlug, isPublic: $isPublic) {
        ok
        error
    }
}`;

/**
 * GraphQL mutation that adds one or more questions to a problem list.
 *
 * @param favoriteSlug - Slug of the problem list
 * @param questionSlugs - Title slugs of the questions to add (e.g. "two-sum")
 */
export const BATCH_ADD_QUESTIONS_TO_FAVORITE_MUTATION = `
mutation batchAddQuestionsToFavorite(
    $favoriteSlug: String!
    $questionSlugs: [String]!
) {
    batchAddQuestionsToFavorite(
        favoriteSlug: $favoriteSlug
        questionSlugs: $questionSlugs
    ) {
        ok
        error
    }
}`;

/**
 * GraphQL mutation that moves a single question to a new position in the
 * list's custom order.
 *
 * `reorderNewIndex` is zero-based and applied as "remove, then insert at the
 * index"; an index past the end moves the question to the end. The mutation
 * also accepts `moveToTop` / `moveToBottom` booleans, but `moveToBottom` was
 * observed to move the question to the top instead, so only the index is used.
 *
 * @param favoriteSlug - Slug of the problem list
 * @param questionSlug - Title slug of the question to move
 * @param reorderNewIndex - Zero-based target position
 */
export const REORDER_FAVORITE_QUESTION_MUTATION = `
mutation reorderFavoriteQuestionV2(
    $favoriteSlug: String!
    $questionSlug: String!
    $reorderNewIndex: Int!
) {
    reorderFavoriteQuestionV2(
        favoriteSlug: $favoriteSlug
        questionSlug: $questionSlug
        reorderNewIndex: $reorderNewIndex
    ) {
        ok
        error
    }
}`;

/**
 * GraphQL mutation that removes a single question from a problem list.
 *
 * @param favoriteSlug - Slug of the problem list
 * @param questionSlug - Title slug of the question to remove
 */
export const REMOVE_QUESTION_FROM_FAVORITE_MUTATION = `
mutation removeQuestionFromFavoriteV2(
    $favoriteSlug: String!
    $questionSlug: String!
) {
    removeQuestionFromFavoriteV2(
        favoriteSlug: $favoriteSlug
        questionSlug: $questionSlug
    ) {
        ok
        error
    }
}`;
