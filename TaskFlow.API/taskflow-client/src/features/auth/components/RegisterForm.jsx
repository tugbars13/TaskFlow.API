import { Link } from "react-router-dom";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/constants/routesConstants";

export default function RegisterForm({
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  agreedToTerms,
  onTermsChange,
  loading,
  error,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-lg">
      <Input
        id="fullname"
        name="fullname"
        label="Full Name"
        icon="person"
        placeholder="Enter your full name"
        value={fullName}
        onChange={onFullNameChange}
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email Address"
        icon="mail"
        placeholder="name@company.com"
        value={email}
        onChange={onEmailChange}
      />

      <PasswordInput
        id="password"
        name="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Min. 8 characters"
        showForgotLink={false}
      />

      <Checkbox
        id="terms"
        checked={agreedToTerms}
        onChange={onTermsChange}
        label={
          <>
            I agree to the{" "}
            <Link
              to={ROUTES.TERMS}
              className="font-semibold text-primary hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to={ROUTES.PRIVACY}
              className="font-semibold text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </>
        }
      />

      {error && (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="filled"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
