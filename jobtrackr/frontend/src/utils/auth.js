// Small helpers to keep the login tokens in the browser's localStorage.
//
// Note for interviews: localStorage is simple and common for learning projects,
// but it can be read by JavaScript, so a real production app would often use
// httpOnly cookies instead. We keep access tokens short-lived (30 min) to limit risk.

const ACCESS_KEY = 'jobtrackr_access';
const REFRESH_KEY = 'jobtrackr_refresh';
const USER_KEY = 'jobtrackr_user';

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (access, refresh) => {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const setAccessToken = (access) => localStorage.setItem(ACCESS_KEY, access);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null; // corrupted value
  }
};

export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => Boolean(getAccessToken() && getStoredUser());
