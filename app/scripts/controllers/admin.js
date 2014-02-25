'use strict';

angular.module('crowdRegisterApp').controller('AdminCtrl',
  function ($scope, $http, Globals) {

    $scope.userList = [];
    $scope.error = {};
    $scope.active = {};


    $http.get(Globals.ServicePrefix + 'api/user/waiting').then(
      function ok(result) {
        $scope.userList = result.data.map(function (login) {
          return {
            login: login
          };
        });
      },
      function error(result) {
        if (result.status === 401) {
          // wrong credentials!
          $scope.error.credentials = true;
          return;
        }

        $scope.error.misc = true;
        $scope.error.miscDetails = result.data.msg;
      }
    );

    $scope.info = function (user) {
      $http.get(Globals.ServicePrefix + 'api/user/' + user.login).then(
        function ok(result) {
          user.email = result.data.email;
          user.firstName = result.data.firstName;
          user.lastName = result.data.lastName;
        }, function error(result) {
          $scope.error.misc = true;
          $scope.error.miscDetails = result.data.msg;
        }
      ); // end then
    };

    $scope.activate = function (user, addMemberGroup) {
      $scope.active.activate = true;
      $http.put(Globals.ServicePrefix + 'api/user/waiting/' + user.login, {
        isMember: addMemberGroup
      }).then(
        function ok() {
          user.activated = true;
        },function error(result) {
          $scope.error.misc = true;
          $scope.error.miscDetails = result.data.msg;
        }).finally(function () {
          $scope.active.activate = false;
        });
    };
  });