/**
 * GraphQL query for fetching a solution article's detail on LeetCode CN
 */
export const SOLUTION_ARTICLE_DETAIL_QUERY = `
query discussTopic($slug: String) {
  solutionArticle(slug: $slug, orderBy: DEFAULT) {
    ipRegion
    rewardEnabled
    canEditReward
    uuid
    title
    content
    slateValue
    slug
    sunk
    chargeType
    status
    identifier
    canEdit
    canSee
    reactionType
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
      isDiscussAdmin
      isDiscussStaff
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
      subscribed
      commentCount
      viewCount
      post {
        id
        status
        voteStatus
        isOwnPost
      }
    }
    byLeetcode
    isMyFavorite
    isMostPopular
    favoriteCount
    isEditorsPick
    hitCount
    videosInfo {
      videoId
      coverUrl
      duration
    }
    question {
      titleSlug
      questionFrontendId
    }
    next {
      slug
      title
    }
    prev {
      slug
      title
    }
  }
}`;
