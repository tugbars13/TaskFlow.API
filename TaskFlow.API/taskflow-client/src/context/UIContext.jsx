import { createContext, useContext, useMemo, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);

  const openTaskModal = () => {
    setIsGlobalTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsGlobalTaskModalOpen(false);
  };

  const value = useMemo(
    () => ({
      isGlobalTaskModalOpen,
      openTaskModal,
      closeTaskModal,
    }),
    [isGlobalTaskModalOpen],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }

  return context;
}
