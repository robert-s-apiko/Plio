import 'raf/polyfill';
import 'jest-enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { mergeDeepRight } from 'ramda';
import fetch from 'unfetch';
import { Meteor } from 'meteor/meteor';

global.fetch = fetch;

Meteor.settings = mergeDeepRight(Meteor.settings, {
  public: {
    graphql: {
      url: '',
    },
  },
});

configure({ adapter: new Adapter() });
