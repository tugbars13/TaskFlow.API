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
    hasRole,
    hasPermission,
  } = context;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest(email, password);
      console.log("LOGIN RESPONSE", response);
      setAuthContext(response.token || response.accessToken, response.user);
      return true;
    } catch (err) {
      setError("Giriş başarısız.");
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
      setError("Kayıt başarısız.");
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
    hasRole,
    hasPermission,
    loading,
    error,
  };
}