/**
 * Created by sulmanali on 04/04/2016.
 */
angular.module("projectManager")
    .controller('UserController', ['user', '$state', 'auth', function (user, $state) {

        var self = this;
        self.user = user;
        self.assignedTasks = [];

        user.projects.map(function (project) {
            project._id.pages.map(function (page) {
                if (page.assignedTo) {
                    if (page.assignedTo._id === user._id && !page.completed) {
                        self.assignedTasks.push(page);
                    }
                }
            });
        });

        self.loadProject = function (project) {
            $state.go('project.pages', {projectId: project._id._id});
        };

        self.goToPage = function (page) {
            $state.go('project.pages.page', {projectId: page.project, pageId: page._id});
        };
        //TODO reporting graphs. Then DONE!
    }]);

