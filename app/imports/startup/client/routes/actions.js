import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import mount from './mount';

export const render = renderer => getComponent => options => async (...args) => {
  let opts = options || {};
  let component = await getComponent();

  if (component.default) component = component.default;

  if (typeof opts === 'function') opts = await options(...args);

  renderer(component, opts);
};

export const renderComponent = render(mount);

export const renderBlazeComponent = render(BlazeLayout.render.bind(BlazeLayout));

/* REACT */

export const renderStandards = renderComponent(async () =>
  import('../../../ui/react/standards/components/Provider'));

export const renderRisks = renderComponent(async () =>
  import('../../../ui/react/risks/components/Provider'));

export const renderCustomers = renderComponent(async () =>
  import('../../../ui/react/customers/components/Provider'));

export const renderHelpDocs = renderComponent(async () =>
  import('../../../ui/react/help-docs/components/HelpDocsProvider'));

export const renderTransitionalLayout = renderComponent(async () =>
  import('../../../ui/react/layouts/TransitionalLayout'));

/* BLAZE */

export const renderNcs = renderBlazeComponent(async () => {
  await Promise.all([
    import('../../../ui/layouts/non-conformities-layout'),
    import('../../../ui/pages/non-conformities-page'),
  ]);

  return 'NC_Layout';
})({ content: 'NC_Page' });

export const renderWorkInbox = renderBlazeComponent(async () => {
  await Promise.all([
    import('../../../ui/layouts/work-inbox-layout'),
    import('../../../ui/pages/work-inbox-page'),
  ]);

  return 'WorkInbox_Layout';
})({ content: 'WorkInbox_Page' });

export const renderUserDirectory = renderBlazeComponent(async () => {
  await Promise.all([
    import('../../../ui/layouts/user-directory-layout'),
    import('../../../ui/pages/user-directory-page'),
  ]);

  return 'UserDirectory_Layout';
})({ content: 'UserDirectory_Page' });

export const renderDashboard = renderBlazeComponent(async () => {
  await Promise.all([
    import('../../../ui/layouts/dashboard-layout'),
    import('../../../ui/pages/dashboard-page'),
  ]);

  return 'Dashboard_Layout';
})({ content: 'Dashboard_Page' });
