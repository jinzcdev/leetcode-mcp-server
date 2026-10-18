/**
 * Minimal GraphQL execution contract shared by the API helper modules.
 *
 * Both `LeetCode` and `LeetCodeCN` from leetcode-query expose a `graphql`
 * method with this shape; it sends the session cookie and CSRF token, so the
 * helpers only need to build documents and interpret responses.
 */

/**
 * A GraphQL request as accepted by leetcode-query's `graphql` method.
 */
export interface GraphQLRequest {
    query: string;
    variables?: Record<string, unknown>;
}

/**
 * Executes a GraphQL request and resolves to the raw response body
 * (`{ data, errors? }`).
 */
export type GraphQLExecutor = (request: GraphQLRequest) => Promise<any>;

/**
 * Extracts `data` from a GraphQL response, throwing when the response carries
 * GraphQL errors. LeetCode answers HTTP 200 even for failed operations, so the
 * `errors` array must be checked explicitly.
 *
 * @param response - Raw GraphQL response body
 * @param context - Operation name used in the error message
 * @returns The `data` object of the response (empty object when absent)
 * @throws Error when the response contains GraphQL errors
 */
export function unwrapGraphQL(response: any, context: string): any {
    const errors = response?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
        const messages = errors
            .map((error: any) =>
                typeof error?.message === "string"
                    ? error.message
                    : JSON.stringify(error)
            )
            .join("; ");
        throw new Error(`${context}: ${messages}`);
    }
    return response?.data ?? {};
}
