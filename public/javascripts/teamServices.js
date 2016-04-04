/**
 * Created by sulmanali on 04/04/2016.
 */
angular.module("projectManager")
    .factory('teamFactory', ['$http', 'auth', function ($http, auth) {

        var obj = {};

        //get the user
        obj.getUser = function (userID) {
            return $http.get('/user/' + userID, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };

        return obj;
    }]);