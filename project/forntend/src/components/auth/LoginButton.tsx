// src/components/auth/LoginButton.tsx
import { useCallback } from "react";
import { keycloak } from "@/services/keycloak";

export const LoginButton = () => {
  const handleLogin = useCallback(() => {
    keycloak.login();
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Sign In
    </button>
  );
};
