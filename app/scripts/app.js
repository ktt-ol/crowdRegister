'use strict';

angular.module('crowdRegisterApp', [
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider, $locationProvider, $provide) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/admin', {
        templateUrl: 'partials/admin',
        controller: 'AdminCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(false);

    $provide.constant('Globals', {});
  });

angular.module('crowdRegisterApp').run(
  function ($window, Globals) {
    Globals.ServicePrefix = $window.location.pathname;
  });