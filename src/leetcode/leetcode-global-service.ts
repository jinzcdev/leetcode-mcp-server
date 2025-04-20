import { Credential, LeetCode } from "leetcode-query";
import { SEARCH_PROBLEMS_QUERY } from "./graphql/global/search-problems.js";
import { SOLUTION_ARTICLE_DETAIL_QUERY } from "./graphql/global/solution-article-detail.js";
import { SOLUTION_ARTICLES_QUERY } from "./graphql/global/solution-articles.js";
import { LeetCodeBaseService } from "./leetcode-base-service.js";

/**
 * LeetCode Global API Service Implementation
 *
 * This class provides methods to interact with the LeetCode Global API
 */
export class LeetCodeGlobalService implements LeetCodeBaseService {
    private readonly leetCodeApi: LeetCode;
    private readonly credential: Credential;

    constructor(leetCodeApi: LeetCode, credential: Credential) {
        this.leetCodeApi = leetCodeApi;
        this.credential = credential;
    }

    async fetchUserSubmissionDetail(id: number): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error(
                "Authentication required to fetch user submission detail"
            );
        }
        try {
            return await this.leetCodeApi.submission(id);
        } catch (error) {
            console.error(
                `Error fetching submission detail for id ${id}:`,
                error
            );
            throw error;
        }
    }

    async fetchUserStatus(): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error("Authentication required to fetch user status");
        }
        try {
            return await this.leetCodeApi.whoami();
        } catch (error) {
            console.error(`Error fetching user status:`, error);
            throw error;
        }
    }

    async fetchUserAllSubmissions(options: {
        offset: number;
        limit: number;
        questionSlug?: string;
        lastKey?: string;
        lang?: string;
        status?: string;
    }): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error(
                "Authentication required to fetch user submissions"
            );
        }
        try {
            const submissions = await this.leetCodeApi.submissions({
                offset: options.offset ?? 0,
                limit: options.limit ?? 20,
                slug: options.questionSlug
            });
            return { submissions };
        } catch (error) {
            console.error(`Error fetching user submissions:`, error);
            throw error;
        }
    }

    /**
     * 获取用户最近的提交记录
     * @param username
     * @param limit
     * @returns
     */
    async fetchUserRecentSubmissions(
        username: string,
        limit?: number
    ): Promise<any> {
        try {
            return await this.leetCodeApi.recent_submissions(username, limit);
        } catch (error) {
            console.error(
                `Error fetching recent submissions for ${username}:`,
                error
            );
            throw error;
        }
    }

    /**
     * 获取用户最近 AC 的提交记录
     * @param username
     * @param limit
     * @returns
     */
    async fetchUserRecentACSubmissions(
        username: string,
        limit?: number
    ): Promise<any> {
        try {
            return await this.leetCodeApi.graphql({
                query: `
                        query ($username: String!, $limit: Int) {
                            recentAcSubmissionList(username: $username, limit: $limit) {
                                id
                                title
                                titleSlug
                                time
                                timestamp
                                statusDisplay
                                lang
                            }
                        }

                    `,
                variables: {
                    username,
                    limit
                }
            });
        } catch (error) {
            console.error(
                `Error fetching recent submissions for ${username}:`,
                error
            );
            throw error;
        }
    }

    async fetchUserProfile(username: string): Promise<any> {
        try {
            const profile = await this.leetCodeApi.user(username);
            return profile;
        } catch (error) {
            console.error(
                `Error fetching user profile for ${username}:`,
                error
            );
            throw error;
        }
    }

    async fetchUserContestRanking(
        username: string,
        attended: boolean = true
    ): Promise<any> {
        try {
            const contestInfo =
                await this.leetCodeApi.user_contest_info(username);
            if (contestInfo.userContestRankingHistory && attended) {
                contestInfo.userContestRankingHistory =
                    contestInfo.userContestRankingHistory.filter(
                        (contest: any) => {
                            return contest && contest.attended;
                        }
                    );
            }
            return contestInfo;
        } catch (error) {
            console.error(
                `Error fetching user contest ranking for ${username}:`,
                error
            );
            throw error;
        }
    }

    async fetchDailyChallenge(): Promise<any> {
        try {
            const dailyChallenge = await this.leetCodeApi.daily();
            return dailyChallenge;
        } catch (error) {
            console.error("Error fetching daily challenge:", error);
            throw error;
        }
    }

    async fetchProblem(titleSlug: string): Promise<any> {
        try {
            const problem = await this.leetCodeApi.problem(titleSlug);
            return problem;
        } catch (error) {
            console.error(`Error fetching problem ${titleSlug}:`, error);
            throw error;
        }
    }

    async searchProblems(
        category?: string,
        tags?: string[],
        difficulty?: string,
        limit: number = 10,
        offset: number = 0,
        searchKeywords?: string
    ): Promise<any> {
        try {
            const filters: any = {};
            if (difficulty) {
                filters.difficulty = difficulty.toUpperCase();
            }
            if (tags && tags.length > 0) {
                filters.tags = tags;
            }
            if (searchKeywords) {
                filters.searchKeywords = searchKeywords;
            }

            const response = await this.leetCodeApi.graphql({
                query: SEARCH_PROBLEMS_QUERY,
                variables: {
                    categorySlug: category,
                    limit,
                    skip: offset,
                    filters
                }
            });

            return response.data?.problemsetQuestionList;
        } catch (error) {
            console.error("Error searching problems:", error);
            throw error;
        }
    }

    async fetchUserProgressQuestionList(options?: {
        offset?: number;
        limit?: number;
        questionStatus?: string;
        difficulty?: string[];
    }): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error(
                "Authentication required to fetch user progress question list"
            );
        }
        try {
            const filters = {
                skip: options?.offset || 0,
                limit: options?.limit || 20,
                questionStatus: options?.questionStatus as any,
                difficulty: options?.difficulty as any[]
            };

            return await this.leetCodeApi.user_progress_questions(filters);
        } catch (error) {
            console.error("Error fetching user progress question list:", error);
            throw error;
        }
    }

    /**
     * Retrieves a list of solutions for a specific problem.
     *
     * @param questionSlug - The URL slug/identifier of the problem
     * @param options - Optional parameters for filtering and sorting the solutions
     * @returns Promise resolving to the solutions list data
     */
    async fetchQuestionSolutionArticles(
        questionSlug: string,
        options?: any
    ): Promise<any> {
        try {
            const variables: any = {
                questionSlug,
                first: options?.limit || 5,
                skip: options?.skip || 0,
                orderBy: options?.orderBy || "HOT",
                userInput: options?.userInput,
                tagSlugs: options?.tagSlugs ?? []
            };

            return await this.leetCodeApi
                .graphql({
                    query: SOLUTION_ARTICLES_QUERY,
                    variables
                })
                .then((res) => {
                    const ugcArticleSolutionArticles =
                        res.data?.ugcArticleSolutionArticles;
                    if (!ugcArticleSolutionArticles) {
                        return {
                            totalNum: 0,
                            hasNextPage: false,
                            articles: []
                        };
                    }
                    const data = {
                        totalNum: ugcArticleSolutionArticles?.totalNum || 0,
                        hasNextPage:
                            ugcArticleSolutionArticles?.pageInfo?.hasNextPage ||
                            false,
                        articles:
                            ugcArticleSolutionArticles?.edges
                                ?.map((edge: any) => {
                                    if (
                                        edge?.node &&
                                        edge.node.topicId &&
                                        edge.node.slug
                                    ) {
                                        edge.node.articleUrl = `https://leetcode.com/problems/${questionSlug}/solutions/${edge.node.topicId}/${edge.node.slug}`;
                                    }
                                    return edge.node;
                                })
                                .filter((node: any) => node && node.canSee) ||
                            []
                    };

                    return data;
                });
        } catch (error) {
            console.error(
                `Error fetching solutions for ${questionSlug}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Retrieves detailed information about a specific solution on LeetCode Global.
     *
     * @param topicId - The topic ID of the solution
     * @returns Promise resolving to the solution detail data
     */
    async fetchSolutionArticleDetail(topicId: string): Promise<any> {
        try {
            return await this.leetCodeApi
                .graphql({
                    query: SOLUTION_ARTICLE_DETAIL_QUERY,
                    variables: {
                        topicId
                    }
                })
                .then((response) => {
                    return response.data?.ugcArticleSolutionArticle;
                });
        } catch (error) {
            console.error(
                `Error fetching solution detail for topic ${topicId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Note feature is not supported in LeetCode Global.
     * This method is implemented to satisfy the interface but will always throw an error.
     *
     * @param options - Query parameters (not used)
     * @throws Error indicating the feature is not supported on Global platform
     */
    async fetchUserNotes(options: {
        aggregateType: string;
        keyword?: string;
        orderBy?: string;
        limit?: number;
        skip?: number;
    }): Promise<any> {
        throw new Error("Notes feature is not supported in LeetCode Global");
    }

    /**
     * Note feature is not supported in LeetCode Global.
     * This method is implemented to satisfy the interface but will always throw an error.
     *
     * @param questionId - The question ID (not used)
     * @param limit - Maximum number of notes (not used)
     * @param skip - Pagination offset (not used)
     * @throws Error indicating the feature is not supported on Global platform
     */
    async fetchNotesByQuestionId(
        questionId: string,
        limit?: number,
        skip?: number
    ): Promise<any> {
        throw new Error("Notes feature is not supported in LeetCode Global");
    }

    /**
     * Note feature is not supported in LeetCode Global.
     * This method is implemented to satisfy the interface but will always throw an error.
     */
    async createUserNote(
        content: string,
        noteType: string,
        targetId: string,
        summary: string
    ): Promise<any> {
        throw new Error("Notes feature is not supported in LeetCode Global");
    }

    /**
     * Note feature is not supported in LeetCode Global.
     * This method is implemented to satisfy the interface but will always throw an error.
     */
    async updateUserNote(
        noteId: string,
        content: string,
        summary: string
    ): Promise<any> {
        throw new Error("Notes feature is not supported in LeetCode Global");
    }

    isAuthenticated(): boolean {
        return (
            !!this.credential &&
            !!this.credential.csrf &&
            !!this.credential.session
        );
    }

    isCN(): boolean {
        return false;
    }
}
