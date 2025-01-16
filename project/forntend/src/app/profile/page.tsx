"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { keycloak } from "@/services/keycloak";
import { userService } from "@/services/userService";
import { motion } from "framer-motion";
import { User, Users, Key, Loader } from "lucide-react";

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-800 shadow-lg rounded-lg overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-700 p-6 border-b border-gray-600">{children}</div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
      {children}
    </h2>
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-10"
        >
          User Profile
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>
                <User size={24} /> User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-lg font-medium">
                    {user?.preferred_username}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-lg font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-lg font-medium">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">ID</label>
                  <p className="text-lg font-medium">{user?.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Key size={24} /> Access Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded-md">
                <pre className="whitespace-pre-wrap break-all text-sm text-gray-300 max-h-60 overflow-y-auto">
                  {token}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>
              <Users size={24} /> All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="animate-spin" size={32} />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 font-semibold">ID</th>
                      <th className="text-left p-3 font-semibold">Username</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                      >
                        <td className="p-3">{user.id}</td>
                        <td className="p-3">{user.username}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          {user.firstName} {user.lastName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
