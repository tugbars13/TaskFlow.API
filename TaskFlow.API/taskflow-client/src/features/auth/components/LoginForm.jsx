import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  remember,
  setRemember,
  loading,
  error,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-lg">

      <Input
        id="email"
        name="email"
        label="Email Address"
        icon="mail"
        type="email"
        placeholder="name@/company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
      />

      <Checkbox
        checked={remember}
        onChange={setRemember}
        label="Remember me for 30 days"
      />

      {error && (
        <p className="text-status-error text-body-sm">
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