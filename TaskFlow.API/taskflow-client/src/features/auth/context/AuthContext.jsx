import { createContext, useState, useCallback, useMemo } from "react";
import { tokenStorage } from "@/utils/tokenStorage";
import useAuthActions from "@/features/auth/hooks/useAuthActions";
import useAuthSession from "@/features/auth/hooks/useAuthSession";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("Member");
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useAuthSession({
    setUser,
    setRole,
    setPermissions,
    setIsLoading,
  });
  const { login, logout, register, refreshProfile } = useAuthActions({
    setUser,
    setRole,
    setPermissions,
  });
  const hasRole = useCallback(
    (requiredRole) => {
      if (!role) return false;
      if (role === "Admin") return true;
      return role === requiredRole;
    },
    [role],
  );

  const hasPermission = useCallback(
    (permission) => {
      if (role === "Admin") return true;
      return permissions.includes(permission);
    },
    [role, permissions],
  );
  const isAuthenticated = Boolean(user || tokenStorage.hasAccessToken());

  const value = useMemo(
    () => ({
      user,
      role,
      permissions,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      refreshProfile,
      hasRole,
      hasPermission,
    }),
    [
      user,
      role,
      permissions,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      refreshProfile,
      hasRole,
      hasPermission,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
