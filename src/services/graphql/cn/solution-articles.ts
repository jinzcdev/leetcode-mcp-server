/**
 * GraphQL query for fetching solution articles for a problem on LeetCode CN
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
        rewardEnabled
        canEditReward
        uuid
        title
        slug
        sunk
        chargeType
        status
        identifier
        canEdit
        canSee
        reactionType
        hasVideo
        favoriteCount
        upvoteCount
        reactionsV2 {
          count
          reactionType
        }
        tags {
          name
          nameTranslated
          slug
          tagType
        }
        createdAt
        thumbnail
        author {
          username
          certificationLevel
          profile {
            userAvatar
            userSlug
            realName
            reputation
          }
        }
        summary
        topic {
          id
          commentCount
          viewCount
          pinned
        }
        byLeetcode
        isMyFavorite
        isMostPopular
        isEditorsPick
        hitCount
        videosInfo {
          videoId
          coverUrl
          duration
        }
      }
    }
  }
}`;
