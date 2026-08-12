import { tokenStorage } from "@/utils/tokenStorage";
import { getCurrentUser } from "../api/authService";

export default function useAuthActions({ setUser, setRole, setPermissions }) {
  const login = async (tokens, userData = null) => {
    if (typeof tokens === "string") {
      tokenStorage.setAccessToken(tokens);
    } else if (tokens?.accessToken) {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    }

    try {
      const profile = await getCurrentUser();

      const firstName =
        profile?.firstName ||
        (profile?.fullName ? profile.fullName.split(" ")[0] : null);

      const loggedUser = {
        ...profile,
        firstName,
        name: profile?.fullName || firstName || "User",
      };

      setUser(loggedUser);
      setRole(profile?.role || "User");
      setPermissions(profile?.permissions ?? []);
    } catch (err) {
      console.error(err);
      setUser(userData || { name: null, firstName: null });
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();

    setUser(null);
    setRole(null);
    setPermissions([]);
  };

  const refreshProfile = async () => {
    try {
      const profile = await getCurrentUser();
      const firstName = profile?.firstName || (profile?.fullName ? profile.fullName.split(" ")[0] : null);
      
      const loggedUser = {
        ...profile,
        firstName,
        name: profile?.fullName || firstName || "User",
      };
      setUser(loggedUser);
      setRole(profile?.role || "User");
      setPermissions(profile?.permissions ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    login,
    logout,
    refreshProfile,
  };
}
