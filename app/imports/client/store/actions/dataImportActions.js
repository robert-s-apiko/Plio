import {
  SET_DATA_IMPORT_OWN_ORGS,
  SET_DATA_IMPORT_ORGS_LOADING,
  SET_DATA_IMPORT_ORGS_LOADED,
  SET_DATA_IMPORT_ORGS_COLLAPSED,
  SET_DATA_IMPORT_MODAL_OPENED_STATE,
} from './types';

export function setOwnOrgs(ownOrganizations) {
  return {
    type: SET_DATA_IMPORT_OWN_ORGS,
    payload: { ownOrganizations },
  };
}

export function setOrgsLoading(isLoading) {
  return {
    type: SET_DATA_IMPORT_ORGS_LOADING,
    payload: { isLoading },
  };
}

export function setOrgsLoaded(isLoaded) {
  return {
    type: SET_DATA_IMPORT_ORGS_LOADED,
    payload: { isLoaded },
  };
}

export function setOrgsCollapsed(areOrgsCollapsed) {
  return {
    type: SET_DATA_IMPORT_ORGS_COLLAPSED,
    payload: { areOrgsCollapsed },
  };
}

export function setModalOpenedState(isModalOpened) {
  return {
    type: SET_DATA_IMPORT_MODAL_OPENED_STATE,
    payload: { isModalOpened },
  };
}
