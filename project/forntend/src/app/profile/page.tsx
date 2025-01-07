// src/app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { keycloak } from "@/services/keycloak";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const token = keycloak.token;
    setToken(token || "");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <div className="bg-gray-500 p-4 rounded">
          <p>
            <strong>Username:</strong> {user?.preferred_username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Name:</strong> {user?.name}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Access Token</h2>
        <div className="bg-gray-500 p-4 rounded">
          <pre className="whitespace-pre-wrap break-all text-sm">{token}</pre>
        </div>
      </div>
    </div>
  );
}
