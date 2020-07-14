const sgMail = require('@sendgrid/mail');

const sendgridAPIKey =
  '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';

sgMail.setApiKey(sendgridAPIKey);

const sendEmail = (name, email) => {
  const msg = {
    to: email,
    from: 'rijuvijayan@gmail.com',
    subject: `Account creation - ${name}`,
    text: `Hi ${name}, Thanks for creating an account. Let us know how you feel about it`,
  };
  sgMail.send(msg);
};

module.exports = {
  sendEmail,
};
