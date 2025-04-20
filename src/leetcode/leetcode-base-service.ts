/**
 * Base interface for LeetCode API service implementations.
 * Defines the common methods that all LeetCode service implementations must provide,
 * regardless of whether they're for the Global or China version of LeetCode.
 */
export interface LeetCodeBaseService {
    /**
     * Retrieves a user's profile information including stats, badges, and contributions.
     *
     * @param username - The LeetCode username to fetch profile data for
     * @returns Promise resolving to the user's profile data
     */
    fetchUserProfile(username: string): Promise<any>;

    /**
     * Retrieves the authenticated user's status information.
     * Includes login status, subscription details, and user identification information.
     *
     * @returns Promise resolving to the user's status information
     * @throws Error if not authenticated
     */
    fetchUserStatus(): Promise<any>;

    /**
     * Retrieves the authenticated user's submission history with various filtering options.
     *
     * @param options - Query parameters for filtering submissions
     * @param options.offset - Number of submissions to skip (required for pagination)
     * @param options.limit - Maximum number of submissions to return (required)
     * @param options.questionSlug - Optional filter for problem slug/identifier
     * @param options.lastKey - Optional pagination token for subsequent requests
     * @param options.lang - Optional filter for programming language
     * @param options.status - Optional filter for submission status
     * @returns Promise resolving to the filtered submission data
     * @throws Error if not authenticated
     */
    fetchUserAllSubmissions(options: {
        offset: number;
        limit: number;
        questionSlug?: string;
        lastKey?: string;
        lang?: string | null;
        status?: string | null;
    }): Promise<any>;

    /**
     * Retrieves the authenticated user's progress on problems with filtering options.
     *
     * @param filters - Query parameters for filtering problems
     * @param filters.offset - Number of problems to skip (for pagination)
     * @param filters.limit - Maximum number of problems to return
     * @param filters.questionStatus - Optional filter for problem status (e.g., "ATTEMPTED", "SOLVED")
     * @param filters.difficulty - Optional array of difficulty levels to filter by
     * @returns Promise resolving to the user's progress data
     * @throws Error if not authenticated
     */
    fetchUserProgressQuestionList(filters: {
        offset: number;
        limit: number;
        questionStatus?: string;
        difficulty?: string[];
    }): Promise<any>;

    /**
     * Retrieves a user's recent submissions (both accepted and failed).
     * Note: This may not be available on all LeetCode versions.
     *
     * @param username - LeetCode username to fetch submissions for
     * @param limit - Optional maximum number of submissions to return
     * @returns Promise resolving to the recent submissions data
     */
    fetchUserRecentSubmissions(username: string, limit?: number): Promise<any>;

    /**
     * Retrieves a user's recent accepted (AC) submissions only.
     *
     * @param username - LeetCode username to fetch accepted submissions for
     * @param limit - Optional maximum number of submissions to return
     * @returns Promise resolving to the recent accepted submissions data
     */
    fetchUserRecentACSubmissions(
        username: string,
        limit?: number
    ): Promise<any>;

    /**
     * Retrieves detailed information about a specific submission.
     * Includes source code, runtime statistics, and test results.
     *
     * @param id - Numeric submission ID
     * @returns Promise resolving to the submission details
     * @throws Error if not authenticated or submission not found
     */
    fetchUserSubmissionDetail(id: number): Promise<any>;

    /**
     * Retrieves a user's contest ranking information and participation history.
     *
     * @param username - LeetCode username to fetch contest data for
     * @param attended - Whether to include only contests the user participated in
     * @returns Promise resolving to the contest ranking data
     */
    fetchUserContestRanking(username: string, attended: boolean): Promise<any>;

    /**
     * Retrieves today's LeetCode Daily Challenge problem.
     *
     * @returns Promise resolving to the daily challenge problem data
     */
    fetchDailyChallenge(): Promise<any>;

    /**
     * Retrieves detailed information about a specific problem.
     *
     * @param titleSlug - Problem identifier/slug as used in the LeetCode URL
     * @returns Promise resolving to the problem details
     */
    fetchProblem(titleSlug: string): Promise<any>;

    /**
     * Searches for problems matching specified criteria.
     *
     * @param category - Optional problem category filter (e.g., "algorithms", "database", "shell")
     * @param tags - Optional array of topic tags to filter by
     * @param difficulty - Optional difficulty level filter
     * @param limit - Optional maximum number of problems to return
     * @param offset - Optional number of problems to skip (for pagination)
     * @param searchKeywords - Optional search keywords to filter problems by title or description
     * @returns Promise resolving to matching problems data
     */
    searchProblems(
        category?: string,
        tags?: string[],
        difficulty?: string,
        limit?: number,
        offset?: number,
        searchKeywords?: string
    ): Promise<any>;

    /**
     * Determines if the current service has valid authentication credentials.
     *
     * @returns True if authenticated, false otherwise
     */
    isAuthenticated(): boolean;

    /**
     * Determines if the current service is for the China version of LeetCode.
     *
     * @returns True for LeetCode CN, false for LeetCode Global
     */
    isCN(): boolean;

    /**
     * Retrieves a list of solutions for a specific problem.
     *
     * @param questionSlug - The URL slug/identifier of the problem
     * @param options - Optional parameters for filtering and sorting the solutions
     * @returns Promise resolving to the solutions list data
     */
    fetchQuestionSolutionArticles(
        questionSlug: string,
        options?: any
    ): Promise<any>;

    /**
     * Retrieves detailed information about a specific solution.
     *
     * @param identifier - The identifier of the solution (topicId for Global, slug for CN)
     * @returns Promise resolving to the solution detail data
     */
    fetchSolutionArticleDetail(identifier: string): Promise<any>;

    /**
     * Retrieves user notes from LeetCode with filtering and pagination options.
     * Note: This feature is only available on LeetCode CN.
     *
     * @param options - Query parameters for filtering notes
     * @param options.aggregateType - Type of notes to aggregate (e.g., "QUESTION_NOTE")
     * @param options.keyword - Optional search term to filter notes
     * @param options.orderBy - Optional sorting criteria for notes
     * @param options.limit - Maximum number of notes to return
     * @param options.skip - Number of notes to skip (for pagination)
     * @returns Promise resolving to the filtered notes data
     * @throws Error if not implemented or feature not supported
     */
    fetchUserNotes(options: {
        aggregateType: string;
        keyword?: string;
        orderBy?: string;
        limit?: number;
        skip?: number;
    }): Promise<any>;

    /**
     * Retrieves user notes for a specific question ID.
     * Note: This feature is only available on LeetCode CN.
     *
     * @param questionId - The question ID to fetch notes for
     * @param limit - Maximum number of notes to return
     * @param skip - Number of notes to skip (for pagination)
     * @returns Promise resolving to the notes data for the specified question
     * @throws Error if not implemented or feature not supported
     */
    fetchNotesByQuestionId(
        questionId: string,
        limit?: number,
        skip?: number
    ): Promise<any>;
}
