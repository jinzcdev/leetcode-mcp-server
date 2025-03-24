/**
 * GraphQL API for searching problems
 *
 * QuestionListFilterInput:
 * {
 *    tags: [String]
 *    difficulty: String
 *    searchKeywords: String
 * }
 */
export const SEARCH_PROBLEMS_QUERY = `
query problemsetQuestionList(
    $categorySlug: String
    $limit: Int
    $skip: Int
    $filters: QuestionListFilterInput
) {
    problemsetQuestionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
    ) {
        hasMore
        total
        questions {
            title
            titleCn
            titleSlug
            difficulty
            acRate
            topicTags {
                slug
            }
        }
    }
}`;
