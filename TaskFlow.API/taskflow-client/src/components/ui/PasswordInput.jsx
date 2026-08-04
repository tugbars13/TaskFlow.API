import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  showForgotLink = true,
  id = "password",
  name = "password",
  label = "Password"
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-sm">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="font-label-md text-label-md leading-[20px] font-semibold text-on-surface">
          {label}
        </label>
        {showForgotLink && (
          <a href="#" className="text-primary font-label-sm text-label-sm leading-[16px] tracking-[0.05em] font-medium hover:underline">
            Forgot password?
          </a>
        )}
      </div>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
          lock
        </span>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-[48px] pr-lg py-[14px] bg-surface-container-high/50 border-none rounded-2xl focus:ring-0 transition-colors placeholder:text-outline/60 text-body-md font-body-md leading-[24px] font-normal apple-shadow"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}