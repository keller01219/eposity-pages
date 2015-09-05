/**
 * Created by Heinfried on 5/25/2015.
 */
'use strict';

/* Setup App Main Controller */
angular.module('app').controller('AppController', function ($scope, $rootScope, $localStorage) {
    $scope.$on('$viewContentLoaded', function () {
        //Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });
    //$scope.username = $localStorage.username;
    // body class
    //$scope.body = "login";
    $scope.body = "login";

    $scope.$on("oauth:logout", function () {
        $scope.body = "login";
    });
});

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
angular.module('app').controller('HeaderController', function ($rootScope, $scope, AccessToken, $localStorage) {
    var token = AccessToken.get();
    //$scope.$on('$includeContentLoaded', function () {
    //    //Layout.initHeader(); // init header
    //});
    //$scope.authenticated = !AccessToken.expired();

    $scope.username = $localStorage.username;

    $scope.logout = function() {
        AccessToken.logout();
    }

    $scope.$on("oauth:login", function () {
        $scope.authenticated = !AccessToken.expired();
    });
});

/* Setup Layout Part - Sidebar */
angular.module('app').controller('PageHeadController', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        //Demo.init(); // init theme panel
    });
});

/* Setup Layout Part - Footer */
angular.module('app').controller('FooterController', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        //Layout.initFooter(); // init footer
    });
});
