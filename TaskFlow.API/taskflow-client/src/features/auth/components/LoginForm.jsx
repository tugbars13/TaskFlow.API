import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";

export default function LoginForm({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  remember,
  onRememberChange,
  loading,
  error,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-lg">
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
        value={password}
        onChange={onPasswordChange}
      />

      <Checkbox
        checked={remember}
        onChange={onRememberChange}
        label="Remember me for 30 days"
      />

      {error && (
        <p
          role="alert"
          className="text-body-sm text-error"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
