angular.module("projectManager", ['ui.router','ngMaterial','ngMessages'])

    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider,$urlRouterProvider){
            $stateProvider
                .state('home',{
                    url: '/home',
                    templateUrl: 'templates/home.html',
                    controller:'MainCtrl as mainCtrl'
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
                    abstract: true
                })
                .state('updates',{
                    url: '/updates',
                    templateUrl: 'templates/home.html',
                    data:{pageTitle: 'Updates'},
                    controller:'MainCtrl as mainCtrl',
                    parent: 'root'
                })
                .state('projects',{
                    url:'/projects',
                    templateUrl:'templates/home.html',
                    data:{pageTitle: 'projects'},
                    controller:'MainCtrl as mainCtrl',
                    parent: 'root'
                });

            $urlRouterProvider.otherwise('login');
        }
    ])
    .run([ '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
    }])

    .factory('auth', ['$http', '$window', function($http, $window){
        var auth = {};
        var tokenName = 'project-management-token';

        auth.saveToken = function (token){
            $window.localStorage[tokenName] = token;
        };

        auth.getToken = function(){
            return $window.localStorage[tokenName];
        };

        auth.isLoggedIn = function(){
            var token = auth.getToken();

            if(token){
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return {email:payload.email,name:payload.name};
            }
        };

        auth.register = function(user){
            return $http.post('/register', user).success(function(data){
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function(user){
            console.log("user "+ user)
            return $http.post('/login', user).success(function(data){
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function(){
            $window.localStorage.removeItem(tokenName);
        };

        return auth;
    }])

    .controller('AuthCtrl', [
        '$state',
        'auth',
        function($state, auth){
            var self = this;
            self.user = {};
            self.register = function(){
                auth.register(self.user).error(function(error){
                    self.error = error;
                }).then(function(){
                    $state.go('updates');
                });
            };

            self.logIn = function(){
                console.log(self.user);
                auth.logIn(self.user).error(function(error){
                    self.error = error;
                }).then(function(){
                    $state.go('updates');
                });
            };

        }])







    .controller('MainCtrl',[
        'posts',
        function(posts){
            var self = this;
            self.posts = posts.posts;
            self.addPost = function(){
                if(!self.title || self.title === '') { return; }
                self.posts.push({
                    title: self.title,
                    link: self.link,
                    upvotes: 0
                });

                self.title = '';
                self.link = '';
            };

            self.incrementUpvotes = function(post) {
                post.upvotes += 1;
            };

    }])

    .factory('posts',[function(){
        var obj = {
            posts:[]
        };
        return obj;
    }]);