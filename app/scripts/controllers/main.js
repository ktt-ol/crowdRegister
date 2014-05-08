'use strict';

angular.module('crowdRegisterApp').controller('MainCtrl',
  function ($scope, $http, Globals) {

    function validateEmail(email) {
      // regular expression taken from https://github.com/chriso/validator.js
      var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
      return regExp.test(email);
    }

    $scope.form = {
      waiting: false
    };
    $scope.page = {};
    $scope.error = null;

    $scope.test = function () {
      $scope.form.waiting = true;
    };

    $scope.submit = function () {
      var f = $scope.form;
      $scope.error = null;

      if (!validateEmail(f.email)) {
        $scope.error = { email: true };
        return;
      }

      if (f.password !== f.passwordRepeat) {
        $scope.error = { noPwMatch: true };
        return;
      }

      f.waiting = true;
      $http.post(Globals.ServicePrefix + 'api/user', f).then(
        function ok() {
          $scope.page.registrationSuccess = true;
        }, function error(result) {
          if (result.status === 400) {
            $scope.error = { userExists: true };
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
