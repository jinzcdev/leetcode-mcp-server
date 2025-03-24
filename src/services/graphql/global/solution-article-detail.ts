/**
 * GraphQL query for fetching a solution article's detail on LeetCode Global
 */
export const SOLUTION_ARTICLE_DETAIL_QUERY = `
query ugcArticleSolutionArticle($articleId: ID, $topicId: ID) {
  ugcArticleSolutionArticle(articleId: $articleId, topicId: $topicId) {
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
    content
    isSerialized
    isAuthorArticleReviewer
    scoreInfo {
      scoreCoefficient
    }
    prev {
      uuid
      slug
      topicId
      title
    }
    next {
      uuid
      slug
      topicId
      title
    }
  }
}`;
