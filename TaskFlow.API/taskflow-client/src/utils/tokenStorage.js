const ACCESS_TOKEN_KEY = "taskflow_access_token";
const REFRESH_TOKEN_KEY = "taskflow_refresh_token";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  setTokens: (accessToken, refreshToken) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasAccessToken: () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
};
