// tagged for gh commit 24 apr 25
/**
 * Represents a Threads post.
 */
export interface ThreadsPost {
  /**
   * The ID of the post.
   */
  id: string;
  /**
   * The content of the post.
   */
  content: string;
  /**
   * The author of the post.
   */
  author: string;
  /**
   * The timestamp of the post.
   */
  timestamp: string;
}

// Replace with your actual Threads User ID from .env or configuration
const THREADS_USER_ID = "9412267978894822";
const API_BASE_URL = "https://graph.threads.net/v1.0";

/**
 * Asynchronously fetches a feed of Threads posts based on specified filters and pagination.
 *
 * @param filters An object containing filters for users and keywords.
 * @param page The page number for pagination.
 * @returns A promise that resolves to an array of ThreadsPost objects.
 */
export async function fetchFeed(filters: { users: string[]; keywords: string[] }, page: number): Promise<ThreadsPost[]> {
  // TODO: Implement this by calling the Threads API.
  console.log("Fetching feed with filters:", filters, "page:", page);

  return [
    {
      id: '1',
      content: 'This is the first post.',
      author: 'John Doe',
      timestamp: '2024-01-01T12:00:00Z',
    },
    {
      id: '2',
      content: 'Another interesting thought.',
      author: 'Jane Smith',
      timestamp: '2024-01-01T13:00:00Z',
    },
  ];
}

/**
 * Asynchronously fetches replies for a specific Threads post.
 *
 * @param postId The ID of the parent post.
 *
 * @returns A promise that resolves to an array of ThreadsPost objects representing the replies.
 */
export async function fetchReplies(postId: string): Promise<ThreadsPost[]> {
  // TODO: Implement this by calling the Threads API.
  console.log("Fetching replies for post:", postId);

  return [
    {
      id: '3',
      content: 'Reply to the first post.',
      author: 'Alice',
      timestamp: '2024-01-01T14:00:00Z',
    },
  ];
}

/**
 * Asynchronously creates a Threads media container.
 * This is the first step in publishing a post.
 *
 * @param accountToken The authentication token for the Threads account.
 * @param text The text content of the post.
 * @param imageUrl Optional URL of the image to include in the post.
 * @returns A promise that resolves with the created container ID.
 * @throws Error if the API call fails.
 */
export async function createThreadsMediaContainer(accountToken: string, text: string, imageUrl?: string): Promise<string> {
  const endpoint = `${API_BASE_URL}/${THREADS_USER_ID}/threads`;
  const params: Record<string, string> = {
    text: text,
    access_token: accountToken,
  };

  if (imageUrl) {
    params.media_type = "IMAGE";
    params.image_url = imageUrl;
  } else {
     params.media_type = "TEXT"; // Explicitly set for text-only posts
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${endpoint}?${queryString}`;

  console.log("Creating Threads media container:", url);

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error creating media container:", response.status, errorBody);
      throw new Error(`Failed to create Threads media container: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log("Media container created:", data);
    return data.id; // Return the container ID
  } catch (error) {
    console.error("Exception when creating media container:", error);
    throw error;
  }
}

/**
 * Asynchronously publishes a Threads media container.
 * This is the second step in publishing a post.
 * It is recommended to wait on average 30 seconds after creating the container
 * before calling this function.
 *
 * @param accountToken The authentication token for the Threads account.
 * @param containerId The ID of the media container to publish.
 * @returns A promise that resolves with the published media ID.
 * @throws Error if the API call fails.
 */
export async function publishThreadsContainer(accountToken: string, containerId: string): Promise<string> {
    const endpoint = `${API_BASE_URL}/${THREADS_USER_ID}/threads_publish`;
    const params: Record<string, string> = {
      creation_id: containerId,
      access_token: accountToken,
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}?${queryString}`;

    console.log("Publishing Threads media container:", url);

    try {
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Error publishing media container:", response.status, errorBody);
        throw new Error(`Failed to publish Threads media container: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      console.log("Media container published:", data);
      return data.id; // Return the published media ID
    } catch (error) {
      console.error("Exception when publishing media container:", error);
      throw error;
    }
  }


/**
 * Asynchronously publishes a reply to a Threads post.
 *
 * @param parentPostId The ID of the parent post.
 * @param replyText The text of the reply.
 * @param accountToken The authentication token for the Threads account.
 * @returns A promise that resolves when the reply is successfully published.
 */
export async function publishThreadsReply(parentPostId: string, replyText: string, accountToken: string): Promise<void> {
  // TODO: Implement this by calling the Threads API.
  console.log(`Publishing reply to parentPostId: ${parentPostId}, replyText: ${replyText}, accountToken: ${accountToken}`);
}
