"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthModal from "@/components/auth/AuthModal";

type AuthMode = "login" | "register";

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const openLogin = () => {
    setMode("login");
    setIsOpen(true);
  };

  const openRegister = () => {
    setMode("register");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openLogin,
        openRegister,
        closeModal,
      }}
    >
      {children}
      {isOpen && <AuthModal />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
