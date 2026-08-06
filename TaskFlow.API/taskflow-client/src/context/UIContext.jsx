import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);

  const openTaskModal = () => {
    setIsGlobalTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsGlobalTaskModalOpen(false);
  };

  return (
    <UIContext.Provider
      value={{
        isGlobalTaskModalOpen,
        openTaskModal,
        closeTaskModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}