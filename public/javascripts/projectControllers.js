angular.module("projectManager")

    .controller('ProjectsController',
        ['projectsFactory', '$mdDialog', '$filter', '$mdToast', '$state',
            function (projectsFactory, $mdDialog, $filter, $mdToast, $state) {
                var self = this;
                self.projects = projectsFactory.projects;

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
                        projectsFactory.deleteProject(project._id).then(function () {
                            self.projects.splice(idx, 1);
                            //self.status = 'You Deleted the project';
                            $mdToast.showSimple('Project Deleted!');

                        });
                    });
                };

                self.archiveProject = function (project, isArchived) {
                    projectsFactory.archiveProject(project._id, {isArchived: isArchived}).then(function (resp) {
                        project.archived = isArchived;
                        //also remove from pinned projects both here and in backend
                    });
                };

                self.pinProject = function (project) {
                    // add to pinned projects on sidenav?
                    return;
                };

                self.loadProject = function (project) {
                    $state.go('project.pages', {projectId: project._id});

                };


            }])

    .controller('NewProjectController', ['projectsFactory', '$state', function (projectsFactory, $state) {

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

            projectsFactory.createProject(self.file, self.project)
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

    }])

    //.controller('ProjectController',['projectsFactory','project',function(projectsFactory,project){
    //    var self = this;
    //    self.project = project;
    //}])

    .controller('ProjectInfoController', ['project', 'projectsFactory', '$mdToast', function (project, projectsFactory, $mdToast) {


        var self = this;
        self.project = project;
        self.minDate = new Date();
        self.file = self.project.projectIcon;


        if (self.project.endDate) {
            self.project.endDate = new Date(Date.parse(self.project.endDate));
        }

        self.addMoreInfo = function () {
            self.project.moreInfo.push({name: '', value: ''});
        };

        self.removeMoreInfo = function (index) {
            self.project.moreInfo.splice(index, 1);
        };

        self.updateInfo = function () {
            projectsFactory.updateProject(self.file, self.project).then(function (resp) {
                console.log(resp);
                $mdToast.showSimple('Information Updated!');
            });
        };

    }]);
