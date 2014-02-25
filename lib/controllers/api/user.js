var express = require('express');
var CrowdService = require('../../service/crowd');
var MailService = require('../../service/mail');

module.exports = function (app, config, srv) {
  var crowd = new CrowdService(config);
  var mail = new MailService(config);

  var auth = express.basicAuth(config.admin.user, config.admin.password);

  app.namespace('/user', function () {

    // list all waiting user
    app.get('/waiting', auth, function (req, res) {
      crowd.listWaitingUser().then(
        function ok(data) {
          res.json(data);
        }, function error(err) {
          res.json(500, { msg: err.message });
        });
    });

    // fully activate an user
    app.put('/waiting/:login', auth, function (req, res) {
      if (!req.params.login) {
        res.send(400);
        return;
      }

      console.log('in put', req.params.login, req.body.isMember);

      crowd.activateUser(req.params.login, req.body.isMember).then(
        function ok(user) {
          mail.sendActivationMail(user);
          res.send(200);
        }, function error(err) {
          res.json(500, { msg: err.message });
        });
    });

    // user info
    app.get('/:login', auth, function (req, res) {
      crowd.getUserInfo(req.params.login).then(
        function ok(data) {
          res.json(data);
        },
        function error(err) {
          if (err.message === crowd.ERROR_USER_NOT_FOUND) {
            return res.json(404, { msg: err.message });
          }
          res.json(500, { msg: err.message });
        });
    });

    // new user
    app.post('/', function (req, res) {
//      {
//        login: '',
//        firstName: '',
//        lastName: '',
//        email: '',
//        password: ''
//      }
      crowd.createUser(req.body).then(
        function ok(result) {
          // new user created!
          // --> send mail
          mail.sendNewUserMail(req.body);

          res.send(201);
        }, function error(err) {
          if (err.message === crowd.ERROR_USER_DATA) {
            return res.json(400, { msg: err.message });
          }
          res.json(500, { msg: err.message });
        });
    });

  });
};
