/**
 * GraphQL query for fetching solutions for a problem on LeetCode Global
 * `orderBy` can be one of [HOT, MOST_RECENT, MOST_VOTES]
 */
export const SOLUTION_ARTICLES_QUERY = `
query ugcArticleSolutionArticles(
  $questionSlug: String!
  $orderBy: ArticleOrderByEnum
  $userInput: String
  $tagSlugs: [String!]
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $isMine: Boolean
) {
  ugcArticleSolutionArticles(
    questionSlug: $questionSlug
    orderBy: $orderBy
    userInput: $userInput
    tagSlugs: $tagSlugs
    skip: $skip
    first: $first
    before: $before
    after: $after
    last: $last
    isMine: $isMine
  ) {
    totalNum
    pageInfo {
      hasNextPage
    }
    edges {
      node {
        title
        topicId
        summary
        slug
        canSee
        hasVideoArticle
      }
    }
  }
}`;
