import { Credential, LeetCode, LeetCodeCN } from "leetcode-query";
import { LeetCodeBaseService } from "./leetcode-base-service.js";
import { LeetCodeCNService } from "./leetcode-cn-service.js";
import { LeetCodeGlobalService } from "./leetcode-global-service.js";

/**
 * Factory class for creating LeetCode service instances based on the specified site.
 * This factory handles the creation of either Global or China LeetCode service implementations
 * and manages authentication credentials when provided.
 */
export class LeetCodeServiceFactory {
    /**
     * Creates and configures a LeetCode service instance based on the specified site and optional session credentials.
     *
     * @param site - The LeetCode API site to use: 'global' for international LeetCode or 'cn' for LeetCode China
     * @param sessionCookie - Optional session cookie string for authenticated API access
     * @returns A promise that resolves to a configured LeetCodeBaseService implementation
     */
    static async createService(
        site: string,
        sessionCookie?: string
    ): Promise<LeetCodeBaseService> {
        // Create authentication credential if session cookie is provided
        const credential: Credential = new Credential();
        if (sessionCookie) {
            await credential.init(sessionCookie);
        }

        // Create and return the appropriate service based on the specified site
        if (site.toLowerCase() === "cn") {
            return new LeetCodeCNService(
                new LeetCodeCN(credential),
                credential
            );
        } else {
            return new LeetCodeGlobalService(
                new LeetCode(credential),
                credential
            );
        }
    }
}
