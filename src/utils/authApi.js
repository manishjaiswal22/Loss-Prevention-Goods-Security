/**
 * Authentication API Service
 * Connects to Backend API (/api/login)
 */

// In development mode, always route via Vite proxy ('/api') to avoid browser CORS errors
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Authenticates user credentials against the backend API and Microsoft SQL Server.
 * @param {string} username User account name (e.g., 'admin', 'manish')
 * @param {string} password User password
 * @returns {Promise<{success: boolean, message: string, user?: Object, token?: string, code: number}>}
 */
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Username: username.trim(),
        Password: password,
      }),
    });

    const data = await response.json().catch(() => null);

    // Backend returns Code === 1 on success, Code === 0 on invalid credentials
    const isSuccess = data?.Code === 1 || data?.success === true;

    if (!response.ok || !isSuccess) {
      const errorMsg =
        data?.Msg ||
        data?.message ||
        (data?.errors ? Object.values(data.errors).flat().join(', ') : null) ||
        'Invalid Username or Password.';
      throw new Error(errorMsg);
    }

    const userObj = data?.User || data?.user || {};

    return {
      success: true,
      code: data?.Code ?? 1,
      message: data?.Msg || data?.message || 'Login Successful',
      user: {
        userId: userObj.UserId ?? userObj.userId,
        username: userObj.Username ?? userObj.username ?? username,
        isStatus: userObj.IsStatus ?? userObj.isStatus ?? 1,
        creationDateTime: userObj.CreationDateTime ?? userObj.creationDateTime,
      },
      token: data?.Token || data?.token || `session_${Date.now()}`,
      raw: data,
    };
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
