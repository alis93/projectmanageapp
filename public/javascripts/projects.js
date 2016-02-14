angular.module("projectManager")

    .factory('projects', ['$http', 'auth', 'Upload', function ($http, auth, Upload) {
        var obj = {
            projects: []
        };

        //get all the projects for this user
        obj.getAllProjects = function () {
            return $http.get('/projects', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).success(function (data) {
                angular.copy(data, obj.projects); //obj.projects[0].archived = true;
            });
        };

        //add a project
        obj.createProject = function (projectData) {
            return Upload.upload({
                url: '/projects',
                method: 'POST',
                headers: {Authorization: 'Bearer ' + auth.getToken(), 'Content-Type': 'multipart/form-data'},
                file: projectData.file,
                data: projectData.project
            }).then(function (resp) {
                console.log(resp);
                obj.projects.push(resp.data.project);
                return resp;
            });
        };

        //update a project
        //similar to createProject
        //send all form fields
        //in a put request
        //maybe backend method for updating will change?

        //delete a project
        obj.deleteProject = function (projectId) {
            return $http.delete('/projects/' + projectId)
                //remove .then stuff
                .then(function (resp) {
                    console.log(resp);
                }, function (resp) {
                    console.log(resp);
                });
        };

        //get a specific project
        //finish implemeting this!
        obj.getProject = function (projectId) {
            return $http.get('/projects/' + projectId, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).success(function (data) {
                console.log('single project', data);
            });
        };


        //archive a project
        obj.archiveProject = function (projectId) {
            return;
            //return $http.put() to project archive route
        };

        //bookmark project
        //update pinned projects in user document in backend
        // when doing get projects join pinned field to the projects
        //before returning here. then update that when pinned
        obj.bookmarkProject = function () {
            return;
        };


        return obj;
    }])

    .controller('ProjectController', ['projects', '$mdDialog', '$filter', '$mdToast', function (projects, $mdDialog, $filter, $mdToast) {
        var self = this;
        self.projects = projects.projects;

        self.projects.map(function (project) {
            project.endDate = $filter('date')(project.endDate, 'dd/MM/yyyy');
        });

        self.confirmDelete = function (ev, project) {
            // Appending dialog to document.body to cover sidenav in docs app
            var dialogContent = $mdDialog.confirm()
                .title('Delete this project?')
                .textContent('Are you sure you want to delete this project?' +
                    'You will not be able to recover it after it is deleted')
                .ariaLabel('Delete project')
                .targetEvent(ev)
                .ok('Delete!')
                .cancel('Cancel');
            $mdDialog.show(dialogContent).then(function () {
                var idx = self.projects.indexOf(project);
                projects.deleteProject(project._id).then(function () {
                    self.projects.splice(idx, 1);
                    //self.status = 'You Deleted the project';
                    $mdToast.showSimple('Project Deleted!');

                });
            });
        };

        self.archiveProject = function (project) {
            projects.archiveProject(projectId).then(function () {
                project.archived = true;
                //also remove from pinned projects both here and in backend
            });
        }

        self.pinProject = function (project) {
            // add to pinned projects on sidenav?
            return;
        }


    }])

    .controller('NewProjectController', ['projects', '$state', , function (projects, $state) {

        var self = this;

        self.minDate = new Date();
        self.file = '';
        self.project = {
            title: '',
            description: '',
            endDate: '',
            moreInfo: []
        };

        self.createProject = function () {
            projects.createProject({file: self.file, project: self.project})
                .then(function () {
                        $state.go('projects');
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                    }
                );
        };

        self.addMoreInfo = function () {
            self.project.moreInfo.push({name: '', value: ''});
        };

        self.removeMoreInfo = function (index) {
            self.project.moreInfo.splice(index, 1);
        };

    }]);