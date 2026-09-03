import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import { AuthHeader, AuthMobileLogo } from "@/features/auth/components";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { resetPasswordRequest } from "@/features/auth/api/authService";
import { ROUTES } from "@/constants/routesConstants";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Geçersiz şifre sıfırlama bağlantısı.");
      return;
    }
    if (!password) {
      setError("Lütfen yeni şifrenizi girin.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPasswordRequest(token, password);
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.errors;

        if (validationErrors?.NewPassword?.length) {
          setError(validationErrors.NewPassword[0]);
        } else {
          setError(
            "Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
          );
        }
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <AuthMobileLogo />
        <AuthHeader
          title="Invalid Link"
          subtitle="This password reset link is invalid or missing a token."
        />
        <div className="space-y-lg mt-8">
          <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthMobileLogo />
      <AuthHeader
        title="Reset Password"
        subtitle="Please enter your new password below."
      />

      {success ? (
        <div className="space-y-lg mt-8">
          <div className="p-4 bg-success/10 text-success rounded-xl text-center font-medium">
            Password reset successful. You can now sign in with your new
            password.
          </div>
          <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
            Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-lg">
          <PasswordInput
            id="password"
            name="password"
            label="New Password"
            value={password}
            onChange={setPassword}
            showForgotLink={false}
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showForgotLink={false}
          />

          {error && (
            <p role="alert" className="text-body-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
