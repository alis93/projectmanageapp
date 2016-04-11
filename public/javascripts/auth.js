angular.module("projectManager")
    .factory('auth', ['$http', '$window', function ($http, $window) {
        var auth = {};
        var tokenName = 'project-management-token';

        auth.saveToken = function (token) {
            $window.localStorage[tokenName] = token;
        };

        auth.getToken = function () {
            return $window.localStorage[tokenName];
        };

        auth.isLoggedIn = function () {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function () {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return {email: payload.email, name: payload.name, _id: payload._id};
            }
        };

        auth.register = function (user) {
            return $http.post('/register', user).success(function (data) {
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function (user) {
            return $http.post('/login', user).success(function (data) {
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function () {
            $window.localStorage.removeItem(tokenName);
        };

        return auth;
    }])

    .controller('AuthCtrl', [
        '$state',
        'auth',
        function ($state, auth) {
            var self = this;
            self.user = {};
            self.register = function () {
                auth.register(self.user).error(function (error) {
                    self.error = error;
                }).then(function () {
                    $state.go('updates');
                });
            };

            self.logIn = function () {
                console.log(self.user);
                auth.logIn(self.user).error(function (error) {
                    self.error = error;
                }).then(function () {
                    $state.go('updates');
                });
            };

        }]);