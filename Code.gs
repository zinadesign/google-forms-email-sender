// Automatically Send Confirmation Emails from Google Forms.
// https://github.com/zinadesign/google-forms-email-sender

function onFormSubmit() {
  var params = {
    to: '', // Primary (visible) recipient address.
    cc: '', // Visible copies.
    bcc: '', // Hidden copies.
    replyTo: '', // Email for reply from user.
    name: '', // Name of company or site.
    subject: '{{formTitle}} — Request #{{date}}{{quotaNumber}}',
    timezone: 'GMT+3',
    dateFormat: 'Md', // Date format for {{date}}
    template: 'Template.html', // Email body template.
    emailFieldKeyword: 'email', // If a custom email field is used
    hiddenFieldsKeyword: '(hidden)', // Fields in the name of which this keyword is present are not shown in the letter to the submitter
    skipEmptyFields: true, // Skip in letter empty fields
  };

  // 1. Get all the necessary information from the form params and the data of the last form response:
  getInfo(params);

  // 2. Send an email to the Owner of the form:
  params.mailType = 'owner';
  sendMail(params);

  // 3. Send an email to the User, if he left an email:
  params.mailType = 'submitter';
  sendMail(params);
}

// Trigger installation: run once before the first test of the form.
function installTriggers() {
  ScriptApp.newTrigger('onFormSubmit').forForm(FormApp.getActiveForm()).onFormSubmit().create();
};

// Get all the necessary information from the form params and the data of the last form response
function getInfo(params) {
  params.remainingDailyQuota = MailApp.getRemainingDailyQuota() - 1;
  var form = FormApp.getActiveForm();
  params.formURL = form.getPublishedUrl(); // Form URL
  params.formTitle = form.getTitle(); // Form header
  params.formOwnerEmail = Session.getEffectiveUser().getEmail(); // Form owner email
  var formResponses = form.getResponses(); // List of all entries in the form
  var lastResponse = formResponses[formResponses.length - 1]; // Select the last entry in the form
  params.itemResponses = lastResponse.getItemResponses(); // Get an array with questions and answers
  params.submitterEmail = lastResponse.getRespondentEmail(); // If the "Collect email addresses" option is enabled
  if (params.submitterEmail !== '') {
    params.collectEmailAddresses = true;
  } else { // Let's try to find the user email
    params.collectEmailAddresses = false;
    if (params.emailFieldKeyword !== '') { // Search the email field
      for (var t = 0; t < params.itemResponses.length; t++) {
        var responseTitle = params.itemResponses[t].getItem().getTitle();
        if (responseTitle.search(new RegExp(params.emailFieldKeyword, "i")) !== -1) {
          var responseText = params.itemResponses[t].getResponse().toString();
          params.submitterEmail = responseText;
        }
      }
    }
  }
  return params;
}

function sendMail(params) {
  if (params.mailType == "submitter" && params.submitterEmail == '') {
    return; // stop working if we don’t have a user email
  }
  var to = params.to;
  var cc = params.cc;
  var bcc = params.bcc;
  var replyTo = params.replyTo;
  var name = params.name;
  if (params.mailType == "owner") { // Letter to the form owner
    if (to == '') {
      to = params.formOwnerEmail;
    }
    if (params.submitterEmail !== '') {
      replyTo = params.submitterEmail;
    }
  }
  if (params.mailType == "submitter") { // Letter to the user who submitted the form
    to = params.submitterEmail;
    cc = '';
    bcc = '';
  }
  var subject = generateSubject(params.subject,params.timezone,params.dateFormat,params.remainingDailyQuota,params.formTitle);
  var mailTemplate = HtmlService.createTemplateFromFile(params.template);
  var htmlBody = generateHtmlBody(params,mailTemplate,to);
  MailApp.sendEmail({ to: to, cc: cc, bcc: bcc, replyTo: replyTo, name: name, subject: subject, htmlBody: htmlBody });
}

// Generate email Subject
function generateSubject(subject,timezone,dateFormat,remainingDailyQuota,formTitle) {
  if (subject == '') {
    var subject = formTitle;
  } else {
    var date = Utilities.formatDate(new Date(), timezone, dateFormat);
    var quotaNumber = 100 - remainingDailyQuota;
    subject = subject.replace('{{formTitle}}', formTitle);
    subject = subject.replace('{{date}}', date);
    subject = subject.replace('{{quotaNumber}}', quotaNumber);
  }
  return subject;
}

// Generate email Body from the template
function generateHtmlBody(params,template,to) {
  template.mailType = params.mailType;
  template.to = to;
  template.submitterEmail = params.submitterEmail;
  template.name = params.name;
  template.remainingDailyQuota = params.remainingDailyQuota;
  template.formTitle = params.formTitle;
  template.formURL = params.formURL;
  template.responsesTable = generateResponsesTable(params.itemResponses,params.submitterEmail,params.collectEmailAddresses,params.skipEmptyFields,params.hiddenFieldsKeyword); // User response in table format
  template.responsesList = generateResponsesList(params.itemResponses,params.submitterEmail,params.collectEmailAddresses,params.skipEmptyFields,params.hiddenFieldsKeyword); // User responses in list format
  template.hiddenTable = generateHiddenFieldsTable(params.itemResponses,params.hiddenFieldsKeyword); // Table of hidden fields
  template.hiddenList = generateHiddenFieldsList(params.itemResponses,params.hiddenFieldsKeyword); // List of hidden fields
  var htmlBody = template.evaluate().getContent();
  return htmlBody;
}

// Table of questions and answers:
function generateResponsesTable(itemResponses,submitterEmail,collectEmailAddresses,skipEmptyFields,hiddenFieldsKeyword) {
  Logger.log('1');
  var responsesTable = '<table>\n';
  if (collectEmailAddresses == true && submitterEmail !== undefined && submitterEmail !== '') {
    responsesTable += ''
    + '<tr>\n'
    + '  <td><strong>Email</strong></td>\n'
    + '  <td>' + submitterEmail + '</td>\n'
    + '</tr>\n';
  }
  for (var t = 0; t < itemResponses.length; t++) {
    var responseTitle = itemResponses[t].getItem().getTitle();
    var responseText = itemResponses[t].getResponse().toString();
    if (hiddenFieldsKeyword !== '' && responseTitle.includes(hiddenFieldsKeyword)) { continue; }
    if (skipEmptyFields == true && responseText == '') { continue; }
    if (responseText == '') { responseText = '—'; }
    responsesTable += ''
    + '<tr>\n'
    + '  <td><strong>' + responseTitle + '</strong></td>\n'
    + '  <td>' + responseText + '</td>\n'
    + '</tr>\n';
  }
  responsesTable += '</table>\n';
  Logger.log('responsesTable: '+responsesTable);
  return responsesTable;
}

// List of questions and answers:
function generateResponsesList(itemResponses, submitterEmail,collectEmailAddresses,skipEmptyFields,hiddenFieldsKeyword) {
  var responsesList = '<ul>\n';
  if (collectEmailAddresses == true && submitterEmail !== undefined && submitterEmail !== '') {
    responsesList += '<li><strong>Email</strong> — ' + submitterEmail + '</li>\n';
  }
  for (var l = 0; l < itemResponses.length; l++) {
    var responseTitle = itemResponses[l].getItem().getTitle();
    var responseText = itemResponses[l].getResponse().toString();
    if (hiddenFieldsKeyword !== '' && responseTitle.includes(hiddenFieldsKeyword)) { continue; }
    if (skipEmptyFields == true && responseText == '') { continue; }
    responsesList += '<li><strong>' + responseTitle + '</strong> — ' + itemResponses[l].getResponse().toString() + '</li>\n';
  }
  responsesList += '</ul>\n';
  return responsesList;
}

// Table of hidden fields:
function generateHiddenFieldsTable(itemResponses,hiddenFieldsKeyword) {
  if (hiddenFieldsKeyword == '' || hiddenFieldsKeyword == undefined) {
    var hiddenTable = '';
  } else {
    var hiddenTable = '<table>\n';
    for (var t = 0; t < itemResponses.length; t++) {
      var responseTitle = itemResponses[t].getItem().getTitle();
      if (responseTitle.includes(hiddenFieldsKeyword)) {
        var responseText = itemResponses[t].getResponse().toString();
        if (responseText == '') { responseText = '—'; }
        hiddenTable += ''
        + '<tr>\n'
        + '  <td><strong>' + responseTitle + '</strong></td>\n'
        + '  <td>' + responseText + '</td>\n'
        + '</tr>\n';
      }
    };
    hiddenTable += '</table>\n';
  }
  return hiddenTable;
}

// List of hidden fields:
function generateHiddenFieldsList(itemResponses,hiddenFieldsKeyword) {
  if (hiddenFieldsKeyword == '' || hiddenFieldsKeyword == undefined) {
    var hiddenList = '';
  } else {
    var hiddenList = '<ul>\n';
    for (var l = 0; l < itemResponses.length; l++) {
      var responseTitle = itemResponses[l].getItem().getTitle();
      if (responseTitle.includes(hiddenFieldsKeyword)) {
        hiddenList += '<li><strong>' + responseTitle + '</strong> — ' + itemResponses[l].getResponse().toString() + '</li>\n';
      }
    }
    hiddenList += '</ul>\n';
  }
  return hiddenList;
}
