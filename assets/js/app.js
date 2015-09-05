/* ============================================================
 * File: app.js
 * Configure global module dependencies. Page specific modules
 * will be loaded on demand using ocLazyLoad
 * ============================================================ */

'use strict';

angular.module('app', [
    'ui.router',
    'ui.utils',
    'oc.lazyLoad',
    'ngSanitize',
    'oauth',
    'restangular',
    'highcharts-ng'
]);


angular.module('app').run(function($rootScope, $state, AccessToken) {
    AccessToken.set();

    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && AccessToken.expired()) {
            event.preventDefault();
            $state.go('login');
        }
    });

    $rootScope.$on('oauth:login', function () {
        $state.go('dashboard');
    });

    $rootScope.$on('oauth:logout', function () {
        $state.go('login');
    });

    $rootScope.$on('oauth:expired', function (e, params) {
        //debugger;
        //AccessToken.refreshTokenFromServer();
    });

    //$rootScope.$on('oauth:login-error', function (event, message, $scope) {
    //    $scope.error = true;
    //    $scope.error_message = message;
    //});
});