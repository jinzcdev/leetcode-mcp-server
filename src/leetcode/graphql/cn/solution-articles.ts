/**
 * GraphQL query for fetching solutions for a problem on LeetCode CN
 * `orderBy` can be one of [DEFAULT, MOST_UPVOTE, HOT, NEWEST_TO_OLDEST, OLDEST_TO_NEWEST]
 */
export const SOLUTION_ARTICLES_QUERY = `
query questionTopicsList(
  $questionSlug: String!
  $skip: Int
  $first: Int
  $orderBy: SolutionArticleOrderBy
  $userInput: String
  $tagSlugs: [String!]
) {
  questionSolutionArticles(
    questionSlug: $questionSlug
    skip: $skip
    first: $first
    orderBy: $orderBy
    userInput: $userInput
    tagSlugs: $tagSlugs
  ) {
    totalNum
    edges {
      node {
        slug
        canSee
        topic {
          id
        }
        videosInfo {
          coverUrl
        }
      }
    }
  }
}`;
