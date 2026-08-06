import { tokenStorage } from "@/utils/tokenStorage";
import { getCurrentUser } from "../api/authService";

export default function useAuthActions({
  setUser,
  setRole,
  setPermissions,
}) {
  const login = async (tokens, userData = null) => {
    if (typeof tokens === "string") {
      tokenStorage.setAccessToken(tokens);
      console.log("TOKEN AFTER SAVE:",
      tokenStorage.getAccessToken());
    } else if (tokens?.accessToken) {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    }

    try {
      const profile = await getCurrentUser();

      const firstName =
        profile?.firstName ||
        (profile?.fullName
          ? profile.fullName.split(" ")[0]
          : null);

      const loggedUser = {
        ...profile,
        firstName,
        name: profile?.fullName || firstName || "User",
      };

      setUser(loggedUser);
      setRole(profile?.role || "User");
    } catch {
      setUser(userData || { name: null, firstName: null });
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();

    setUser(null);
    setRole(null);
    setPermissions([]);
  };

  return {
    login,
    logout,
  };
}