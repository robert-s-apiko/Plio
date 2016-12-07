import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import invoke from 'lodash.invoke';
import property from 'lodash.property';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import curry from 'lodash.curry';

import { findById, extractIds } from '/imports/api/helpers';

Template.WorkInbox_List.viewmodel({
  share: 'search',
  mixin: [
    'search', 'collapsing', 'organization',
    'modal', 'workInbox', 'router',
    'user', 'nonconformity', 'risk',
    'utils', { STATUSES: 'workItemStatus' },
  ],
  autorun() {
    const list = this.list;

    if (list && !list.focused() && !list.animating() && !list.searchText()) {
      const workItemId = this.workItemId();
      const {
        result: contains,
        first: defaultDoc,
      } = this._findWorkItemForFilter(workItemId);

      if (!contains) {
        if (defaultDoc) {
          const { _id } = defaultDoc;

          Meteor.setTimeout(() => {
            this.goToWorkItem(_id);
            this.expandCollapsed(_id);
          }, 0);
        } else {
          const routeName = Tracker.nonreactive(() => FlowRouter.getRouteName());

          if (routeName !== 'workInbox') {
            Meteor.setTimeout(() => this.goToWorkInbox(), 0);
          }
        }
      }
    }
  },
  _findWorkItemForFilter(_id, filter = this.activeWorkInboxFilterId()) {
    const { my = {}, team = {} } = Object.assign({}, this.items());

    const results = (items) => ({
      result: findById(_id, items),
      first: _.first(items),
      array: items,
    });

    switch (filter) {
      case 1:
        return results(my.current);
      case 2:
        return results(team.current);
      case 3:
        return results(my.completed);
      case 4:
        return results(team.completed);
      case 5:
        return results(my.deleted);
      case 6:
        return results(team.deleted);
      default:
        return {};
    }
  },
  getActionsSearchQuery() {
    const fields = [{ name: 'title' }, { name: 'sequentialId' }];

    return this.searchObject('searchText', fields, this.isPrecise());
  },
  getPendingItems(_query = {}) {
    const linkedDocsIds = ['_getNCsByQuery', '_getRisksByQuery', '_getActionsByQuery']
        .map(prop => extractIds(this[prop](_query.isDeleted ? { isDeleted: true } : {})))
        .reduce((prev, cur) => [...prev, ...cur]);

    const workItems = this._getWorkItemsByQuery({
      ..._query,
      'linkedDoc._id': { $in: linkedDocsIds },
    }).fetch();

    return _(workItems)
      .map(item => ({ linkedDocument: item.getLinkedDoc(), ...item }))
      .filter((item) => {
        const searchFields = [{ name: 'title' }, { name: 'sequentialId' }, { name: 'type' }];
        const searchQuery = this.searchObject('searchText', searchFields, this.isPrecise());

        if (_.keys(searchQuery).length) {
          const [{ title }, { sequentialId }, { type }] = searchQuery.$or;

          return type.test(item.type) ||
                 title.test(item.linkedDocument.title) ||
                 sequentialId.test(item.linkedDocument.sequentialId);
        }

        return true;
      });
  },
  assignees() {
    const getItems = query => this.getPendingItems(query);
    const byStatus = (array, predicate) => (
      array.filter(({ assigneeId, status }) => assigneeId !== Meteor.userId() && predicate(status))
    );
    const sortByFirstName = (prop, array) => {
      const query = {
        _id: {
          $in: [...(() => array.map(property(prop)))()],
        },
      };
      const options = { sort: { 'profile.firstName': 1 } };
      const users = Meteor.users.find(query, options);
      const ids = extractIds(users);
      return ids;
    };

    const deletedActionsQuery = {
      ...this.getActionsSearchQuery(),
      isDeleted: true,
      deletedBy: { $ne: Meteor.userId() },
    };
    const deletedActions = this._getActionsByQuery(deletedActionsQuery).fetch();

    const current = sortByFirstName(
      'assigneeId',
      byStatus(getItems(), status => this.STATUSES.IN_PROGRESS().includes(status))
    );
    const completed = sortByFirstName(
      'assigneeId',
      byStatus(getItems(), status => this.STATUSES.COMPLETED() === status)
    );
    const deleted = sortByFirstName('deletedBy', deletedActions);

    return {
      current,
      completed,
      deleted,
    };
  },
  getTeamItems(userId, prop) {
    const { team = {} } = Object.assign({}, invoke(this, 'items', userId));
    return team[prop];
  },
  items(userId) {
    const byProp = curry((prop, predicate, array) => array.filter(item => predicate(item[prop])));
    const byStatus = byProp('status');
    const sortItems = array => (
      array.sort(({ targetDate: d1 }, { targetDate: d2 }) => d2 - d1)
    );
    const isInProgress = status => this.STATUSES.IN_PROGRESS().includes(status);
    const isCompleted = status => this.STATUSES.COMPLETED() === status;
    const getItems = (userQuery) => {
      const workItemsQuery = { assigneeId: userQuery, isDeleted: false };
      const workItems = sortItems(this.getPendingItems(workItemsQuery));
      const deletedQuery = {
        ...this.getActionsSearchQuery(),
        isDeleted: true,
        deletedBy: userQuery,
      };
      const deleted = sortItems(this._getActionsByQuery(deletedQuery).fetch());
      const current = byStatus(isInProgress, workItems);
      const completed = byStatus(isCompleted, workItems);

      return {
        current,
        completed,
        deleted,
      };
    };

    return {
      my: getItems(Meteor.userId()),
      team: getItems(userId || { $ne: Meteor.userId() }),
    };
  },
  onSearchInputValue() {
    return () => extractIds(this._findWorkItemForFilter().array);
  },
  onModalOpen() {
    return () =>
      this.modal().open({
        _title: 'Add',
        template: 'Actions_ChooseTypeModal',
        variation: 'simple',
      });
  },
});
