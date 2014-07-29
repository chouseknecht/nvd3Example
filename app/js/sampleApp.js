/*****************************************
 * Copyright (c) 2014 Chris Houseknecht
 *
 * sampleApp.js
 *
 * Entry point for nvd3Example
 *
 */

'use strict';

var myApp = angular.module('sampleApp', ['ngRoute', 'sampleAppControllers']);

myApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: '/partials/home.html',
            controller: 'HomeController'
        });
}]);