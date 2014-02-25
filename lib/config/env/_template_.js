'use strict';

/**
 * This is a template file!
 *
 * Copy this file to all.js AND change the "env" variable below.
 * You can also create files for certain profiles, e.g. production.js or development.js and put some parts of this
 * configuration in there, e.g. a different admin passowrd for the production.js.
 */

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  // should be named after the file, e.g. 'all' or 'production'
  env: 'CHANGE ME',

  root: rootPath,
  port: process.env.PORT || 3000,

  // WITH ending slash!
  urlToThisService: 'https://some_server/register/',

  admin: {
    user: 'user',
    password: 'very_secret'
  },

  crowd: {
    endpoint: 'https://your_crowd_server/crowd/rest/usermanagement/latest/',
    // you find the name and password in your crowd.properties file (located in crowd home)
    appName: 'crowd',
    appPassword: 'crow_pw',
    // all the following groups must exist!
    groups: {
      newUser: '_new_',
      defaultUser: [
        'confluence-users',
        'jira-developers',
        'jira-users'
      ],
      member: [ 'Member' ]
    }
  },

  mail: {
    // if you want to have emails, you MUST enable this
    enabled: false,

    smtpConfig: {
      host: 'localhost',
      port: 25
      // if you need auth, uncomment the following lines
//      ,auth: {
//        user: 'youraccount@gmail.com',
//        pass: 'secret'
//      }
    },

    // the contact of the admin
    adminAddress: 'your_email@somehost',
    // outgoing mails have this address as sender
    senderAddress: 'the_system@somehost',

    templates: {
      'new-user': {
        subject: 'New user $login$',
        body: 'Hello admin,\n\nwe have a new user:\n  $login$\n  $firstName$ $lastName$ ($email$)\n  \nPlease visit $url$. \n\n\nThe system.\n'
      },
      'confirmation': {
        subject: 'Your account has been activated!',
        body: 'Hello $firstName$,\n \nyou\'ve been actived.\n \n Username: $login$\n Email:   $email$\n Password: choosen by yourself!\n \nBest regards,\nthe System.'
      }
    }
  }
};