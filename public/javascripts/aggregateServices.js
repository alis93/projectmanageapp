/**
 * Created by sulmanali on 11/04/2016.
 */


///user/:userID/aggregate/completedTasksByDate


angular.module("projectManager")
    .factory('UserAggregateFactory', ['$http', 'auth', function ($http, auth) {
        var o = {};

        o.getCompletedTasksByDate = function (userID) {
            return $http.get('user/' + userID + '/aggregate/completedTasksByDate', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };

        o.getAssignedTasksByDate = function (userID) {
            return $http.get('user/' + userID + '/aggregate/AssignedTasksByDate', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };

        o.totalHoursByUser = function (projectID) {
            return $http.get('project/' + projectID + '/aggregate/totalHoursByUser', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };
        return o;
    }]);