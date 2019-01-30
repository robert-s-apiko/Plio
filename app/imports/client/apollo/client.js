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
  GRAPHQL_URL.replace('graphql', 'subscriptions').replace(/https?/, 'ws'),
  {
    reconnect: true,
    reconnectionAttempts: 5,
    connectionParams: {
      'meteor-login-token': Accounts._storedLoginToken(),
    },
  },
);

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
