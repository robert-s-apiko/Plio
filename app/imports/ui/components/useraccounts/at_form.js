// Simply 'inherites' helpers from AccountsTemplates
Template.atForm.helpers(AccountsTemplates.atFormHelpers);

Template.atForm.events({
  'focusout input#at-field-email': function(e, tpl) {
    const email = e.target.value;

    if (!email.length) return;

    const regex = /[a-z0-9._%+-]+@([a-z0-9.-]+)\.[a-z]{2,}/i;
    const match = email.match(regex);
    const orgName = match ? match[1] : null;

    if (orgName)
      tpl.$('input#at-field-companyName').val(orgName);
  }
});