// Automatically Send Confirmation Emails from Google Forms.
// https://github.com/zinadesign/google-forms-email-sender

function onFormSubmit() {
  var params = {
    to: '', // Primary (visible) recipient address. Multiple addresses are allowed, separated by commas. If empty, there will be an email from which the form is created.
    cc: '', // Visible copies.
    bcc: '', // Hidden copies.
    replyTo: '', // If empty, the response will be to the email from which the form was created.
    name: '', // Name of company or site.
    subject: '{{formTitle}} — Request #{{date}}{{quotaNumber}}', // Email subject. If empty, there will be a form heading.
    mailTemplate: 'Template.html', // Email Template File. If empty, the standard template will be used.
    GMT: 'GMT+3', // Timezone.
    dateFormat: 'Md', // Date format for {{date}}
  };

  // 1. Get the contents of the letter template, if specified:
  if (params.mailTemplate != '') {
    params.mailTemplate = HtmlService.createTemplateFromFile(params.mailTemplate);
  }

  // 2. We will get all the necessary information from the form params and the data of the last form response:
  lib.getInfo(params);

  // 3. Send an email to the owner of the form:
  params.mailType = 'owner';
  lib.sendMail(params);

  // ...and to the user, if he left an email:
  params.mailType = 'submitter';
  lib.sendMail(params);
}

// Trigger installation: run once before the first test of the form.
function installTriggers() {
  ScriptApp.newTrigger('onFormSubmit').forForm(FormApp.getActiveForm()).onFormSubmit().create();
};

