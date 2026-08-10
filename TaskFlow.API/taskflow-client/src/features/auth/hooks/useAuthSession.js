import { useEffect } from "react";
import { tokenStorage } from "@/utils/tokenStorage";
import { getCurrentUser } from "../api/authService";

export default function useAuthSession({
  setUser,
  setRole,
  setPermissions,
  setIsLoading,
}) {
  useEffect(() => {
    const initUserSession = async () => {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUser();

        const firstName =
          profile?.firstName ||
          (profile?.fullName ? profile.fullName.split(" ")[0] : null);

        setUser({
          ...profile,
          firstName,
          name: profile?.fullName || firstName || "User",
        });

        setRole(profile?.role || "User");
        setPermissions(profile?.permissions ?? []);
      } catch (err) {
        console.error("Failed to fetch authenticated profile:", err);

        setUser(null);
        setRole(null);
        setPermissions([]);
        tokenStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initUserSession();
  }, [setUser, setRole, setPermissions, setIsLoading]);
}
