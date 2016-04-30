/**
 * Created by sulmanali on 24/04/2016.
 */

angular.module("projectManager")
    .controller('reportingController', ['project', 'UserAggregateFactory', function (project, UserAggregateFactory) {

        var self = this;
        self.project = project;
        self.selectedUser = project.team[0];
        self.tasks = project.pages;


        self.totalHours = project.pages.reduce(function (prev, curr) {
            if (curr.completedBy == self.selectedUser._id) {
                if (isNaN(curr.hoursToComplete)) {
                    return prev;
                } else {
                    return {hoursToComplete: prev.hoursToComplete + curr.hoursToComplete};
                }
            } else {
                return prev;
            }
        }).hoursToComplete;

        UserAggregateFactory.totalHoursByUser(project._id).then(function (resp) {


            console.log('resp', resp);


            var data = resp.map(function (item) {
                var user = project.team.find(function (user) {
                    return user._id == this._id;
                }, item);
                return {name: user.name, data: [item.count]};
            });

            self.completedByDateConfig = {
                options: {
                    chart: {
                        type: 'column',
                        zoomType: 'x',
                        renderTo: 'chartcontainer'
                    }
                },
                title: {
                    text: 'Hours Worked on the project by user'
                },
                xAxis: {
                    categories: project.team,
                    title: {
                        text: 'User'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Hours input'
                    },
                    min: 0
                },
                series: data
            };
        });


        UserAggregateFactory.totalTasksByUser(project._id).then(function (resp) {
            var data = resp.map(function (item) {
                var user = project.team.find(function (user) {
                    return user._id == this._id;
                }, item);
                return {name: user.name, data: [item.count]};
            });

            self.totalTasksByUser = {
                options: {
                    chart: {
                        type: 'column',
                        zoomType: 'x',
                        renderTo: 'chartcontainer'
                    }
                },
                title: {
                    text: 'Total tasks completed in the project by user'
                },
                xAxis: {
                    categories: project.team,
                    title: {
                        text: 'User'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Hours input'
                    },
                    min: 0
                },
                series: data
            };
        });


    }]);

