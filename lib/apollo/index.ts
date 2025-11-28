import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  InMemoryCache,
  Observable,
  Operation,
  split,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

import * as SecureStore from "expo-secure-store";
import { DefinitionNode, FragmentDefinitionNode } from "graphql";
import { Subscription } from "zen-observable-ts";
import { STORE_FIREBASE_TOKEN, STORE_TOKEN } from "../utils/constants";
import { firebaseAuth } from "../services";
import { getCachedAuthToken, setCachedAuthToken } from "../utils/auth-token";

const getAuthorizationToken = async (): Promise<string | null> => {
  try {
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      setCachedAuthToken(idToken);
      return idToken;
    }
  } catch (error) {
    console.log("Unable to retrieve token from Firebase auth", error);
  }

  try {
    const firebaseToken = await SecureStore.getItemAsync(STORE_FIREBASE_TOKEN);
    if (firebaseToken) {
      setCachedAuthToken(firebaseToken);
      return firebaseToken;
    }
  } catch (error) {
    console.log("Unable to read stored Firebase token", error);
  }

  try {
    const legacyToken = await SecureStore.getItemAsync(STORE_TOKEN);
    if (legacyToken) {
      setCachedAuthToken(legacyToken);
      return legacyToken;
    }
  } catch (error) {
    console.log("Unable to read stored legacy token", error);
  }

  setCachedAuthToken(null);
  return null;
};

const setupApollo = (GRAPHQL_URL: string, WS_GRAPHQL_URL: string) => {
  const wsLink = new WebSocketLink({
    uri: WS_GRAPHQL_URL,
    options: {
      reconnect: true,
      connectionParams: () => {
        const token = getCachedAuthToken();
        if (token) {
          return {
            authorization: `Bearer ${token}`,
          };
        }
        return {};
      },
    },
  });
  const cache = new InMemoryCache();
  // eslint-disable-next-line new-cap
  const httpLink = createHttpLink({
    uri: GRAPHQL_URL,
  });

  const authLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle: Subscription;
        Promise.resolve(getAuthorizationToken())
          .then((token) => {
            operation.setContext({
              headers: {
                authorization: token ? `Bearer ${token}` : "",
              },
            });
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch((error) => observer.error(error));

        return () => {
          if (handle) handle.unsubscribe();
        };
      }),
  );

  // const terminatingLink = split(({ query }) => {
  //   const {
  //     kind,
  //     operation,
  //   }: OperationDefinitionNode | FragmentDefinitionNode =
  //     getMainDefinition(query);
  //   return kind === "OperationDefinition" && operation === "subscription";
  // }, wsLink);

  // Terminating Link
  const terminatingLink = split(({ query }) => {
    const definition = getMainDefinition(query) as
      | DefinitionNode
      | (FragmentDefinitionNode & {
          kind: string;
          operation?: string;
        });
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  }, wsLink);

  const client = new ApolloClient({
    link: concat(ApolloLink.from([terminatingLink, authLink]), httpLink),
    cache,
  });

  return client;
};

export default setupApollo;
