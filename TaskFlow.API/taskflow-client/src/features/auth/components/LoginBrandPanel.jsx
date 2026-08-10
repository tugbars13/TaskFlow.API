import { LOGIN_BRAND_FEATURES } from "@/features/auth/constants/login-brand.constants";
import { cn } from "@/utils/cn";
export default function LoginBrandPanel() {
  return (
    <section
      className={cn(
        "relative hidden overflow-hidden",
        "lg:flex lg:w-1/2",
        "flex-col justify-between",
        "mesh-gradient p-xl",
      )}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-sm">
          <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md">
            TF
          </div>
          <span className="text-white font-headline-md text-headline-md leading-[28px] font-semibold tracking-tight">
            TaskFlow Pro
          </span>
        </div>
      </div>

      {/* Main Tagline */}
      <div className="relative z-10 max-w-[512px]">
        <h1 className="font-display-lg text-display-lg leading-[1.2] tracking-[-0.02em] font-extrabold text-white mb-lg">
          Manage your workflow with AI-powered precision.
        </h1>
        <p className="font-body-lg text-body-lg leading-[28px] font-normal text-on-primary-container/80 max-w-[448px]">
          The next generation of productivity is here. Experience fluid task
          management designed for modern high-performance teams.
        </p>
      </div>

      {/* Feature Glass Cards */}
      <div className="relative z-10 flex gap-md">
        {LOGIN_BRAND_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="glass-panel p-md rounded-xl flex items-center gap-sm"
          >
            <div className="size-10 rounded-full bg-on-primary-container/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={
                  feature.filled
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {feature.icon}
              </span>
            </div>

            <div>
              <p className="text-white font-label-md text-label-md leading-[20px] font-semibold">
                {feature.title}
              </p>

              <p className="text-on-primary-container/60 text-xs">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
