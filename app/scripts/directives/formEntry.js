angular.module('crowdRegisterApp').directive('formEntry',
  function () {
    'use strict';

    return {
      scope: {
        type: '@',
        name: '@',
        label: '@',
        ngModel: '=',
        disabled: '=',
        invalid: '='
      },
      template: '<div class="form-group has-feedback" ng-class="{ \'has-warning\': invalid }">\n    <label class="control-label" for="{{name}}">{{label}}</label>\n    <input type="{{type}}" class="form-control" id="{{name}}" name="{{name}}" placeholder="{{label}}" \n           ng-model="ngModel" ng-disabled="disabled" required>\n    <span class="glyphicon warning-sign form-control-feedback" ng-if="invalid"></span>\n</div>',
      restrict: 'E'
    };
  });