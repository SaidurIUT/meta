// import Keycloak from "keycloak-js";
// // import Cookies from "../../node_modules/@types/js-cookie";
// import Cookies from "js-cookie";

// const keycloakConfig = {
//   url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8181",
//   realm: "meta",
//   clientId: "metahive",
//   credentials: {
//     secret: "TskqDBGM15Y5uShd1YvmVkjZ5hPrZOLj",
//   },
//   publicClient: true,
// };

// export const keycloak = new Keycloak(keycloakConfig);

// export const initKeycloak = () => {
//   return keycloak.init({
//     onLoad: "check-sso",
//     // silentCheckSsoRedirectUri:
//     //   window.location.origin + "/silent-check-sso.html",
//     enableLogging: true,
//     checkLoginIframe: false,
//     pkceMethod: "S256",
//   });
// };

// export const setAuthToken = () => {
//   if (keycloak.token) {
//     Cookies.set("token", keycloak.token, { expires: 1 / 24 }); // 1 hour expiry
//   }
// };

import Keycloak from "keycloak-js";
import Cookies from "js-cookie";

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8181",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "meta",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "metahive",
  credentials: {
    secret: process.env.NEXT_PUBLIC_KEYCLOAK_SECRET,
  },
  publicClient: true,
};

export const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = () => {
  return keycloak.init({
    onLoad: "check-sso",
    enableLogging: true,
    checkLoginIframe: false,
    pkceMethod: "S256",
  });
};

export const setAuthToken = () => {
  if (keycloak.token) {
    Cookies.set("token", keycloak.token, {
      expires: 1 / 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
};

export const getAuthToken = () => {
  return Cookies.get("token");
};

export const removeAuthToken = () => {
  Cookies.remove("token");
};

export const updateToken = (minValidity: number = 5) => {
  return keycloak.updateToken(minValidity);
};
