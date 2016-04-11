/**
 * Created by sulmanali on 04/04/2016.
 */
angular.module("projectManager")
    .controller('UserController', ['user', '$state', 'UserAggregateFactory', function (user, $state, UserAggregateFactory) {

        var self = this;
        self.user = user;
        self.assignedTasks = [];
        self.completedTasks = [];

        user.projects.map(function (project) {
            project._id.pages.map(function (page) {
                if (page.assignedTo) {
                    if (page.assignedTo._id === user._id) {
                        if (!page.completed) {
                            self.assignedTasks.push(page);
                        } else {
                            self.completedTasks.push(page);
                        }
                    }
                }
            });
        });

        UserAggregateFactory.getCompletedTasksByDate(user._id).then(function (resp) {
            var completedTasksByDate = resp.map(function (item) {
                return [Date.UTC(item._id.year, item._id.month - 1, item._id.day), item.count]
            });

            self.chartConfig = {
                options: {
                    chart: {
                        type: 'column',
                        zoomType: 'x'
                    }
                },
                title: {
                    text: 'Tasks completed by Date'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    },
                    title: {
                        text: 'Date'
                    }
                },
                yAxis: {
                    title: {
                        text: 'tasks completed'
                    },
                    min: 0
                },
                series: [{
                    name: "tasks completed",
                    data: completedTasksByDate
                }]
            };


        });

        self.loadProject = function (project) {
            $state.go('project.pages', {projectId: project._id._id});
        };

        self.goToPage = function (page) {
            $state.go('project.pages.page', {projectId: page.project, pageId: page._id});
        };
        //TODO reporting graphs. Then DONE!
    }]);

