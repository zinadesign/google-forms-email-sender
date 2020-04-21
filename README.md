# Google Forms Email Sender

Automatically Send Confirmation Emails from Google Forms.

## Table of Content

* [Install Email Sender to Google Form](#install-email-sender-to-google-form)
* [Quotas for Emails per day](#quotas-for-emails-per-day)
* [Configure Email Sender](#configure-email-sender)

## Install Email Sender to Google Form

1. Create a Google Form: https://docs.google.com/forms/
2. Click **Menu** → **Script editor**:

<p><img src="https://raw.githubusercontent.com/romychvk/google-forms-email-sender/master/doc/img/google-forms-email-sender-1.png" width="681" alt="Google Forms Email Sender"></p>

3. Copy and paste code from [Code.gs](Code.gs).
4. Create template file: **File** → **New** → **HTML file**, Enter new file name: `Template`.
5. Copy and paste code from [Template.html](Template.html).
6. Run once function `installTriggers`: **Select function** → **installTriggers** → press **Play** button.

<p><img src="https://raw.githubusercontent.com/romychvk/google-forms-email-sender/master/doc/img/google-forms-email-sender-2.png" alt="Google Forms Email Sender"></p>

7. Allow permissions on next pop-ups:

<p><img src="https://raw.githubusercontent.com/romychvk/google-forms-email-sender/master/doc/img/google-forms-email-sender-3.png" width="500"  alt="Google Forms Email Sender"></p>

8. Test Email Sender: go to your form, click **Preview** icon, fill form and submit, check your email box.

<p><img src="https://raw.githubusercontent.com/romychvk/google-forms-email-sender/master/doc/img/google-forms-email-sender-4.png" alt="Google Forms Email Sender"></p>

## Quotas for Emails per day

Keep in mind that each additional email address in the settings is an additional email recipient.

Google Apps Script services impose [daily quotas](https://developers.google.com/apps-script/guides/services/quotas) on email recipients per day:

* Free edition (*@gmail.com) — 100 letters per day
* G Suite — 1500 letters per day

The size of the remaining daily quota is displayed in the bottom of the letter to the form owner — see `<?= remainingDailyQuota ?>` in the **Template.html**.

## Configure Email Sender

All settings are set in the main script **Code.gs**:

```javascript
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
  };
```

Emails for fields **to**, **cc**, **bcc**, **replyTo** can be written in two forms:

> `'user@domain.com'`<br>
> `'User Name «Company» <user@domain.com>'`

Multiple email addresses are allowed, separated by commas:

> `'user@domain.com, info@example.com'`

If the **to** field is empty, the letter will be sent to the email address of the form owner.

Similarly if the **replyTo** field is empty, if the user decides to respond to the letter, the email of the owner of the form will be substituted as the recipient.

If **subject** field is empty, it will be substituted a form heading.

A number **{{date}}{{quotaNumber}}** in the subject line is needed so that Gmail does not group letters in chains.

Formats **dateFormat** according to specification described in [SimpleDateFormat](https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html).

The main text of the letter is edited in the **Template.html**.
