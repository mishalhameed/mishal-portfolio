import { type ReactNode } from "react";
export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      {children}
    </>
  );
}
