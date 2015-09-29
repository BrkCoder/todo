<!doctype html>
<html lang="en" ng-app="todoapp" ng-controller="mainCtrl">
<head>
	<meta charset="UTF-8">
	<title>todo list</title>
	<meta name="description" content="todo list application" />
	<!-- Load Stylesheets files -->
	<link rel="stylesheet" type="text/css" href="/css/vendor/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="/css/vendor/bootstrap-theme.min.css" />
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" ng-href="{{css}}" />
</head>
<body >
    <div ng-view></div>
    <!-- Load JavaScripts files -->
    <script type="text/javascript" src="/js/vendor/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="/js/vendor/bootstrap.min.js"></script>
    <script src="/js/vendor/angular.js"></script>
    <script src="/js/vendor/angular-route.js"></script>
    <script type="text/javascript" src="/js/app.js"></script>
    <script type="text/javascript" src="/js/controllers/todo-list-ctrl.js"></script>
    <script type="text/javascript" src="/js/services/todo-list-service.js""></script>

</body>
</html>
