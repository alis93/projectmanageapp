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
                    controller: 'ProjectsController as projectsCtrl',
                    parent: 'root',
                    resolve: {
                        projectsPromise: ['projectsFactory', function (projectsFactory) {
                            return projectsFactory.getAllProjects();
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
                .state('project', {
                    url: '/projects/{projectId}',
                    templateUrl: 'templates/project.html',
                    abstract: true,
                    //controller:'ProjectController as projectCtrl',
                    parent: 'root',
                    resolve: {
                        project: ['projectsFactory', '$stateParams', function (projectsFactory, $stateParams) {
                            return projectsFactory.getProject($stateParams.projectId);
                        }],
                        projectId: ['$stateParams', function ($stateParams) {
                            return $stateParams.projectId;
                        }]
                    }
                })
                .state('project.info', {
                    url: '/info',
                    data: {pageTitle: 'Project Information'},
                    templateUrl: 'templates/projectInfo.html',
                    controller: 'ProjectInfoController as infoCtrl'
                })
                .state('project.pages', {
                    url: '/pages',
                    data: {pageTitle: 'Pages'},
                    templateUrl: 'templates/pages.html',
                    controller: 'PagesController as pagesCtrl'
                })
                .state('project.pages.page', {
                    url: '/{pageId}',
                    templateUrl: 'templates/page.html',
                    resolve: {
                        page: ['project', '$stateParams', '$state', function (project, $stateParams, $state) {
                            if (!($stateParams.pageId < project.pages.length && $stateParams.pageId >= 0) || !$stateParams.pageId) {
                                $state.go('project.pages', {projectId: projectId});
                            }
                            return project.pages[$stateParams.pageId];
                        }
                        ]
                    },
                    controller: 'PageController as pageCtrl'
                })
                .state('project.files', {
                    url: '/files',
                    data: {pageTitle: 'Files'},
                    templateUrl: 'templates/files.html',
                    controller: 'FilesController as filesCtrl'
                })
                .state('project.file', {
                    url: '/file',
                    templateUrl: 'templates/file.html',
                    controller: 'FileController as fileCtrl'
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
