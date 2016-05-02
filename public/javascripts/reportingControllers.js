/**
 * Created by sulmanali on 24/04/2016.
 */

angular.module("projectManager")
    .controller('reportingController', ['project', 'UserAggregateFactory', function (project, UserAggregateFactory) {

        var self = this;
        self.project = project;
        self.selectedUser = project.team[0];
        self.tasks = project.pages;

        self.getTotalHours = function () {
            var total = 0;
            for (var i = 0; i < project.pages.length; i++) {
                if (project.pages[i].completedBy == self.selectedUser._id) {
                    total += project.pages[i].hoursToComplete;
                }
            }
            return total;
        };



        UserAggregateFactory.totalHoursByUser(project._id).then(function (resp) {


            var seriesData = [];

            resp.forEach(function (item) {
                var user = project.team.find(function (user) {
                    return user._id == this;
                }, item._id);

                var data = item.info.map(function (infoItem) {
                    console.log('day', infoItem.date.day);
                    return [Date.UTC(infoItem.date.year, infoItem.date.month - 1, infoItem.date.day), infoItem.count];
                });

                seriesData.push({name: user.name, data: data});

            });

            self.completedByDateConfig = {
                options: {
                    chart: {
                        type: 'column',
                        zoomType: 'x',
                        renderTo: 'chartcontainer'
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                                style: {
                                    textShadow: '0 0 3px black'
                                }
                            }
                        }
                    }
                },
                title: {
                    text: 'Hours Worked on the project by user'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    },
                    //tickInterval: 3600 * 24 * 1000,
                    title: {
                        text: 'Date'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Hours input'
                    },
                    min: 0
                },
                series: seriesData
            };
        });


        self.orderByDate = function (item) {
            return new Date(item.dateCompleted);
        };


    }]);

