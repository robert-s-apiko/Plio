import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import introspectionQueryResultData from '../../../fragmentTypes.json';

const GRAPHQL_URL = Meteor.settings.public.graphql.url;

const isSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(({ kind, operation }) =>
    kind === 'OperationDefinition' && operation === 'subscription');

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const subscriptionClient = new SubscriptionClient(
  GRAPHQL_URL.replace('graphql', 'subscriptions').replace(
    /https?/,
    process.env.NODE_ENV === 'production' ? 'wss' : 'ws',
  ),
  {
    reconnect: true,
    lazy: true,
    inactivityTimeout: 0,
    timeout: 30000,
    connectionParams: {
      'meteor-login-token': Accounts._storedLoginToken(),
    },
  },
);

subscriptionClient.onDisconnected((...args) => {
  console.log('ws disconnected', ...args);
});
subscriptionClient.onError((error) => {
  console.log('ws error', error);
});

const wsLink = new WebSocketLink(subscriptionClient);
const httpLink = new BatchHttpLink({ uri: GRAPHQL_URL });
const meteorAccountsLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      'meteor-login-token': Accounts._storedLoginToken(),
    },
  });
  return forward(operation);
});
const queryLink = meteorAccountsLink.concat(httpLink);

const link = ApolloLink.split(
  isSubscriptionOperation,
  wsLink,
  queryLink,
);

const cache = new InMemoryCache({
  fragmentMatcher,
}).restore(window.__APOLLO_STATE__);

const client = new ApolloClient({
  link,
  cache,
});

export default client;
