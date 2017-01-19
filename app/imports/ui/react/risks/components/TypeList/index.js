import React, { PropTypes } from 'react';
import cx from 'classnames';

import { CollectionNames } from '/imports/share/constants';
import { createTypeItem } from '../../../helpers/createTypeItem';
import LHSItemContainer from '../../../containers/LHSItemContainer';
import RisksListContainer from '../../containers/RisksListContainer';
import LabelMessagesCount from '../../../components/Labels/LabelMessagesCount';
import { TYPE_UNCATEGORIZED } from '../../constants';

const TypeList = ({ types, onToggleCollapse }) => (
  <div>
    {types.map(type => (
      <LHSItemContainer
        key={type._id}
        item={createTypeItem(CollectionNames.RISK_TYPES, type._id)}
        // TODO: move to separated helper
        lText={cx(type.title, type.abbreviation && `(${type.abbreviation})`)}
        rText={type.unreadMessagesCount && (
          <LabelMessagesCount count={type.unreadMessagesCount} />
        )}
        hideRTextOnCollapse
        onToggleCollapse={onToggleCollapse}
      >
        <div className="sub">
          <RisksListContainer risks={type.risks} />
        </div>
      </LHSItemContainer>
    ))}
  </div>
);

TypeList.propTypes = {
  types: PropTypes.array.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
};

export default TypeList;
