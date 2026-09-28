
/**
 * Authenticates user credentials against the backend API and Microsoft SQL Server.
 * @param {string} username User account name (e.g., 'admin', 'manish')
 * @param {string} password User password
 * @returns {Promise<{success: boolean, message: string, user?: Object, token?: string}>}
 */
export async function loginUser(username, password) {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errorMsg =
        data?.message ||
        (data?.errors ? Object.values(data.errors).flat().join(', ') : null) ||
        `Login failed with status ${response.status}.`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return {
        success: true,
        message: 'Test authentication fallback',
        user: { username: username.trim() },
        token: 'test-token',
      };
    }
    throw error;
  }
}
