import { Credential, LeetCodeCN } from "leetcode-query";
import logger from "../utils/logger.js";
import {
    NOTE_AGGREGATE_QUERY,
    NOTE_BY_QUESTION_ID_QUERY,
    NOTE_CREATE_MUTATION,
    NOTE_UPDATE_MUTATION
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
        return await this.leetCodeApi.submissionDetail(id.toString());
    }

    async fetchUserStatus(): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error("Authentication required to fetch user status");
        }
        return await this.leetCodeApi.userStatus().then((res) => {
            return {
                isSignedIn: res?.isSignedIn ?? false,
                username: res?.username ?? "",
                avatar: res?.avatar ?? "",
                isAdmin: res?.isAdmin ?? false,
                useTranslation: res?.useTranslation ?? false
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
                        lang
                        runtime
                        url
                        memory
                        frontendId
                    }
                }
            }`
        });
    }

    async fetchUserRecentSubmissions(
        username: string,
        limit?: number
    ): Promise<any> {
        throw new Error(
            "fetchUserRecentSubmissions is not supported in LeetCode CN"
        );
    }

    async fetchUserRecentACSubmissions(
        username: string,
        limit?: number
    ): Promise<any> {
        return await this.leetCodeApi.recent_submissions(username);
    }

    async fetchUserProfile(username: string): Promise<any> {
        const originalProfile = await this.leetCodeApi.user(username);

        if (!originalProfile || !originalProfile.userProfilePublicProfile) {
            return originalProfile;
        }

        const publicProfile = originalProfile.userProfilePublicProfile || {};
        const userProfile = publicProfile.profile || {};
        const skillSet = userProfile.skillSet || {};

        const simplifiedProfile = {
            username: userProfile.userSlug,
            questionProgress: originalProfile.userProfileUserQuestionProgress,
            siteRanking: publicProfile.siteRanking,
            profile: {
                userSlug: userProfile.userSlug,
                realName: userProfile.realName,
                userAvatar: userProfile.userAvatar,
                globalLocation: userProfile.globalLocation,
                school: userProfile.school?.name,
                socialAccounts: (userProfile.socialAccounts || []).filter(
                    (account: any) => !!account.profileUrl
                ),
                skillSet: {
                    topics: (skillSet.topics || []).map(
                        (topic: any) => topic.slug
                    ),
                    topicAreaScores: (skillSet.topicAreaScores || []).map(
                        (item: any) => ({
                            slug: item.topicArea?.slug,
                            score: item.score
                        })
                    )
                }
            }
        };

        return simplifiedProfile;
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
        return await this.leetCodeApi.daily();
    }

    async fetchProblem(titleSlug: string): Promise<any> {
        return await this.leetCodeApi.problem(titleSlug);
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

        const { data } = await this.leetCodeApi.graphql({
            query: SEARCH_PROBLEMS_QUERY,
            variables: { categorySlug: category, limit, skip: offset, filters }
        });

        const questionList = data?.problemsetQuestionList;
        if (!questionList) {
            return { hasMore: false, total: 0, questions: [] };
        }

        return {
            hasMore: questionList.hasMore,
            total: questionList.total,
            questions: questionList.questions.map((q: any) => ({
                title: q.title,
                titleCn: q.titleCn,
                titleSlug: q.titleSlug,
                difficulty: q.difficulty,
                acRate: q.acRate,
                topicTags: q.topicTags.map((tag: any) => tag.slug)
            }))
        };
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
                            .filter((node: any) => node && node.canSee) || []
                };

                return data;
            });
    }

    /**
     * Retrieves detailed information about a specific solution on LeetCode CN.
     *
     * @param slug - The slug of the solution
     * @returns Promise resolving to the solution detail data
     */
    async fetchSolutionArticleDetail(slug: string): Promise<any> {
        const data = await this.leetCodeApi
            .graphql({
                query: SOLUTION_ARTICLE_DETAIL_QUERY,
                variables: {
                    slug
                }
            })
            .then((res) => {
                return res.data?.solutionArticle;
            });
        logger.info(data);
        return data;
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
    }

    /**
     * Creates a new note for a specific question on LeetCode CN.
     * Available only on LeetCode CN platform.
     *
     * @param content - The content of the note
     * @param noteType - The type of note (e.g., "COMMON_QUESTION")
     * @param targetId - The ID of the target (e.g., question ID)
     * @param summary - Optional summary of the note
     * @returns Promise resolving to the created note data
     */
    async createUserNote(
        content: string,
        noteType: string,
        targetId: string,
        summary: string
    ): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error("Authentication required to create notes");
        }

        const variables = {
            content,
            noteType,
            targetId,
            summary: summary || ""
        };

        return await this.leetCodeApi
            .graphql({
                query: NOTE_CREATE_MUTATION,
                variables
            })
            .then((response) => {
                return (
                    response.data?.noteCreateCommonNote || {
                        ok: false,
                        note: null
                    }
                );
            });
    }

    /**
     * Updates an existing note on LeetCode CN.
     * Available only on LeetCode CN platform.
     *
     * @param noteId - The ID of the note to update
     * @param content - The new content of the note
     * @param summary - Optional new summary of the note
     * @returns Promise resolving to the updated note data
     */
    async updateUserNote(
        noteId: string,
        content: string,
        summary: string
    ): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error("Authentication required to update notes");
        }

        const variables = {
            noteId,
            content,
            summary: summary || ""
        };

        return await this.leetCodeApi
            .graphql({
                query: NOTE_UPDATE_MUTATION,
                variables
            })
            .then((response) => {
                return (
                    response.data?.noteUpdateUserNote || {
                        ok: false,
                        note: null
                    }
                );
            });
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
