'use strict';

// App libraries
var oauth = angular.module('oauth', [
    //'oauth.directive',      // login directive
    'oauth.accessToken',    // access token service
    //'oauth.endpoint',       // oauth endpoint service
    //'oauth.profile',        // profile model
    'oauth.interceptor'     // bearer token interceptor
]);

oauth.config(function($locationProvider, $httpProvider) {
    $httpProvider.interceptors.push('ExpiredInterceptor');
});


var accessTokenService = angular.module('oauth.accessToken', ['ngStorage']);
accessTokenService.factory('AccessToken', function($rootScope, $location, $localStorage, $interval, $http){

    var service = {
            token: null,
            refreshToken: null,
            //baseUrl: 'http://dev.eposity.com/AngularJSAuthentication.API/token',
            baseUrl: 'http://auth.eposity.com/Tahoe.Authentication/token',
            clientId: 'ngAuthApp',
            clientSecret: 'EposityResourceOwner'
        };

    /**
     * Returns the access token.
     */
    service.get = function(){
        return this.token;
    };

    service.obtainFromServer = function(username, password)
    {
        var req = {
            method: 'POST',
            url: service.baseUrl,
            data: {
                username: username,
                password: password,
                grant_type: 'password',
                client_secret: service.clientSecret,
                client_id: service.clientId
            },
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }
        };

        $http(req)
            .success(function(data, status, headers, config){
                service.setTokenFromJson(data);
                $localStorage.username = data.userName;
                $localStorage.refresh_token = data.refresh_token;
            })
            .error(function(data, status, headers, config){
                $rootScope.$broadcast('oauth:login-error', { message: data['error'] });
            })
        ;
    };

    service.refreshTokenFromServer = function()
    {
        var req = {
            method: 'POST',
            url: service.baseUrl,
            data: {
                refresh_token: $localStorage.refresh_token,
                grant_type: 'refresh_token',
                client_secret: service.clientSecret,
                client_id: service.clientId
            },
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }
        };

        $http(req)
            .success(function(data, status, headers, config){
                service.setTokenFromJson(data);
                alert('token refresh!');
            })
            .error(function(data, status, headers, config){
                service.destroy();
            })
        ;
    };

    /**
     * Sets and returns the access token. It tries (in order) the following strategies:
     * - takes the token from the fragment URI
     * - takes the token from the sessionStorage
     */
    service.set = function(data){
        //If hash is present in URL always use it, cuz its coming from oAuth2 provider redirect
        if(null === service.token){
            setTokenFromSession();
        }

        return this.token;
    };

    /**
     * Delete the access token and remove the session.
     * @returns {null}
     */
    service.destroy = function(){
        delete $localStorage.token;
        this.token = null;
        return this.token;
    };


    /**
     * Tells if the access token is expired.
     */
    service.expired = function(){
        if (!this.token) return true;
        return (this.token && this.token.expires_at && this.token.expires_at<new Date());
    };

    service.logout = function() {
        service.destroy();
        $rootScope.$broadcast('oauth:logout');
    };


    /**
     * Get the access token from a string and save it
     * @param hash
     */
    service.setTokenFromJson = function(params){
        if(params){
            setToken(params);
            setExpiresAt();
            $rootScope.$broadcast('oauth:login', service.token);
        }
    };


    /* * * * * * * * * *
     * PRIVATE METHODS *
     * * * * * * * * * */

    /**
     * Set the access token from the sessionStorage.
     */
    var setTokenFromSession = function(){
        if($localStorage.token){
            var params = $localStorage.token;
            params.expires_at = new Date(params.expires_at);
            setToken(params);
        }
    };

    /**
     * Set the access token.
     *
     * @param params
     * @returns {*|{}}
     */
    var setToken = function(params){
        service.token = service.token || {};      // init the token
        angular.extend(service.token, params);      // set the access token params
        setTokenInSession();                // save the token into the session
        setExpiresAtEvent();                // event to fire when the token expires

        return service.token;
    };

    /**
     * Save the access token into the session
     */
    var setTokenInSession = function(){
        $localStorage.token = service.token;
    };

    /**
     * Set the access token expiration date (useful for refresh logics)
     */
    var setExpiresAt = function(){
        if(service.token){
            var expires_at = new Date();
            expires_at.setSeconds(expires_at.getSeconds()+parseInt(service.token.expires_in)-60); // 60 seconds less to secure browser and response latency
            //expires_at.setSeconds(60);
            service.token.expires_at = expires_at;
        }
    };


    /**
     * Set the timeout at which the expired event is fired
     */
    var setExpiresAtEvent = function(){
        var time = (new Date(service.token.expires_at))-(new Date());
        if(time){
            $interval(function(){
                //service.refreshTokenFromServer();
            }, time, 1)
        }
    };

    return service;
});

var interceptorService = angular.module('oauth.interceptor', []);
interceptorService.factory('ExpiredInterceptor', function ($rootScope, $q, $sessionStorage) {

    var service = {};

    service.request = function(config) {
        var token = $sessionStorage.token;

        //if (token && expired(token))
        //    $rootScope.$broadcast('oauth:expired', service.token);
        return config;
    };

    var expired = function(token) {
        return (token && token.expires_at && new Date(token.expires_at) < new Date())
    };

    return service;
});