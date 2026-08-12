import LoginBrandPanel from "../features/auth/components/LoginBrandPanel";
import { cn } from "@/utils/cn";
export default function AuthLayout({ children, brandPanel }) {
  return (
    <main
      className={cn(
        "min-h-screen w-full",
        "flex flex-col md:flex-row",
        "overflow-hidden",
        "bg-background-canvas",
      )}
    >
      {/* Sol Tanıtım Paneli */}
      {brandPanel ?? <LoginBrandPanel />}

      {/* Sağ Form Alanı */}
      <section className="w-full md:w-1/2 bg-surface flex items-center justify-center p-md md:p-xl">
        <div className="w-full max-w-[480px]">{children}</div>
      </section>
    </main>
  );
}
