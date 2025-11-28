import * as Updates from "expo-updates";
import { useContext, useMemo } from "react";
import { ConfigurationContext } from "./lib/context/global/configuration.context";

const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

const deriveHttpOrigin = (restUrl: string) =>
  ensureTrailingSlash(restUrl.replace(/\/api(?:\/v\d+)?\/?$/, "/"));

const ensureGraphqlPath = (value: string) =>
  value.endsWith("graphql") ? value : `${ensureTrailingSlash(value)}graphql`;

const resolveRemoteRest = () =>
  process.env.EXPO_PUBLIC_SERVER_REST_URL ??
  process.env.SERVER_REST_URL ??
  "https://ftifto-backend.onrender.com/api/v1";

const resolveRemoteGraphql = (restUrl: string) =>
  process.env.EXPO_PUBLIC_GRAPHQL_URL ??
  ensureGraphqlPath(deriveHttpOrigin(restUrl));

const resolveRemoteWsGraphql = (restUrl: string) => {
  if (process.env.EXPO_PUBLIC_WS_GRAPHQL_URL) {
    return process.env.EXPO_PUBLIC_WS_GRAPHQL_URL;
  }

  const socketOrigin =
    process.env.EXPO_PUBLIC_SOCKET_URL ?? process.env.SOCKET_URL;

  if (socketOrigin) {
    return ensureGraphqlPath(socketOrigin);
  }

  const derivedWsOrigin = deriveHttpOrigin(restUrl).replace(/^https/, "wss");
  return ensureGraphqlPath(derivedWsOrigin);
};

const REMOTE_REST = resolveRemoteRest();

const LOCAL_GRAPHQL = "https://ftifto-backend.onrender.com/graphql";
const LOCAL_WS_GRAPHQL = "wss://ftifto-backend.onrender.com/graphql";
const REMOTE_GRAPHQL = resolveRemoteGraphql(REMOTE_REST);
const REMOTE_WS_GRAPHQL = resolveRemoteWsGraphql(REMOTE_REST);

const PRODUCTION_CHANNELS = ["production", "staging", "preview"];

const resolveChannel = () => {
  if (typeof Updates?.channel === "string") {
    return Updates.channel;
  }
  if (typeof Updates?.releaseChannel === "string") {
    return Updates.releaseChannel;
  }
  return "production";
};

export const isProduction = () => {
  if (__DEV__) {
    return false;
  }
  return PRODUCTION_CHANNELS.includes(resolveChannel());
};

const useGetEnvVars = () => {
  const configuration = useContext(ConfigurationContext);

  const shared = useMemo(
    () => ({
      ENVIRONMENT: isProduction() ? "production" : "development",
      GOOGLE_MAPS_KEY: configuration?.googleApiKey,
    }),
    [configuration?.googleApiKey],
  );

  const useLocalBackend =
    __DEV__ && (configuration?.useLocalBackend === true || configuration?.backendMode === "local");

  if (useLocalBackend) {
    return {
      GRAPHQL_URL: LOCAL_GRAPHQL,
      WS_GRAPHQL_URL: LOCAL_WS_GRAPHQL,
      ...shared,
    };
  }

  return {
    GRAPHQL_URL: REMOTE_GRAPHQL,
    WS_GRAPHQL_URL: REMOTE_WS_GRAPHQL,
    ...shared,
  };
};

export default useGetEnvVars;
