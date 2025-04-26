// tagged for gh commit 24 apr 25

// This file contains lower-level functions for interacting directly with the Threads API.
// Higher-level workflows (like the two-step publishing) might be composed in other files (e.g., threads.ts).

import { headers } from 'next/headers';

// Replace with your actual Threads User ID and API Base URL
// These could potentially come from configuration loaded elsewhere
const THREADS_USER_ID = "9412267978894822"; // Example User ID
const API_BASE_URL = 'https://graph.threads.net/v1.0';

/**
 * Fetches the Threads feed for the configured user.
 *
 * @param accountToken The authentication token for the Threads account.
 * @param filters An object containing filters (though the API docs provided don't detail filter params for feed beyond user ID).
 * @param page The page number for pagination (API docs don't detail pagination params for feed).
 * @returns A promise that resolves with the API response data.
 * @throws Error if the API call fails.
 */
export async function fetchThreadsFeed(accountToken: string, filters?: any, page?: number): Promise<any> {
    const endpoint = `${API_BASE_URL}/${THREADS_USER_ID}/threads`;
    const params: Record<string, string> = {
        access_token: accountToken,
        // TODO: Add pagination and filter params if the Threads API supports them for this endpoint and your requirements
        fields: 'id,text,timestamp,media_url,media_type,like_count,reply_count,is_carousel_item,carousel_parent_id,permalink,username', // Example fields, adjust as needed
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}?${queryString}`;

    console.log("Fetching Threads feed:", url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            // Assuming no special headers are needed beyond what fetch handles for GET with query params
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Error fetching threads feed:", response.status, errorBody);
            throw new Error(`Failed to fetch Threads feed: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log("Threads feed fetched successfully.", data);
        return data;
    } catch (error: any) {
        console.error("Exception when fetching Threads feed:", error);
        throw new Error(`Failed to fetch Threads feed: ${error.message}`);
    }
}

/**
 * Fetches replies for a specific Threads post.
 *
 * @param accountToken The authentication token for the Threads account.
 * @param postId The ID of the parent post to fetch replies for.
 * @returns A promise that resolves with the API response data.
 * @throws Error if the API call fails.
 */
export async function fetchThreadsReplies(accountToken: string, postId: string): Promise<any> {
    // The documentation implies fetching replies might be part of getting details for a specific media object
    // or perhaps a dedicated replies edge. Based on typical social media APIs and the provided docs,
    // getting a specific media object's details (which might include replies or a link to them) is common.
    // Let's assume an endpoint like /{threads-media-id}/replies or just expanding fields on the media ID.
    // The blueprint mentions GET /{threads_media_id}, so let's use that endpoint to fetch details which *might* include replies or related info.
    // If a specific /replies edge is needed based on full API docs, this would need adjustment.

    const endpoint = `${API_BASE_URL}/${postId}`; // Assuming postId is the threads_media_id
    const params: Record<string, string> = {
        access_token: accountToken,
        // TODO: Confirm the exact fields needed for replies. 'replies' or similar might be an expandable field.
        fields: 'id,text,timestamp,username,replies', // Example fields including a hypothetical 'replies' field
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}?${queryString}`;

    console.log("Fetching Threads replies for post:", postId, url);

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Error fetching threads replies:", response.status, errorBody);
            throw new Error(`Failed to fetch Threads replies: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log("Threads replies fetched successfully.", data);
        return data;
    } catch (error: any) {
        console.error("Exception when fetching Threads replies:", error);
        throw new Error(`Failed to fetch Threads replies: ${error.message}`);
    }
}

// Existing postToThreads function (kept for context, although createThreadsMediaContainer and publishThreadsContainer are the recommended flow)
export async function postToThreads(account: string, text: string) {
    const THREADS_ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN; // This should ideally come from the account parameter or a secure context
    if (!THREADS_ACCESS_TOKEN) {
        throw new Error('THREADS_ACCESS_TOKEN not found in environment variables.');
    }
    // This endpoint seems to be for creating a container - needs review based on the two-step process.
    const baseUrl = `${API_BASE_URL}/me/threads`; // Using /me is also common, but the docs you provided used /{threads-user-id}

    console.log(\`Attempting to post to Threads account: \${account}\`);

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': \`Bearer \${THREADS_ACCESS_TOKEN}\`, // Authorization header is often used
            },
             // This body structure might need adjustment based on API specifics for text-only posts or containers
            body: JSON.stringify({
                 text: text,
                 access_token: THREADS_ACCESS_TOKEN, // Often passed in query params or headers, check API docs
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Error posting to Threads:", response.status, errorBody);
            throw new Error(`Failed to post to Threads: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log("Posted to Threads successfully.", data);
        return data;
    } catch (error: any) {
        console.error("Exception when posting to Threads:", error);
        throw new Error(`Failed to post to Threads: ${error.message}`);
    }catch(error: any){
            console.error("Failed to post to Threads:", error);
            throw new Error(\`Failed to post to Threads: \${error.message}\`);
        }
}

export async function getRecentlySearchedKeywords(): Promise<string[]> {
    // Placeholder function - actual implementation would involve fetching keywords
    // from a database or other persistent storage, associated with the user.
    console.log("Fetching recently searched keywords.");
    try {
        // Simulate fetching from a database
        const keywords = ["example", "threads", "api"];
        console.log("Recently searched keywords fetched:", keywords);
        return keywords;
    } catch (error: any) {
        console.error("Failed to get recently searched keywords:", error);
        throw new Error(`Failed to get recently searched keywords: ${error.message}`);
    }
}

export async function saveRecentKeyword(keyword: string): Promise<void> {
    // Placeholder function - actual implementation would involve saving the keyword
    // to a database or other persistent storage, and associating it with the user.
    console.log(`Saving recent keyword: ${keyword}`);
}
