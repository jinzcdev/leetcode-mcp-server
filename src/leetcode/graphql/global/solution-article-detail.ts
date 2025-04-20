/**
 * GraphQL query for fetching a solution's detail on LeetCode Global
 */
export const SOLUTION_ARTICLE_DETAIL_QUERY = `
query ugcArticleSolutionArticle($articleId: ID, $topicId: ID) {
  ugcArticleSolutionArticle(articleId: $articleId, topicId: $topicId) {
    title
    slug
    content
    tags {
      slug
    }
    topic {
      id
    }
    prev {
      uuid
      slug
      topicId
      title
    }
    next {
      slug
      topicId
    }
  }
}`;
