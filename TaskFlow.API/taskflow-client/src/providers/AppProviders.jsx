import AuthProvider from "@/features/auth/context/AuthContext";
import TaskProvider from "@/features/tasks/context/TaskContext";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <TaskProvider>
        {children}
      </TaskProvider>
    </AuthProvider>
  );
}