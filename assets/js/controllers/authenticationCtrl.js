'use strict';

var AuthenticationController = function($rootScope, $scope, AccessToken, $localStorage) {
    //$scope.accessToken = AccessToken.get();
    //
    //$scope.authenticate = function() {
    //    var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
    //    Token.getTokenByPopup(extraParams)
    //        .then(function(params) {
    //            // Success getting token from popup.
    //
    //            // Verify the token before setting it, to avoid the confused deputy problem.
    //            Token.verifyAsync(params.access_token).
    //                then(function(data) {
    //                    $rootScope.$apply(function() {
    //                        $scope.accessToken = params.access_token;
    //                        $scope.expiresIn = params.expires_in;
    //
    //                        Token.set(params.access_token);
    //                    });
    //                }, function() {
    //                    alert("Failed to verify token.")
    //                });
    //
    //        }, function() {
    //            // Failure getting token from popup.
    //            alert("Failed to get token from popup.");
    //        });
    //};
    $scope.error = false;

    $scope.signin = function () {
        $scope.error = false;
        AccessToken.obtainFromServer(this.username, this.password);
        console.log('this username is: ' + this.username);
        //$localStorage.username = this.username;
        //$scope.myusername = this.username;
        //$rootScope.username = this.username;
    }

    $scope.signup = function () {

        var reg_req = {
            method: 'POST',
            url: 'http://auth.eposity.com/Tahoe.Authentication/api/account/register',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                'userName': this.userName,
                'password': this.password,
                'confirmPassword': this.confirmPassword,
                'companyIdentifier': this.companyName
            })
        };
        console.log(reg_req);
        $http(reg_req)
            .success(function (data, status, headers, config) {
                AccessToken.obtainFromServer($scope.userName, $scope.password);
            })
            .error(function(data, status){
                $scope.error = true;
                var error_message = "";
                var errors = data.form.children;
                console.log(errors);
                for(field in errors) {
                    if(errors[field].length == 0) continue;
                    for(var i = 0; i < errors[field].errors.length; i++) {
                        error_message += field.toUpperCase() + ": " + errors[field].errors[i] + "<br/>";
                    }
                }
                $scope.error_message = error_message;
                console.log(data);
            })
        ;
    };

    $scope.$on('oauth:login-error', function (event, args) {
        $scope.error = true;
        $scope.error_message = args['message'];
    });
};