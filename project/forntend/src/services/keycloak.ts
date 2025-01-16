import Keycloak from "keycloak-js";
import Cookies from "js-cookie";

const keycloakConfig = {
  url: "http://localhost:8181",
  realm: "meta",
  clientId: "metahive",
  credentials: {
    secret: "TskqDBGM15Y5uShd1YvmVkjZ5hPrZOLj",
  },
  publicClient: true,
};

export const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = () => {
  return keycloak.init({
    onLoad: "check-sso",
    // silentCheckSsoRedirectUri:
    //   window.location.origin + "/silent-check-sso.html",
    enableLogging: true,
    checkLoginIframe: false,
    pkceMethod: "S256",
  });
};

export const setAuthToken = () => {
  if (keycloak.token) {
    Cookies.set("token", keycloak.token, { expires: 1 / 24 }); // 1 hour expiry
  }
};
