import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "@/layout/AuthLayout";

import useAuth from "@/features/auth/hooks/useAuth";
import { validateEmail } from "@/features/auth/utils/validators";

import {
  AuthHeader,
  AuthDivider,
  AuthFooter,
  LoginForm,
  SocialLoginButtons,
  AuthMobileLogo,
} from "@/features/auth/components";
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    const success = await login({ email, password, remember });
    if (success) navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <AuthMobileLogo />

      <AuthHeader
        title="Welcome Back"
        subtitle="Enter your details to access your workspace."
    />

      {/* Social Login Buttons */}
      <SocialLoginButtons />

      {/* Divider */}
      <AuthDivider
          text="Or sign in with email"
      />

      <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          remember={remember}
          setRemember={setRemember}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
      />

      <AuthFooter
          question="Don't have an account?"
          linkText="Sign Up"
          to="/register"
      />
    </AuthLayout>
  );
}