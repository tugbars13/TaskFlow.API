import { useEffect } from "react";
import { tokenStorage } from "@/utils/tokenStorage";
import { getCurrentUser } from "../api/authService";

export default function useAuthSession({
  setUser,
  setRole,
  setIsLoading,
}) {
  useEffect(() => {
    const initUserSession = async () => {
      const token = tokenStorage.getAccessToken();

      if (token) {
        try {
          const profile = await getCurrentUser();

          const firstName =
            profile?.firstName ||
            (profile?.fullName
              ? profile.fullName.split(" ")[0]
              : null);

          setUser({
            ...profile,
            firstName,
            name: profile?.fullName || firstName || "User",
            token,
          });

          setRole(profile?.role || "User");
        } catch (err) {
          console.error("Failed to fetch authenticated profile:", err);

          setUser({
            token,
            name: null,
            firstName: null,
          });
        }
      }

      setIsLoading(false);
    };

    initUserSession();
  }, [setUser, setRole, setIsLoading]);
}