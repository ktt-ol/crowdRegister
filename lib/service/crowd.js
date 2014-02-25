'use strict';

// https://developer.atlassian.com/display/CROWDDEV/Using+the+Crowd+REST+APIs
// https://developer.atlassian.com/display/CROWDDEV/Crowd+REST+Resources

// https://github.com/kriskowal/q
// https://npmjs.org/package/needle

var needle = require('needle');
var $q = require('q');

module.exports = function (config) {
  var self = this;
  var crowdConfig = config.crowd;

  var globalOptions = {
    headers: {
      Accept: 'application/json'
    },
    rejectUnauthorized: false,
    json: true,
    username: crowdConfig.appName,
    password: crowdConfig.appPassword
  };

  /* private functions */

  function req(params) {
    var deferred = $q.defer();
    needle.request(params.method, params.url, params.data || null, params.options || null, function callback(err, resp, body) {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve({
        response: resp,
        body: body
      });
    });

    return deferred.promise;
  }

  function updateUser(userData) {
    var updatedUser = {
      name: userData.login,
      active: userData.active,
      'first-name': userData.firstName,
      'last-name': userData.lastName,
      'display-name': userData.firstName + ' ' + userData.lastName,
      email: userData.email
    };

    return req({
      method: 'PUT',
      url: crowdConfig.endpoint + 'user?username=' + userData.login,
      options: globalOptions,
      data: updatedUser
    }).then(function ok(data) {
        if (data.response.statusCode === 204) {
          return 'Update ok: ' + userData.login;
        }

        throw makeError(data.response);
      });
  }

  function addUserToGroupPromise(login, groupname) {
    return req({
      method: 'POST',
      url: crowdConfig.endpoint + 'user/group/direct?username=' + login,
      options: globalOptions,
      data: {
        name: groupname
      }
    }).then(function ok(data) {
        if (data.response.statusCode === 201) {
          return 'Add success : ' + login + ' to ' + groupname;
        }

        throw makeError(data.response, 'User ' + login + ' not added to group ' + groupname);
      });
  }

  function removeUserFromGroupPromise(login, groupname) {
    return req({
      method: 'DELETE',
      url: crowdConfig.endpoint + 'user/group/direct?username=' + login + '&groupname=' + groupname,
      options: globalOptions
    }).then(function ok(data) {
        if (data.response.statusCode === 204) {
          return 'Delete success : ' + login + ' from ' + groupname;
        }

        throw makeError(data.response, 'User ' + login + ' not deleted from group ' + groupname);
      });
  }

  function stringifyNice(json) {
    return JSON.stringify(json, null, '  ');
  }

  function makeError(response, msg) {
    msg = (msg || '') + '\n';
    return new Error(msg + 'Unknown problem, statusCode: ' + response.statusCode +
      ', body:  ' + stringifyNice(response.body));
  }

  function logThis(result) {
    console.log('Result from server: ', stringifyNice(result));
  }

  /* public functions */

  this.ERROR_USER_NOT_FOUND = 'User not found in crowd.';

  this.getUserInfo = function (login) {
    return req({
      method: 'GET',
      url: crowdConfig.endpoint + 'user?username=' + login,
      options: globalOptions
    }).then(function ok(data) {
        var code = data.response.statusCode;
        if (code === 200) {
//          logThis(data.body);
          return {
            login: login,
            firstName: data.body['first-name'],
            lastName: data.body['last-name'],
            email: data.body.email,
            active: data.body.active
          };
        }
        if (code === 404) {
          throw new Error(self.ERROR_USER_NOT_FOUND);
        }

        throw makeError(data.response);
      });
  };

  this.ERROR_USER_DATA = 'User already exists or invalid password.';
  /**
   * @param {object} userData
   */
  this.createUser = function (userData) {
    var newUser = {
      name: userData.login,
      active: false,
      'first-name': userData.firstName,
      'last-name': userData.lastName,
      'display-name': userData.firstName + ' ' + userData.lastName,
      email: userData.email,
      password: {
        value: userData.password
      }
    };

    return req({
      method: 'POST',
      url: crowdConfig.endpoint + 'user',
      options: globalOptions,
      data: newUser
    }).then(function ok(data) {
        var code = data.response.statusCode;
        if (code === 201) {
          console.log('User created: ' + userData.email);
          return addUserToGroupPromise(userData.login, crowdConfig.groups.newUser);
        }
//    logThis(data.body);
        if (code === 400 && data.body.reason === 'INVALID_USER') {
          throw new Error(self.ERROR_USER_DATA);
        }

        throw makeError(data.response);
      }).then(function ok(data) {
        return 'New user success : ' + userData.email;
      });
  };


  this.listWaitingUser = function () {
    return req({
      method: 'GET',
      url: crowdConfig.endpoint + 'group/user/direct?groupname=' + crowdConfig.groups.newUser,
      options: globalOptions
    }).then(
      function ok(data) {
        var code = data.response.statusCode;
        if (code === 200) {
          return data.body.users.map(function (entry) {
            return entry.name;
          });
        }

        throw makeError(data.response);
      });
  };

  /**
   *
   * @param login
   * @param isMember
   * @returns {Promise} with userData
   */
  this.activateUser = function (login, isMember) {
    var requests = [];
    var userData;

    function addReqForGroup(groups) {
      groups.forEach(function (groupName) {
        requests.push(addUserToGroupPromise(login, groupName));
      });
    }

    // retrieve the user data, we need this later for the activation
    requests.push(self.getUserInfo(login));
    // add the groups
    addReqForGroup(crowdConfig.groups.defaultUser);
    if (isMember) {
      addReqForGroup(crowdConfig.groups.member);
    }
    return $q.all(requests).then(
      function groupAddOk(data) {
        console.log('add ok:', data);
        // save the user data
        userData = data[0];
        return removeUserFromGroupPromise(login, crowdConfig.groups.newUser);
      }).then(
      function groupRemoveOk() {
        // set activation status
        userData.active = true;
        return updateUser(userData);
      }).then(
      function allResults(data) {
        console.log('remove ok', data);
        return userData;
      });
  };
};