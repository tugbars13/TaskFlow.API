import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background-canvas text-on-surface">
      <Sidebar />

      <Navbar />

      <main className="ml-[var(--spacing-sidebar-width)] min-h-[calc(100vh-72px)] pt-lg pb-xl px-lg md:px-xl transition-all duration-300">
        <div className="max-w-[var(--spacing-container-max)] mx-auto space-y-xl">
          {children ?? <Outlet />}
        </div>
      </main>

    </div>
  );
}