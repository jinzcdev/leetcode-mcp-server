/**
 * GraphQL query for fetching a solution's detail on LeetCode CN
 */
export const SOLUTION_ARTICLE_DETAIL_QUERY = `
query discussTopic($slug: String) {
  solutionArticle(slug: $slug, orderBy: DEFAULT) {
    title
    content
    slug
    tags {
      slug
    }
    topic {
      id
    }
    question {
      titleSlug
    }
    next {
      slug
    }
    prev {
      slug
    }
  }
}`;
