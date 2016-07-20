import { Template } from 'meteor/templating';

Template.SS_Card_Read.viewmodel({
  mixin: ['modal', 'nonconformity'],
  // NC from fixture: "Inquiry not recorded"
  NCId: "P98SExuNHZ4y8bhjc",
  organizationId: "KwKXz5RefrE5hjWJ2",
  autorun() {
    this.templateInstance.subscribe('NCImprovementPlan', this.NCId());
  },
  customIP: {
    "_id" : "7dNe83CStYvYj4r8b",
    "documentId" : "P98SExuNHZ4y8bhjc",
    "documentType" : "non-conformity",
    "desiredOutcome" : "Desired outcome",
    "createdAt" : new Date("2016-07-13T12:59:35.129Z"),
    "createdBy" : "SQHmBKJ94gJvpLKLt",
    "targetDate" : new Date("2016-07-24T21:00:00Z"),
    "updatedAt" : new Date("2016-07-13T13:00:09.700Z"),
    "updatedBy" : "SQHmBKJ94gJvpLKLt",
    "owner" : "MJ97dnvMYrJ35pMNq",
    "files" : [
      {
        "_id" : "vS9fqxuP5hupxGsZa",
        "name" : "examples.desktop",
        "extension" : "desktop",
        "url" : "https://plio.s3-eu-west-1.amazonaws.com/uploads/KwKXz5RefrE5hjWJ2/improvement-plans-files/undefined/7xHEQ7kkNqCxyjiWx-examples.desktop"
      }
    ]
  },
  customRisk: {
    "score": {
      "rowId": 1,
      "value": 95,
      "scoredBy": "SQHmBKJ94gJvpLKLt",
      "scoredAt": new Date("2016-04-01T11:00:00.000Z")
    },
    "treatmentPlan": {
      "comments": "New treatment plan",
      "prevLossExp": "Comment",
      "priority": "medium",
      "decision": "treat"
    }
  },
  emptyQuery() {
    // need for Subcards_Occurrences_Read && Subcards_NonConformities_Read
    return {};
  },
  NC() {
    return this._getNCByQuery({ _id: this.NCId() });
  },
  onOpenEditModalCb() {
    return this.openEditModal.bind(this);
  },
  openEditModal() {
    this.modal().open({
      _title: 'Standard subcards',
      template: 'SS_Card_Modal',
      NCId: this.NCId(),
      // custom: {
      //   NC: this.customNC(),
      //   IP: this.customIP(),
      //   Risk: this.customRisk(),
      //   emptyQuery: this.emptyQuery()
      // }
    });
  },
});
