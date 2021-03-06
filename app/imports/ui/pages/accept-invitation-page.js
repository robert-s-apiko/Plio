import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Organizations } from '/imports/share/collections/organizations';
import { acceptInvitation } from '../../api/organizations/methods';
import { showError } from '/imports/api/helpers';


Template.AcceptInvitationPage.viewmodel({
  mixin: 'router',
  firstName: '',
  lastName: '',
  password: '',
  repeatPassword: '',
  invitationId: '',

  onCreated(template) {
    template.autorun(() => {
      const invitationId = FlowRouter.getParam('invitationId');
      this.invitationId(invitationId);
      template.subscribe('invitationInfo', invitationId);
    });
  },

  userEmail() {
    const user = Meteor.users.findOne({ invitationId: this.invitationId() });
    return user && user.emails && user.emails[0].address;
  },

  organization() {
    return Organizations.findOne();
  },

  organizationName() {
    const organization = this.organization();
    return organization && organization.name;
  },

  disabled() {
    return AccountsTemplates.disabled();
  },

  acceptInvitation() {
    AccountsTemplates.setDisabled(true);
    const userData = this.data();

    if (userData.password === userData.repeatPassword) {
      delete userData.repeatPassword;
      delete userData.invitationId;

      const args = {
        invitationId: this.invitationId(),
        userData,
      };

      const userEmail = this.userEmail();
      const orgSerialNumber = this.organization().serialNumber;

      acceptInvitation.call(args, (err, res) => {
        if (err) {
          showError(err.reason);
          AccountsTemplates.setDisabled(false);
        } else {
          this._loginUserWithPassword(userEmail, userData, orgSerialNumber);
        }
      });
    } else {
      showError('Passwords should match');
      AccountsTemplates.setDisabled(false);
    }
  },

  _loginUserWithPassword(email, userData, orgSerialNumber) {
    Meteor.loginWithPassword({ email }, userData.password, (err) => {
      if (err) {
        showError(err.reason);
      } else {
        this.goToDashboard(orgSerialNumber.toString());
      }
    });
  },
});
