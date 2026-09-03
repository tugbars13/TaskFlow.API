import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginRequest, registerRequest } from "../api/authService";

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading: authLoading,
    login: setAuthContext,
    logout: logoutAuthContext,
    refreshProfile,
    hasRole,
    hasPermission,
  } = context;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async ({ email, password, remember }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest({ email, password, rememberMe: remember });

      await setAuthContext(response.token || response.accessToken, response.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message ?? "Giriş başarısız.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ fullName, email, password }) => {
    setLoading(true);
    setError(null);

    try {
      await registerRequest({
        fullName,
        email,
        password,
      });
      return true;
    } catch (err) {
      setError(err.response?.data?.message ?? "Kayıt başarısız.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    role,
    permissions,
    isAuthenticated,
    authLoading,
    login: loginUser,
    register,
    logout: logoutAuthContext,
    refreshProfile,
    hasRole,
    hasPermission,
    loading,
    error,
  };
}
