/**
 * Name : app.js
 * Description: main app script for  todo app.
 * Author: Barak Inbal.
 * Created Date: 26.9.15
 * Modified Date: 26.9.15
 **/
'use strict'

var app = angular.module('todoapp',['ngRoute','todo-controllers','todo-service']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: '/templates/home.html',
            controller: 'todoCtrl',
            css: '/css/style.css',
            resolve: {
                todoStorage: function (storage) {
                        return storage.then(
                          function success (serviceModule) {
                                serviceModule.read();
                                return serviceModule;
                          },
                          function failure(error){
                                console.log('failed to load storage module correctly:',error);
                          });
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        })
}]);


app.controller('mainCtrl',
    function($scope,$routeParams, $route){
    $scope.css = '/css/style.css';
    $scope.$watch(function(){ return $route.current && $route.current.css;},
        function(value){
            $scope.css = value;
    });
});


