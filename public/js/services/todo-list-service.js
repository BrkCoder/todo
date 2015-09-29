/**
 * Name : todo-list-service.js
 * Description: main service file for  todo app .
 * Define 4 basic operations for storage services:
 * 1. Read : Get Request to External or Local Storage.
 * 2. Create: Insert Request to External or Local Storage.
 * 3. Update: Put Request to External or Local Storage.
 * 4. Destroy: Delete Request to External or Local Storage.
 * Author: Barak Inbal.
 * Created Date: 26.9.15
 * Modified Date: 26.9.15
 **/
'use strict'

var srv = angular.module('todo-service',[]);

   srv.factory('storage',
       function ($http, $injector) {

           return $http.get('/api')
               .then(function () {
                   return $injector.get('external-Storage');
               }, function () {
                   return $injector.get('local-Storage');
               });
   });

   srv.factory('local-Storage',function($q){

        var todoStorage = {
            todoTasksList   : [],
            storage_key     : "todo-Storage",
            read : function(){
                var deferred = $q.defer();
                angular.copy(readFromStorage(todoStorage.storage_key),todoStorage.todoTasksList);
                deferred.resolve(todoStorage.todoTasksList);
                return deferred.promise;
            },
            create : function(todoElement){
                var deferred = $q.defer();
                todoStorage.todoTasksList.push(todoElement);
                writeToStorage(todoStorage.todoTasksList,todoStorage.storage_key);
                deferred.resolve(todoStorage.todoTasksList);
                return deferred.promise;
            },
            update : function(todoElement, index){
                var deferred = $q.defer();
                todoStorage.todoTasksList[index] = todoElement;
                writeToStorage(todoStorage.todoTasksList,todoStorage.storage_key);
                deferred.resolve(todoStorage.todoTasksList);
                return deferred.promise;
            },
            destroy : function(todoElement,index){
                var deferred = $q.defer();
                todoStorage.todoTasksList.splice(index, 1);
                writeToStorage(todoStorage.todoTasksList,todoStorage.storage_key);
                deferred.resolve(todoStorage.todoTasksList);
                return deferred.promise;
            }
        }

           function readFromStorage(key){
               var data = JSON.parse(localStorage.getItem(key) || '[]');
               return data;
           }

           function writeToStorage(todoTasksList,key){
               localStorage.setItem(key, JSON.stringify(todoTasksList));
           }

       return  todoStorage;
   });

   srv.factory('external-Storage',function($q){
        var  todoStorage = {
            todoTasksList : [],
            url : "localhost/todo/tasks",

            read : function(){
                return $http.get(todoStorage.url)
                    .then(
                        function success(result){
                            todoStorage.todoTasksList = angular.extend({},result.data);
                            return todoStorage.todoTasksList;
                        },
                        function failure(error){
                            console.log('read operation failed!'.error);
                        }
                    )
            },
            create: function(todoElement){
                var todoTasksListBackup = angular.extend({},todoStorage.todoTasksList);

                return $http.post(todoStorage.url, todoElement)
                    .then(
                        function success(result) {
                            todoElement.id = result.data.id;
                            todoStorage.todoTasksList.push(todoElement);
                            return todoStorage.todoTasksList;
                        },
                        function failure(error) {
                            console.log('create operation failed!',error);
                            todoStorage.todoTasksList = angular.extend({}, todoTasksListBackup);
                            return todoTasksListBackup;
                        }
                    );
            },
            update : function(todoElement, index){
                var todoTasksListBackup = angular.extend({},todoStorage.todoTasksList);

                return $http.put(todoStorage.url + '/' + todoElement.id, todoElement)
                    .then(
                        function success(result) {
                            return todoStorage.todoTasksList;
                        },
                        function failure(error) {
                            console.log('update operation failed!',error);
                            todoStorage.todoTasksList = angular.extend({}, todoTasksListBackup);
                            return todoTasksListBackup;
                        }
                    );
            },
            destroy : function(todoElement, index){
                var todoTasksListBackup = angular.extend({},todoStorage.todoTasksList);
                var index = todoStorage.todoTasksList.indexOf(todoElement);
                todoStorage.todoTasksList.splice(index, 1);

                return $http.delete(todoStorage.url + todoElement.id)
                    .then(function success(result) {
                        return todoStorage.todoTasksList;
                    }, function failure(error) {
                        console.log('destory operation failed!',error);
                        todoStorage.todoTasksList = angular.extend({}, todoTasksListBackup);
                        return todoTasksListBackup;
                    });
            }

        }

        return  todoStorage;
    });