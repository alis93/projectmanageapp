angular.module("projectManager", ['ui.router', 'ngMaterial', 'ngMessages', 'textAngular', 'ngFileUpload'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider,$urlRouterProvider){
            $stateProvider
                .state('home',{
                    url: '/home',
                    templateUrl: 'templates/home.html'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: 'templates/login.html',
                    controller: 'AuthCtrl  as auth',
                    onEnter: ['$state', 'auth', function($state, auth){
                        if(auth.isLoggedIn()){
                            $state.go('updates');
                        }
                    }]
                })
                .state('register', {
                    url: '/register',
                    templateUrl: 'templates/register.html',
                    controller: 'AuthCtrl as auth',
                    onEnter: ['$state', 'auth', function($state, auth){
                        if(auth.isLoggedIn()){
                            $state.go('updates');
                        }
                    }]
                })
                .state('root', {
                    templateUrl: 'templates/root.html',
                    controller:'NavCtrl as nav',
                    abstract: true,
                    onEnter: ['$state', 'auth', function ($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('login');
                        }
                    }]
                })
                .state('updates',{
                    url: '/updates',
                    templateUrl: 'templates/home.html',
                    data:{pageTitle: 'Updates'},
                    parent: 'root'
                })
                .state('projects',{
                    url:'/projects',
                    templateUrl: 'templates/projects.html',
                    data:{pageTitle: 'projects'},
                    controller: 'ProjectController as projectCtrl',
                    parent: 'root',
                    resolve: {
                        projectPromise: ['projects', function (projects) {
                            return projects.getAllProjects();
                        }]
                    }
                })
                .state('newProject', {
                    url: '/new-project',
                    templateUrl: 'templates/newProject.html',
                    data: {pageTitle: 'Create a new project'},
                    parent: 'root',
                    controller: 'NewProjectController as projectCtrl'
                })

            ;

            $urlRouterProvider.otherwise('login');
        }
    ])
    .run([ '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }]);
