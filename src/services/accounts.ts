// tagged for gh commit 24 apr 25
/**
 * Represents a Threads account.
 */
export interface ThreadsAccount {
  /**
   * The ID of the account.
   */
  id: string;
  /**
   * The alias of the account.
   */
  alias: string;
}

/**
 * Asynchronously retrieves a list of Threads accounts.
 *
 * @returns A promise that resolves to an array of ThreadsAccount objects.
 */
export async function getAccounts(): Promise<ThreadsAccount[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '1',
      alias: 'Account 1',
    },
    {
      id: '2',
      alias: 'Account 2',
    },
  ];
}

/**
 * Asynchronously adds a new Threads account.
 *
 * @param accountToken The authentication token for the Threads account.
 * @param alias An alias for the account.
 * @returns A promise that resolves when the account is successfully added.
 */
export async function addAccount(accountToken: string, alias: string): Promise<void> {
  // TODO: Implement this by calling an API.
  console.log(`Adding account with token ${accountToken} and alias ${alias}`);
}
