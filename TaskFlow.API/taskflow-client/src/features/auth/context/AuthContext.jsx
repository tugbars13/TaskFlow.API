import { createContext, useState } from "react";
import { tokenStorage } from "@/utils/tokenStorage";
import useAuthActions from "../hooks/useAuthActions";
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
    setIsLoading,
  });
  const { login, logout, register } = useAuthActions({
    setUser,
    setRole,
    setPermissions,
  });

  const hasRole = (requiredRole) => {
    if (!role) return false;
    if (role === "Admin") return true;
    return role === requiredRole;
  };

  const hasPermission = (permission) => {
    if (role === "Admin") return true;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAuthenticated: Boolean(user || tokenStorage.hasAccessToken()),
        isLoading,
        login,
        logout,
        register,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}