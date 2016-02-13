angular.module("projectManager")

    .factory('projects', ['$http', 'auth', 'Upload', function ($http, auth, Upload) {
        var obj = {projects: []};


        //get all the projects for this user
        obj.getAllProjects = function () {
            return $http.get('/projects', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).success(function (data) {
                angular.copy(data, obj.projects);
                //obj.projects[0].archived = true;
            });
        };

        //add a project
        obj.createProject = function (projectData) {
            return Upload.upload({
                url: '/projects',
                method: 'POST',
                headers: {Authorization: 'Bearer ' + auth.getToken(), 'Content-Type': 'multipart/form-data'},
                file: projectData.file,
                data: projectData.project,  // {file: file, info: Upload.json({id: id, name: name, ...})} send fields as json string
                objectKey: '.k'
            }).then(function (resp) {
                obj.projects.push(resp.data.project);
                return resp;
            });
        };

        //update a project

        //delete a project

        //get a specific project

        //archive a project


        return obj;
    }])



    ////split into new project form controller and projects controller
    .controller('ProjectController', ['projects', '$mdDialog', '$filter', function (projects, $mdDialog, $filter) {
        var self = this;

        self.projects = projects.projects;

        self.projects.map(function (project) {
            //project.description = $filter('limitTo')(project.description , 50);
            project.endDate = $filter('date')(project.endDate, 'dd/MM/yyyy');

        });


        self.confirmDelete = function (ev, project, index) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Delete this project?')
                .textContent('Are you sure you want to delete this project?' +
                    'You will not be able to recover it after it is deleted')
                .ariaLabel('Delete project')
                .targetEvent(ev)
                .ok('Delete!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                self.status = 'You Deleted the project';
                self.projects.splice(index, 1);
                //delete the project from server too
                console.log('project deleted: ', project);
                ////////delete project from server too using projects.delete()!! from projects service
                //projects.delete();
            });
        };


        self.minDate = new Date();
        self.file = '';
        self.project = {
            title: '',
            description: '',
            endDate: '',
            moreInfo: []
        };

        self.createProject = function () {
            if (!self.project.title) {
                return;
            }
            projects.createProject({file: self.file, project: self.project})
                .then(function (resp) {
                    console.log(resp);
                    self.image = '/images/' + resp.data.file.filename;
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                });
            self.project = {title: '', description: '', endDate: '', moreInfo: []};
        };

        self.addMoreInfo = function () {
            self.project.moreInfo.push({
                name: '',
                value: ''
            });
        };

        self.removeMoreInfo = function (index) {
            self.project.moreInfo.splice(index, 1);
        };

    }]);
