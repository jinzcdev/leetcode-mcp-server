import { Credential, LeetCodeCN } from "leetcode-query";
import {
    NOTE_AGGREGATE_QUERY,
    NOTE_BY_QUESTION_ID_QUERY
} from "./graphql/cn/note-queries.js";
import { SEARCH_PROBLEMS_QUERY } from "./graphql/cn/search-problems.js";
import { SOLUTION_ARTICLE_DETAIL_QUERY } from "./graphql/cn/solution-article-detail.js";
import { SOLUTION_ARTICLES_QUERY } from "./graphql/cn/solution-articles.js";
import { LeetCodeBaseService } from "./leetcode-base-service.js";

/**
 * LeetCode CN API Service Implementation
 *
 * This class provides methods to interact with the LeetCode CN API
 */
export class LeetCodeCNService implements LeetCodeBaseService {
    private readonly leetCodeApi: LeetCodeCN;
    private readonly credential: Credential;

    constructor(leetCodeApi: LeetCodeCN, credential: Credential) {
        this.leetCodeApi = leetCodeApi;
        this.credential = credential;
    }

    async fetchUserSubmissionDetail(id: number): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error(
                "Authentication required to fetch submission details"
            );
        }
        try {
            return await this.leetCodeApi.submissionDetail(id.toString());
        } catch (error) {
            console.error(
                `Error fetching submission detail for ID ${id}:`,
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
            return await this.leetCodeApi.userStatus();
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
            return await this.leetCodeApi.graphql({
                variables: {
                    limit: options.limit,
                    offset: options.offset,
                    questionSlug: options.questionSlug,
                    lang: options.lang,
                    status: options.status
                },
                query: `
                query submissionList(
                    $offset: Int!
                    $limit: Int!
                    $lastKey: String
                    $questionSlug: String
                    $lang: String
                    $status: SubmissionStatusEnum
                ) {
                    submissionList(
                        offset: $offset
                        limit: $limit
                        lastKey: $lastKey
                        questionSlug: $questionSlug
                        lang: $lang
                        status: $status
                    ) {
                        lastKey
                        hasNext
                        submissions {
                            id
                            title
                            status
                            statusDisplay
                            lang
                            langName: langVerboseName
                            runtime
                            timestamp
                            url
                            isPending
                            memory
                            frontendId
                            submissionComment {
                                comment
                                flagType
                            }
                        }
                    }
                }`
            });
        } catch (error) {
            console.error(`Error fetching all user's submissions:`, error);
            throw error;
        }
    }

    async fetchUserRecentSubmissions(
        username: string,
        limit?: number
    ): Promise<any> {
        throw new Error(
            "fetchUserRecentSubmissions is not supported in LeetCode CN"
        );
    }

    /**
     * 中国版 LeetCode API 仅支持获取最近 AC 的提交记录
     * @param username
     * @param limit
     * @returns
     */
    async fetchUserRecentACSubmissions(
        username: string,
        limit?: number
    ): Promise<any> {
        try {
            return await this.leetCodeApi.recent_submissions(username);
        } catch (error) {
            console.error(
                `Error fetching recent AC submissions for ${username}:`,
                error
            );
            throw error;
        }
    }

    async fetchUserProfile(username: string): Promise<any> {
        try {
            return await this.leetCodeApi.user(username);
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
            return await this.leetCodeApi.daily();
        } catch (error) {
            console.error("Error fetching daily challenge:", error);
            throw error;
        }
    }

    async fetchProblem(titleSlug: string): Promise<any> {
        try {
            return await this.leetCodeApi.problem(titleSlug);
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
     * Retrieves a list of solutions for a specific problem on LeetCode CN.
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
                orderBy: options?.orderBy || "DEFAULT",
                userInput: options?.userInput,
                tagSlugs: options?.tagSlugs ?? []
            };

            return await this.leetCodeApi
                .graphql({
                    query: SOLUTION_ARTICLES_QUERY,
                    variables
                })
                .then((res) => {
                    const questionSolutionArticles =
                        res.data?.questionSolutionArticles;
                    if (!questionSolutionArticles) {
                        return {
                            totalNum: 0,
                            hasNextPage: false,
                            articles: []
                        };
                    }
                    const data = {
                        totalNum: questionSolutionArticles?.totalNum || 0,
                        hasNextPage:
                            questionSolutionArticles?.pageInfo?.hasNextPage ||
                            false,
                        articles:
                            questionSolutionArticles?.edges
                                ?.map((edge: any) => {
                                    if (
                                        edge?.node &&
                                        edge.node.topic?.id &&
                                        edge.node.slug
                                    ) {
                                        edge.node.articleUrl = `https://leetcode.cn/problems/${questionSlug}/solutions/${edge.node.topic.id}/${edge.node.slug}`;
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
     * Retrieves detailed information about a specific solution on LeetCode CN.
     *
     * @param slug - The slug of the solution
     * @returns Promise resolving to the solution detail data
     */
    async fetchSolutionArticleDetail(slug: string): Promise<any> {
        try {
            return await this.leetCodeApi
                .graphql({
                    query: SOLUTION_ARTICLE_DETAIL_QUERY,
                    variables: {
                        slug
                    }
                })
                .then((res) => {
                    return res.data?.solutionArticle;
                });
        } catch (error) {
            console.error(
                `Error fetching solution detail for slug ${slug}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Retrieves user notes from LeetCode CN with filtering and pagination options.
     * Available only on LeetCode CN platform.
     *
     * @param options - Query parameters for filtering notes
     * @param options.aggregateType - Type of notes to aggregate (e.g., "QUESTION_NOTE")
     * @param options.keyword - Optional search term to filter notes
     * @param options.orderBy - Optional sorting criteria for notes
     * @param options.limit - Maximum number of notes to return
     * @param options.skip - Number of notes to skip (for pagination)
     * @returns Promise resolving to the filtered notes data
     */
    async fetchUserNotes(options: {
        aggregateType: string;
        keyword?: string;
        orderBy?: string;
        limit?: number;
        skip?: number;
    }): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error("Authentication required to fetch user notes");
        }

        try {
            const variables = {
                aggregateType: options.aggregateType,
                keyword: options.keyword,
                orderBy: options.orderBy || "DESCENDING",
                limit: options.limit || 20,
                skip: options.skip || 0
            };

            return await this.leetCodeApi
                .graphql({
                    query: NOTE_AGGREGATE_QUERY,
                    variables
                })
                .then((response) => {
                    return (
                        response.data?.noteAggregateNote || {
                            count: 0,
                            userNotes: []
                        }
                    );
                });
        } catch (error) {
            console.error(`Error fetching user notes:`, error);
            throw error;
        }
    }

    /**
     * Retrieves user notes for a specific question ID.
     * Available only on LeetCode CN platform.
     *
     * @param questionId - The question ID to fetch notes for
     * @param limit - Maximum number of notes to return (default: 20)
     * @param skip - Number of notes to skip (default: 0)
     * @returns Promise resolving to the notes data for the specified question
     */
    async fetchNotesByQuestionId(
        questionId: string,
        limit: number = 20,
        skip: number = 0
    ): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error(
                "Authentication required to fetch notes by question ID"
            );
        }

        try {
            const variables = {
                noteType: "COMMON_QUESTION",
                questionId: questionId,
                limit,
                skip
            };

            return await this.leetCodeApi
                .graphql({
                    query: NOTE_BY_QUESTION_ID_QUERY,
                    variables
                })
                .then((response) => {
                    return (
                        response.data?.noteOneTargetCommonNote || {
                            count: 0,
                            userNotes: []
                        }
                    );
                });
        } catch (error) {
            console.error(
                `Error fetching notes for question ${questionId}:`,
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
        return true;
    }
}
