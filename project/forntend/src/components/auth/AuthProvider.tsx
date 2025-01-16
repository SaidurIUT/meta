// // src/components/auth/AuthProvider.tsx

// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { initKeycloak, setAuthToken, keycloak } from "@/services/keycloak";

// // Define the shape of our authentication context
// interface AuthContextType {
//   isAuthenticated: boolean;
//   user: any | null;
//   loading: boolean;
//   token: string | null;
//   error: string | null;
// }

// // Define a User interface based on Keycloak's tokenParsed structure
// interface User {
//   id: string;
//   username: string;
//   email: string;
//   [key: string]: any; // For any additional fields
// }

// // Create context with default values
// const AuthContext = createContext<AuthContextType>({
//   isAuthenticated: false,
//   user: null,
//   loading: true,
//   token: null,
//   error: null,
// });

// // Custom hook for using auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: React.ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   // State to manage authentication status and user info
//   const [state, setState] = useState<AuthContextType>({
//     isAuthenticated: false,
//     user: null,
//     loading: true,
//     token: null,
//     error: null,
//   });

//   // Setup token refresh
//   useEffect(() => {
//     let refreshInterval: NodeJS.Timeout;

//     const setupTokenRefresh = () => {
//       if (keycloak.token && keycloak.tokenParsed) {
//         // Get token expiration time
//         const expiryTime = (keycloak.tokenParsed.exp || 0) * 1000;
//         const currentTime = new Date().getTime();
//         const timeUntilExpiry = expiryTime - currentTime;

//         // Refresh token 1 minute before it expires
//         const refreshTime = timeUntilExpiry - 60000;

//         refreshInterval = setTimeout(() => {
//           keycloak
//             .updateToken(70)
//             .then((refreshed) => {
//               if (refreshed) {
//                 setAuthToken();
//                 setState((prev) => ({
//                   ...prev,
//                   token: keycloak.token || null,
//                 }));
//                 setupTokenRefresh(); // Schedule the next refresh
//               }
//             })
//             .catch((error) => {
//               console.error("Failed to refresh token:", error);
//               // Handle failed refresh (e.g., redirect to login)
//               keycloak.login();
//             });
//         }, refreshTime > 0 ? refreshTime : 0);
//       }
//     };

//     return () => {
//       if (refreshInterval) {
//         clearTimeout(refreshInterval);
//       }
//     };
//   }, [state.isAuthenticated]);

//   // Initialize Keycloak
//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         const authenticated = await initKeycloak();

//         if (authenticated) {
//           setAuthToken();
//           const user: User = {
//             id: keycloak.tokenParsed?.sub || "",
//             username: keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.username || "Unknown",
//             email: keycloak.tokenParsed?.email || "",
//             // Add other fields as necessary
//           };

//           setState({
//             isAuthenticated: true,
//             user: user,
//             loading: false,
//             token: keycloak.token ?? null,
//             error: null,
//           });

//           // Setup token refresh
//           keycloak.onTokenExpired = () => {
//             keycloak
//               .updateToken(70)
//               .then((refreshed) => {
//                 if (refreshed) {
//                   setAuthToken();
//                   setState((prev) => ({
//                     ...prev,
//                     token: keycloak.token ?? null,
//                   }));
//                 }
//               })
//               .catch((error) => {
//                 console.error("Token refresh failed:", error);
//                 setState((prev) => ({
//                   ...prev,
//                   error: "Session expired. Please login again.",
//                 }));
//                 keycloak.login();
//               });
//           };
//         } else {
//           setState((prev) => ({
//             ...prev,
//             loading: false,
//           }));
//         }
//       } catch (error) {
//         console.error("Keycloak initialization failed:", error);
//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           error: "Authentication service initialization failed",
//         }));
//       }
//     };

//     initAuth();

//     // Cleanup function
//     return () => {
//       keycloak.onTokenExpired = () => {}; // Remove token expired handler
//     };
//   }, []);

//   // Loading state
//   if (state.loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-gray-500">Loading...</div>
//       </div>
//     ); // You can replace this with a proper loading component
//   }

//   // Error state
//   if (state.error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-red-500">{state.error}</div>
//       </div>
//     );
//   }

//   return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
// };

// src/components/auth/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initKeycloak, setAuthToken, keycloak } from "@/services/keycloak";

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null; // You can create a proper User type based on your needs
  loading: boolean;
  token: string | null;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  token: null,
  error: null,
});

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State to manage authentication status and user info
  const [state, setState] = useState<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    token: null,
    error: null,
  });

  // Setup token refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const setupTokenRefresh = () => {
      if (keycloak.token && keycloak.tokenParsed) {
        // Get token expiration time
        const expiryTime = (keycloak.tokenParsed.exp || 0) * 1000;
        const currentTime = new Date().getTime();
        const timeUntilExpiry = expiryTime - currentTime;

        // Refresh token 1 minute before it expires
        const refreshTime = timeUntilExpiry - 60000;

        refreshInterval = setInterval(
          () => {
            keycloak
              .updateToken(70)
              .then((refreshed) => {
                if (refreshed) {
                  setAuthToken();
                  setState((prev) => ({
                    ...prev,
                    token: keycloak.token || null,
                  }));
                }
              })
              .catch((error) => {
                console.error("Failed to refresh token:", error);
                // Handle failed refresh (e.g., redirect to login)
                keycloak.login();
              });
          },
          refreshTime > 0 ? refreshTime : 0
        );
      }
    };

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [state.isAuthenticated]);

  // Initialize Keycloak
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authenticated = await initKeycloak();

        if (authenticated) {
          setAuthToken();
          setState({
            isAuthenticated: true,
            user: keycloak.tokenParsed,
            loading: false,
            token: keycloak.token ?? null,
            error: null,
          });

          // Setup token refresh
          keycloak.onTokenExpired = () => {
            keycloak
              .updateToken(70)
              .then((refreshed) => {
                if (refreshed) {
                  setAuthToken();
                  setState((prev) => ({
                    ...prev,
                    token: keycloak.token ?? null,
                  }));
                }
              })
              .catch((error) => {
                console.error("Token refresh failed:", error);
                setState((prev) => ({
                  ...prev,
                  error: "Session expired. Please login again.",
                }));
                keycloak.login();
              });
          };
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
        }
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Authentication service initialization failed",
        }));
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      keycloak.onTokenExpired = () => {}; // Remove token expired handler
    };
  }, []);

  // Loading state
  if (state.loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};
