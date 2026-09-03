import { useState } from "react";
import AuthLayout from "@/layout/AuthLayout";
import { AuthHeader, AuthFooter, AuthMobileLogo } from "@/features/auth/components";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { forgotPasswordRequest } from "@/features/auth/api/authService";
import { validateEmail } from "@/features/auth/utils/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await forgotPasswordRequest(email);
      setSuccess(true);
    } catch (err) {
      // Network hataları için fallback
      setError("Bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthMobileLogo />

      <AuthHeader
        title="Forgot Password"
        subtitle="Enter your email address and we'll send you a password reset link."
      />

      {success ? (
        <div className="space-y-lg mt-8">
          <div className="p-4 bg-success/10 text-success rounded-xl text-center font-medium">
            Email adresiniz sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-lg">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            icon="mail"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-body-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <AuthFooter
        question="Remember your password?"
        linkText="Sign In"
        to="/login"
      />
    </AuthLayout>
  );
}
