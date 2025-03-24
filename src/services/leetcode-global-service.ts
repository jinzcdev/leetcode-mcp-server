import { Credential, LeetCode } from "leetcode-query";
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
        limit: number = 50,
        offset: number = 0
    ): Promise<any> {
        const filters: any = {};
        if (difficulty) {
            filters.difficulty = difficulty.toUpperCase();
        }
        if (tags && tags.length > 0) {
            filters.tags = tags;
        }

        try {
            const problems = await this.leetCodeApi.problems({
                category,
                filters,
                limit,
                offset
            });
            return problems;
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
     * Retrieves a list of solution articles for a specific problem.
     *
     * @param questionSlug - The URL slug/identifier of the problem
     * @param options - Optional parameters for filtering and sorting the solution articles
     * @returns Promise resolving to the solution articles list data
     */
    async fetchQuestionSolutionArticles(
        questionSlug: string,
        options?: any
    ): Promise<any> {
        try {
            const variables: any = {
                questionSlug,
                first: options?.limit || 20,
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
                .then((response) => {
                    return response.data?.ugcArticleSolutionArticles;
                });
        } catch (error) {
            console.error(
                `Error fetching solution articles for ${questionSlug}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Retrieves detailed information about a specific solution article on LeetCode Global.
     *
     * @param topicId - The topic ID of the solution article
     * @returns Promise resolving to the solution article detail data
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
                `Error fetching solution article detail for topic ${topicId}:`,
                error
            );
            throw error;
        }
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
