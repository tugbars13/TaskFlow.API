import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import RegisterBrandPanel from "@/components/layout/RegisterBrandPanel";
import useAuth from "@/features/auth/hooks/useAuth";
import { validateEmail } from "@/features/auth/utils/validators";
import {
  AuthHeader,
  AuthDivider,
  AuthFooter,
  SocialLoginButtons,
  RegisterForm,
  AuthMobileLogo,
} from "@/features/auth/components";
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !agreedToTerms) return;

    const success = await register({ fullName, email, password });
    if (success) {
      navigate("/login");
    }
  };

  return (
    <AuthLayout brandPanel={<RegisterBrandPanel />}>
      {/* Mobile Logo (Hidden on Desktop) */}
      <AuthMobileLogo />

      {/* Form Header */}
      <AuthHeader
          title="Create an Account"
          subtitle="Join TaskFlow Pro and start managing your projects with ease."
      />

      {/* Social Buttons */}
      <SocialLoginButtons />

      {/* Divider */}
      <AuthDivider
          text="Or sign up with email"
      />

      {/* Form Fields */}
      <RegisterForm
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          agreedToTerms={agreedToTerms}
          setAgreedToTerms={setAgreedToTerms}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
      />

      {/* Footer */}
      <AuthFooter
            question="Already have an account?"
            linkText="Sign In"
            to="/login"
        />
    </AuthLayout>
  );
}