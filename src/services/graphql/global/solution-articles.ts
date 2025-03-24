/**
 * GraphQL query for fetching solution articles for a problem on LeetCode Global
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
        uuid
        title
        slug
        summary
        author {
          realName
          userAvatar
          userSlug
          userName
          nameColor
          certificationLevel
          activeBadge {
            icon
            displayName
          }
        }
        articleType
        thumbnail
        summary
        createdAt
        updatedAt
        status
        isLeetcode
        canSee
        canEdit
        isMyFavorite
        chargeType
        myReactionType
        topicId
        hitCount
        hasVideoArticle
        reactions {
          count
          reactionType
        }
        title
        slug
        tags {
          name
          slug
          tagType
        }
        topic {
          id
          topLevelCommentCount
        }
      }
    }
  }
}`;
