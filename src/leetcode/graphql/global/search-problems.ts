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
query (
    $categorySlug: String
    $limit: Int
    $skip: Int
    $filters: QuestionListFilterInput
) {
    problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
    ) {
        total: totalNum
        questions: data {
            acRate
            difficulty
            title
            titleSlug
            topicTags {
                slug
            }
        }
    }
}`;
