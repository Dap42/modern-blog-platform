"use client";

import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Theme is now statically set to dark mode in layout.tsx
  // This component simply passes through its children.
  return <>{children}</>;
}
