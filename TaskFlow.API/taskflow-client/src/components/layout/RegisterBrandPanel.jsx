export default function RegisterBrandPanel() {
  return (
    <section className="hidden md:flex md:w-1/2 gradient-brand relative overflow-hidden flex-col justify-between p-xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Logo Area */}
      <div className="relative z-10 flex items-center gap-md">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
          TF
        </div>
        <span className="font-headline-md text-headline-md leading-[28px] font-semibold text-white tracking-tight">
          TaskFlow Pro
        </span>
      </div>

      {/* Hero Messaging */}
      <div className="relative z-10 max-w-[512px]">
        <h1 className="font-display-lg text-display-lg leading-[1.2] tracking-[-0.02em] font-extrabold text-white mb-lg">
          Join the future of productivity
        </h1>
        <p className="font-body-lg text-body-lg leading-[28px] font-normal text-white/80">
          Get started in seconds with AI-powered task management. Experience a new era of efficiency designed for modern teams.
        </p>
      </div>

      {/* Social Proof */}
      <div className="relative z-10 glass-panel p-lg rounded-xl flex items-center justify-between">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-container/40 flex items-center justify-center text-white font-semibold text-xs">
            JD
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary-container/40 flex items-center justify-center text-white font-semibold text-xs">
            AS
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-tertiary-container/40 flex items-center justify-center text-white font-semibold text-xs">
            MK
          </div>
        </div>
        <div className="text-white/90 font-label-md text-label-md leading-[20px] font-semibold">
          Trusted by 20,000+ teams globally
        </div>
      </div>
    </section>
  );
}