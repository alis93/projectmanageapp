angular.module("projectManager")

    .factory('filesFactory', ['$http', 'auth', 'Upload', function ($http, auth, Upload) {
        var obj = {};

        obj.uploadFile = function (file, projectId) {
            return Upload.upload({
                url: '/projects/' + projectId + '/files',
                method: 'POST',
                headers: {Authorization: 'Bearer ' + auth.getToken(), 'Content-Type': 'multipart/form-data'},
                file: file,
            }).then(function (resp) {
                return resp.data;
            });
        };

        obj.deleteFile = function (projectId, file) {
            return;
        };

        return obj;
    }]);