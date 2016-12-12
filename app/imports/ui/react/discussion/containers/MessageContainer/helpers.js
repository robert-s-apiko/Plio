import { FlowRouter } from 'meteor/kadira:flow-router';
import { Autolinker } from 'meteor/konecty:autolinker';
import React from 'react';

import { getFormattedDate } from '/imports/share/helpers';
import { invokeC } from '/imports/api/helpers';
import { TruncatedStringLengths } from '/imports/api/constants';

import FileItemContainer from '../../../fields/read/containers/FileItemContainer';

// Helpers

export const invokeUser = path => obj => invokeC(path, obj.user);

// Prop creators

export const getMessagePath = (props) => {
  const currentRouteName = FlowRouter.getRouteName();
  const params = FlowRouter.current().params;
  const queryParams = { at: props._id };

  return FlowRouter.path(currentRouteName, params, queryParams);
};

export const getUserAvatar = invokeUser('avatar');

export const getUserFullNameOrEmail = invokeUser('fullNameOrEmail');

export const getUserFirstName = invokeUser('firstName');

export const getMessageTime = props => getFormattedDate(props.createdAt, 'h:mm A');

export const getMessageContents = (props) => {
  switch (props.type) {
    case 'text':
      const createMarkup = () => ({
        __html: Autolinker.link(props.text || '', {
          truncate: TruncatedStringLengths.c40
        })
      });
      return <span dangerouslySetInnerHTML={createMarkup()}></span>;
    case 'file':
      return props.fileId && <FileItemContainer _id={props.fileId} />;
    default:
      return props.text;
  }
};

export const getPathToMessage = (props) => {
  const currentRouteName = FlowRouter.getRouteName();
  const params = FlowRouter.current().params;
  const queryParams = { at: props._id };

  return FlowRouter.path(currentRouteName, params, queryParams);
};

export const getPathToMessageToCopy = (props) => {
  const path = getPathToMessage(props);
  const url = `${location.protocol}//${location.hostname}:${location.port}`;

  return `${url}${path}`;
};

export const getClassName = (props) => {
  const first = props.isMergedWithPreviousMessage ? '' : 'first';
  const selected = props.isSelected ? 'selected' : '';

  return `${first} ${selected}`;
};
