import { Credential, LeetCode } from "leetcode-query";
import logger from "../utils/logger.js";
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
        return await this.leetCodeApi.submission(id);
    }

    async fetchUserStatus(): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error("Authentication required to fetch user status");
        }
        return await this.leetCodeApi.whoami().then((res) => {
            return {
                isSignedIn: res?.isSignedIn ?? false,
                username: res?.username ?? "",
                avatar: res?.avatar ?? "",
                isAdmin: res?.isAdmin ?? false
            };
        });
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
        const submissions = await this.leetCodeApi.submissions({
            offset: options.offset ?? 0,
            limit: options.limit ?? 20,
            slug: options.questionSlug
        });
        return { submissions };
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
        return await this.leetCodeApi.recent_submissions(username, limit);
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
    }

    async fetchUserProfile(username: string): Promise<any> {
        const profile = await this.leetCodeApi.user(username);
        return profile;
    }

    async fetchUserContestRanking(
        username: string,
        attended: boolean = true
    ): Promise<any> {
        const contestInfo = await this.leetCodeApi.user_contest_info(username);
        if (contestInfo.userContestRankingHistory && attended) {
            contestInfo.userContestRankingHistory =
                contestInfo.userContestRankingHistory.filter((contest: any) => {
                    return contest && contest.attended;
                });
        }
        return contestInfo;
    }

    async fetchDailyChallenge(): Promise<any> {
        const dailyChallenge = await this.leetCodeApi.daily();
        return dailyChallenge;
    }

    async fetchProblem(titleSlug: string): Promise<any> {
        const problem = await this.leetCodeApi.problem(titleSlug);
        return problem;
    }

    async fetchProblemSimplified(titleSlug: string): Promise<any> {
        const problem = await this.fetchProblem(titleSlug);
        if (!problem) {
            throw new Error(`Problem ${titleSlug} not found`);
        }

        const filteredTopicTags =
            problem.topicTags?.map((tag: any) => tag.slug) || [];

        const filteredCodeSnippets =
            problem.codeSnippets?.filter((snippet: any) =>
                ["cpp", "python3", "java"].includes(snippet.langSlug)
            ) || [];

        let parsedSimilarQuestions: any[] = [];
        if (problem.similarQuestions) {
            try {
                const allQuestions = JSON.parse(problem.similarQuestions);
                parsedSimilarQuestions = allQuestions
                    .slice(0, 3)
                    .map((q: any) => ({
                        titleSlug: q.titleSlug,
                        difficulty: q.difficulty
                    }));
            } catch (e) {
                logger.error("Error parsing similarQuestions:", {
                    error: e
                });
            }
        }

        return {
            titleSlug,
            questionId: problem.questionId,
            title: problem.title,
            content: problem.content,
            difficulty: problem.difficulty,
            topicTags: filteredTopicTags,
            codeSnippets: filteredCodeSnippets,
            exampleTestcases: problem.exampleTestcases,
            hints: problem.hints,
            similarQuestions: parsedSimilarQuestions
        };
    }

    async searchProblems(
        category?: string,
        tags?: string[],
        difficulty?: string,
        limit: number = 10,
        offset: number = 0,
        searchKeywords?: string
    ): Promise<any> {
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

        const filters = {
            skip: options?.offset || 0,
            limit: options?.limit || 20,
            questionStatus: options?.questionStatus as any,
            difficulty: options?.difficulty as any[]
        };

        return await this.leetCodeApi.user_progress_questions(filters);
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
                            .filter((node: any) => node && node.canSee) || []
                };

                return data;
            });
    }

    /**
     * Retrieves detailed information about a specific solution on LeetCode Global.
     *
     * @param topicId - The topic ID of the solution
     * @returns Promise resolving to the solution detail data
     */
    async fetchSolutionArticleDetail(topicId: string): Promise<any> {
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
