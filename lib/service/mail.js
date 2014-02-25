'use strict';

var mail = require('nodemailer');
var _ = require('lodash');

module.exports = function (config) {
  var self = this;


  /* private functions */
  function checkEnv(mailTemplateName) {
    if (!config.mail || !config.mail.enabled) {
      console.log('Skip sending mail for "' + mailTemplateName + '", because mail is disabled in configuration.');
      return false;
    }

    if (!config.mail.templates) {
      console.log('No mail templates configured!');
      return false;
    }

    if (!config.mail.templates[mailTemplateName]) {
      console.log('No mail template found for ' + mailTemplateName);
      return false;
    }

    return true;
  }

  function sendMail(recipient, subject, body) {
    var transport = mail.createTransport('SMTP', config.mail.smtpConfig);
    transport.sendMail({
        from: config.mail.senderAddress,
        to: recipient,
        subject: subject,
        text: body
      },
      function (err, response) {
        if (err) {
          console.error('Error sending mail to ' + recipient, err);
        } else {
          console.log('Mail successfully send! (to ' + recipient + ')');
        }

        transport.close(); // close the pool
      });
  }

  function getMailContent(mailTemplateName, variables) {
    var tpl = config.mail.templates[mailTemplateName];
    var result = {};
    ['subject', 'body'].forEach(function (type) {
      var content = tpl[type];
      _.forIn(variables, function (value, key) {
        content = content.replace('$' + key + '$', value);
      });
      result[type] = content;
    });

    return result;
  }

  /* public functions */

  this.sendNewUserMail = function (user) {
    var templateName = 'new-user';
    if (!checkEnv(templateName)) return;

    // don't modify the user object, but use it as default
    var variables = _.assign({
      'url': config.urlToThisService + '#/admin'
    }, user);
    var content = getMailContent(templateName, variables);

    sendMail(config.mail.adminAddress, content.subject, content.body);
  };

  this.sendActivationMail = function (user) {
    var templateName = 'confirmation';
    if (!checkEnv(templateName)) return;

    // don't modify the user object, but use it as default
    var variables = user;
    var content = getMailContent(templateName, variables);

    sendMail(user.email, content.subject, content.body);
  };
};
