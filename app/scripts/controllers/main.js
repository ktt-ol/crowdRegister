'use strict';

angular.module('crowdRegisterApp').controller('MainCtrl',
  function ($scope, $http, Globals) {
    $scope.form = {
      waiting: false
    };
    $scope.page = {};
    $scope.error = {};

    $scope.test = function () {
      $scope.form.waiting = true;
    };

    $scope.submit = function () {
      var f = $scope.form;
      $scope.error = {};

      if (f.password !== f.passwordRepeat) {
        $scope.error.noPwMatch = true;
        return;
      }

      f.waiting = true;
      $http.post(Globals.ServicePrefix + 'api/user', f).then(
        function ok() {
          $scope.page.registrationSuccess = true;
        },function error(result) {
          if (result.status === 400) {
            $scope.error.userExists = true;
            return;
          }

          $scope.error = {
            misc: true,
            miscDetail: result.data.msg
          };
        }
      ).finally(function () {
          $scope.form.waiting = false;
        });
    };
  });
