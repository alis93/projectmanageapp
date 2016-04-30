angular.module("projectManager")

    .factory('projectsFactory', ['$http', 'auth', 'Upload', function ($http, auth, Upload) {

        var obj = {};

        //get all the projects for this user
        obj.getAllProjects = function () {
            return $http.get('/projects', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };

        //add a project
        obj.createProject = function (file, project) {
            return Upload.upload({
                url: '/projects',
                method: 'POST',
                headers: {Authorization: 'Bearer ' + auth.getToken(), 'Content-Type': 'multipart/form-data'},
                file: file,
                data: project
            }).then(function (resp) {
                return resp.data.project;
            });
        };

        obj.updateProject = function (file, project) {
            return Upload.upload({
                url: '/projects/' + project._id,
                method: 'PUT',
                headers: {Authorization: 'Bearer ' + auth.getToken(), 'Content-Type': 'multipart/form-data'},
                file: file,
                data: project
            });
        };

        //delete a project
        obj.deleteProject = function (projectId) {
            return $http.delete('/projects/' + projectId, {
                    headers: {Authorization: 'Bearer ' + auth.getToken()}
                })
                //remove .then stuff
                .then(function (resp) {
                }, function (resp) {
                    console.log(resp);
                });
        };

        obj.getProject = function (projectId) {
            return $http.get('/projects/' + projectId, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.log(err);
            });
        };
        obj.getUpcomingUserEvents = function () {
            return $http.get('/upcomingUserEvents', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.log(err);
            });
        };

        obj.archiveProject = function (projectId, isArchived) {
            return $http.put('/projects/' + projectId + '/archive', isArchived, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            });
        };

        //TODO bookmarks
        obj.bookmarkProject = function () {
            //bookmark project
            //update pinned projects in user document in backend
            // when doing get projects join pinned field to the projects
            //before returning here. then update that when pinned
            return;
        };

        obj.inviteMember = function (projectID, invite) {
            return $http.put('/projects/' + projectID + '/invite', invite, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.error("Error in factory: " + err);
            });
        };

        obj.getInvites = function () {
            return $http.get('/invites', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            });
        };

        obj.respondToInvite = function (invite, responseBool) {
            return $http.put('/inviteResponse', {invite: invite, response: responseBool}, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).then(function (data) {
                return data.data;
            }, function (err) {
                console.error("Error in factory: " + err);
            });
        };

        return obj;
    }]);