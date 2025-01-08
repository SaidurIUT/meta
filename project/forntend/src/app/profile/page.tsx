"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { keycloak } from "@/services/keycloak";
import { userService } from "@/services/userService";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-600 shadow-md rounded-lg overflow-hidden">
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="bg-gray-700 p-4 border-b">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="bg-gray-700 p-4">{children}</div>;
}
export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [token, setToken] = useState("");
  interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const token = keycloak.token;
    setToken(token || "");

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{user.id}</td>
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        {user.firstName + " " + user.lastName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Token</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap break-all text-sm bg-gray-800 p-4 rounded">
            {token}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
