import { useState } from "react";
import { deleteAccount } from "@/features/auth/api/authService";
import useAuth from "@/features/auth/hooks/useAuth";

export default function DangerZone() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { logout } = useAuth();

  const isConfirmEnabled = confirmText.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmEnabled) return;
    
    setIsDeleting(true);
    setErrorMsg("");
    
    try {
      await deleteAccount();
      // On successful deletion (backend returns 204 typically or no throw)
      // Clean up local auth state and redirect (logout handles this)
      alert("Your account has been permanently deleted.");
      logout();
    } catch (error) {
      setIsDeleting(false);
      setErrorMsg("Account deletion failed. Please try again.");
      console.error("Account deletion error:", error);
    }
  };

  return (
    <div className="bg-error/5 rounded-[20px] p-6 lg:p-8 border border-error/20 apple-shadow relative">
      <div>
        <h3 className="font-headline-md text-headline-md font-bold text-error">
          Danger Zone
        </h3>
        <p className="text-sm text-on-surface-variant mt-1.5">
          Irreversible and destructive actions.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-surface-container-lowest border border-error/20 rounded-2xl apple-shadow-sm">
          <div>
            <h4 className="text-[14px] font-bold text-on-surface">
              Delete Account
            </h4>
            <p className="text-[12px] font-medium text-on-surface-variant mt-0.5">
              Permanently delete your account and all of your content.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 h-[42px] bg-error hover:bg-error/90 text-white font-bold text-[13px] rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-[24px] p-8 w-[420px] max-w-[calc(100vw-32px)] shrink-0 shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
            <h3 className="text-[20px] font-bold text-on-surface mb-2">Delete your account?</h3>
            <p className="text-[14px] text-on-surface-variant mb-6">
              This action cannot be undone. Your account and associated data will be permanently deleted.
            </p>

            <div className="mb-6">
              <label className="block text-[13px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-[14px] font-bold text-on-surface focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all"
                disabled={isDeleting}
              />
              {errorMsg && <p className="text-[13px] font-medium text-error mt-2">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setConfirmText("");
                  setErrorMsg("");
                }}
                className="px-5 py-2.5 text-[14px] font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmEnabled || isDeleting}
                className="px-5 py-2.5 bg-error hover:bg-error/90 text-white font-bold text-[14px] rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
