/**
 * Name : todo-list-ctrl.js
 * Description: main controller file for  todo app .
 * Author: Barak Inbal.
 * Created Date: 24.9.15
 * Modified Date: 26.9.15
 **/
'use strict'

var ctrls = angular.module('todo-controllers',['todo-service']);
    ctrls.controller('todoCtrl',
        function($scope, $routeParams, $filter, todoStorage){

            var ACTIONS     = { "idle" : 1 ,"save" : 2 ,  "edit" : 3 , "delete" : 4,"update" : 5,"restore" : 6 };
            var EVENTS      = { "blur" : 'blur', "submit" : 'submit' };
            $scope.todoTaskToAdd    = {
                title: '',
                date: null,
                isDone: false
            }

            $scope.todoTasksList         = (!todoStorage.todoTasksList && todoStorage.todoTasksList.length == 0) ? [] : todoStorage.todoTasksList;
            $scope.todoTaskToEdit        = '';
            $scope.todoTaskBackup        = '';
            $scope.action                = ACTIONS.idle;
            $scope.isEditing             = false;
            $scope.isAllTasksfinished    = false;
            $scope.event                 = null;
            $scope.revertChanges         = false;

            var todoTasksListHistory   = (!$scope.todoTasksList && $scope.todoTasksList.length == 0) ? todoStorage.todoTasksList :  $scope.todoTasksList ;
            $scope.finishedTasks         = $filter('filter')(todoTasksListHistory, { isDone: true  }).length ;
            $scope.remainingTasks        = todoTasksListHistory.length - $scope.finishedTasks;

            /** actions on todo tasks list **/

            /**
             * addTodoTask method.
             * @returns {boolean}
             */
            $scope.addTodoTask = function(){
                    if($scope.todoTaskToAdd.title == ''){
                        return false;
                    }

                    $scope.todoTaskToAdd.date = Date.now();
                    $scope.action = ACTIONS.save;
                    todoStorage.create($scope.todoTaskToAdd)
                        .then(
                            function success(data,status){
                                $scope.todoTaskToAdd = '';
                                console.log("addTodoTask: add task to todo list succeed!");
                            },
                            function failure(error){
                                console.log("addTodoTask: an unknown error has occurred:",error);
                            }
                        )
                        .finally(function(){
                                $scope.action = ACTIONS.idle;
                            });
                return true;
            }

            /**
             * editTodoTask method.
             * @param todoTask
             */
            $scope.editTodoTask = function(todoTask){
                $scope.todoTaskToEdit = (!todoTask && typeof(todoTask) == 'undefined' ) ? '' : todoTask;
                $scope.action         = ACTIONS.edit;
                $scope.todoTaskBackup = angular.extend({},todoTask);
                return true;
            }

            /**
             * removeTodoTask method.
             * @param todoTask
             */
            $scope.removeTodoTask = function(todoTask){
                $scope.action = ACTIONS.delete;
                if(!angular.isDefined(todoTask)){
                    $scope.todoTaskToAdd = '';
                    return;
                }
                var index  = getItemIndex(todoTask);
                todoStorage.destroy(todoTask,index)
                .then(
                    function success(data,status){
                        console.log("removeTodoTask: remove task from todo list succeed!");
                    },
                    function failure(error){
                        console.log("removeTodoTask: an unknown error has occurred:",error);
                    }
                )
                .finally(function(){
                        $scope.action = ACTIONS.idle;
                    });
                return true;
            }

            /**
             * updateTodoTask method.
             * @param todoTask
             */
            $scope.updateTodoTask = function(todoTask){
                var todoTaskBackup;
                var index = getItemIndex(todoTask);
                $scope.action =  ACTIONS.update;
                todoTaskBackup = angular.extend({},todoTask);
                todoStorage.update(todoTask,index)
                .then(
                    function success(data,status){
                        console.log("updateTodoTask: update task of todo list succeed!");
                    },
                    function failure(error){
                        console.log("updateTodoTask: an unknown error has occurred:",error);
                        todoTask = angular.extend({},todoTaskBackup);
                    }
                ).finally(function(){
                        $scope.action = ACTIONS.idle;
                    });
                return true;
            }

            /**
             * restoreTodoTask method.
             * @param todoTaskIndex
             * @returns {boolean}
             */
            $scope.restoreTodoTask = function(todoTaskIndex){
                $scope.action = ACTIONS.restore;
                todoStorage.restore(todoTaskIndex)
                .then(
                    function success(data,status){
                        console.log("restoreTodoTask: restore task of todo list succeed!");
                    },
                    function failure(error){
                        console.log("restoreTodoTask: an unknown error has occurred:",error);
                    }
                ).finally(function(){
                        $scope.action = ACTIONS.idle;
                    });
                return true;
            }

            /**
             * saveTodoTaskChanges method.
             * @param todoTask
             * @param event
             */
            $scope.saveTodoTaskChanges = function(todoTask,event){

                if($scope.revertChanges){
                    $scope.revertChanges = !$scope.revertChanges;
                    return;
                }

                if($scope.event == EVENTS.submit && event == EVENTS.blur){
                    $scope.event = null;
                    return;
                }

                $scope.event        = event;
                console.log('todoTaskBackup',$scope.todoTaskBackup);
                var newTitle        = todoTask.title.trim();
                var originalTitle   = $scope.todoTaskBackup.title.trim();

                if( newTitle == originalTitle ){
                    $scope.todoTaskToEdit = null;
                    return;
                }

                var index  = getItemIndex(todoTask);
                var action = (todoTask.title == '' || !todoTask.title) ? 'destroy' : 'update';
                todoStorage[action](todoTask,index)
                    .then(
                        function success(data,status){
                            console.log(action," succeed!");
                        },
                        function failure(error){
                            console.log(action," failed:",error);
                            todoTask = angular.extend({},$scope.todoTaskBackup);
                        }
                    )
                    .finally(function(){
                            $scope.todoTaskToEdit = null;
                    });
            }

            /**
             * revertTodoTaskChanges method.
             * @param todoTask
             */
            $scope.revertTodoTaskChanges = function(todoTask){
                var index = getItemIndex(todoTask);
                todoTasksListHistory[index] = $scope.todoTaskBackup;
                $scope.todoTaskToEdit = null;
                $scope.todoTaskBackup = null;
                $scope.revertChanges = true;
            }

            /**
             * toggleTaskStatus method.
             * @param todoTask
             * @param isDone
             * @returns {boolean}
             */
            $scope.toggleTaskStatus = function (todoTask, isDone) {
                todoTask.isDone = isDone;
                console.log('isDone',isDone);
                $scope.updateTodoTask(todoTask);
                return true;
            };

            /** watchers **/
            $scope.$watch('todoTasksList',function(){
                    $scope.finishedTasks         = $filter('filter')(todoTasksListHistory, { isDone: true  }).length ;
                    $scope.remainingTasks        = todoTasksListHistory.length - $scope.finishedTasks;
                    $scope.isAllTasksfinished   = !$scope.remainingTasks;
                }, true);

            $scope.$watch('todoTaskToAdd',
                function(newvalue,oldvalue){

                }, true);

            $scope.$watch('todoTaskToAdd',
                function(newvalue,oldvalue){

                }, true);

            $scope.isSaving = function(){
                return ($scope.action == ACTIONS.save);
            }

            function getItemIndex(todoTask){
                var Item = $filter('filter')(todoTasksListHistory, { title: todoTask.title  }, true)[0];
                var index = todoTasksListHistory.indexOf(Item);
                return index;
            }
    });
