import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { CardTitle, Card, Form, Button } from 'reactstrap';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';

import { withToggle } from '../helpers';
import Subcard from './Subcard';
import SubcardHeader from './SubcardHeader';
import SubcardBody from './SubcardBody';
import CardBlock from './CardBlock';
import ErrorSection from './ErrorSection';
import { SaveButton } from './Buttons';
import { Pull, TextAlign } from './Utility';

const FLUSH_TIMEOUT = 700;
const enhance = withToggle(false);

class EntityManagerSubcard extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: props.open || null,
    };

    this.toggleOpen = this.toggleOpen.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.renderForms = this.renderForms.bind(this);
    this.renderEntities = this.renderEntities.bind(this);
  }

  onSubmit({ fields, index }) {
    const { onSave } = this.props;
    const flush = (entity) => {
      fields.remove(index);

      setTimeout(() => {
        this.scrollToEntity(entity);

        this.toggleOpen({ entity });
      }, FLUSH_TIMEOUT);
    };

    return (values, form) => onSave(
      values,
      {
        ...form,
        ownProps: {
          flush,
        },
      },
    );
  }

  scrollToEntity({ _id }) {
    document.getElementById(`subcard-${_id}`).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  toggleOpen({ entity }) {
    this.setState({ open: this.state.open === entity._id ? null : entity._id });
  }

  renderEntities() {
    const { entities, render } = this.props;
    const { open } = this.state;

    return !!entities.length && (
      <Card>
        {entities.map(entity => render({
          entity,
          isOpen: open === entity._id,
          toggle: this.toggleOpen,
        }))}
      </Card>
    );
  }

  renderForms() {
    const {
      newEntityTitle,
      newEntityButtonTitle,
      renderNewEntity,
      initialValues,
    } = this.props;

    return (
      <FinalForm
        onSubmit={() => null}
        subscription={{}}
        mutators={{ ...arrayMutators }}
        render={({
          mutators: { push },
        }) => (
          <Fragment>
            <Card className="new-cards">
              <FieldArray name="cards" subscription={{}}>
                {({ fields }) => fields.map((name, index) => (
                  <FinalForm
                    {...{ initialValues }}
                    key={name}
                    onSubmit={this.onSubmit({ fields, index })}
                    subscription={{
                      submitError: true,
                      submitting: true,
                      initialValues: true,
                    }}
                    render={({
                      handleSubmit,
                      submitError,
                      submitting,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Subcard disabled>
                          <SubcardHeader isNew>
                            {newEntityTitle}
                          </SubcardHeader>
                          <SubcardBody>
                            <ErrorSection errorText={submitError && <pre>{submitError}</pre>} />
                            {renderNewEntity(this.props)}
                            <CardBlock>
                              <Pull left>
                                <Button
                                  color="secondary"
                                  disabled={submitting}
                                  onClick={() => !submitting && fields.remove(index)}
                                >
                                  Delete
                                </Button>
                              </Pull>
                              <Pull right>
                                <SaveButton
                                  color="secondary"
                                  type="submit"
                                  isSaving={submitting}
                                />
                              </Pull>
                            </CardBlock>
                          </SubcardBody>
                        </Subcard>
                      </Form>
                    )}
                  />
                ))}
              </FieldArray>
            </Card>
            <TextAlign center>
              <div>
                <Button color="link" onClick={() => push('cards', undefined)}>
                  {newEntityButtonTitle}
                </Button>
              </div>
            </TextAlign>
          </Fragment>
        )}
      />
    );
  }

  render() {
    const {
      isOpen,
      toggle,
      title,
      entities,
    } = this.props;

    return (
      <Subcard {...{ isOpen, toggle }}>
        <SubcardHeader>
          <Pull left>
            <CardTitle>{title}</CardTitle>
          </Pull>
          <Pull right>
            <CardTitle>
              {entities.length || ''}
            </CardTitle>
          </Pull>
        </SubcardHeader>
        <SubcardBody>
          <CardBlock>
            {this.renderEntities()}
            {this.renderForms()}
          </CardBlock>
        </SubcardBody>
      </Subcard>
    );
  }
}

EntityManagerSubcard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  newEntityTitle: PropTypes.node.isRequired,
  newEntityButtonTitle: PropTypes.node.isRequired,
  entities: PropTypes.array.isRequired,
  render: PropTypes.func.isRequired,
  renderNewEntity: PropTypes.func.isRequired,
  open: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
};

export default enhance(EntityManagerSubcard);
