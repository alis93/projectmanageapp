/**
 * Created by sulmanali on 19/02/2016.
 */
angular.module("projectManager")
    .factory('pagesFactory', ['$http', 'auth', function ($http, auth) {
        var o = {};

        o.newPage = function (projectId) {
            return $http.post('/projects/' + projectId + '/pages', {}, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.log(err);
            });
        };

        o.getPage = function (projectId, pageId) {

            return $http.get('/projects/' + projectId + '/pages/' + pageId, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.log(err);
            });
            ;
        };

        o.updatePage = function (projectId, page) {
            return $http.put('/projects/' + projectId + '/pages/' + page._id, page, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.log(err);
            });
        };

        o.setComplete = function (projectId, pageId, isComplete) {
            return $http.put('/projects/' + projectId + '/pages/' + pageId + '/complete', isComplete, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            });
        };

        o.delete = function (projectId, pageId) {
            return $http.delete('/projects/' + projectId + '/pages/' + pageId, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            });
        };

        o.addComment = function (projectId, pageId, comment) {
            return $http.post('/projects/' + projectId + '/pages/' + pageId + "/comments", comment, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };

        return o;
    }]);
