import { Credential, LeetCodeCN } from "leetcode-query";
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
        limit: number = 50,
        skip: number = 0
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
                offset: skip
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
