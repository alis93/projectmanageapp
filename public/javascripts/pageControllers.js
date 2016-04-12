angular.module("projectManager")

    .controller('PagesController', ['project', 'pagesFactory', '$state', '$mdToast', '$mdDialog', 'auth', function (project, pagesFactory, $state, $mdToast, $mdDialog, auth) {
        var self = this;
        self.pages = project.pages;
        self.assignFilter = false;


        self.setAssignedFilter = function (isAssigned) {
            isAssigned ? self.assignFilter = true : self.assignFilter = false;
        };
        self.AssignedFilter = function (page) {
            if (!self.assignFilter) {
                return page;
            }
            if (page.assignedTo) {
                if (page.assignedTo._id == auth.currentUser()._id) {
                    return page;
                }
            }
        };

        self.newPage = function () {
            pagesFactory.newPage(project._id).then(function (newPage) {
                project.pages.push(newPage);
                self.goToPage(newPage._id);
            });
        };

        self.goToPage = function (pageId) {
            $state.go('project.pages.page', {pageId: pageId});
        };

        self.delete = function (page) {
            pagesFactory.delete(project._id, page._id).then(function () {
                var idx = self.pages.indexOf(page);
                project.pages.splice(idx, 1);
                $mdToast.showSimple('Page Deleted');
                var numPages = self.pages.length;
                if (numPages === 0) {
                    $state.go('project.pages');
                } else {
                    if (idx == numPages) {
                        idx -= 1;
                    }
                    self.goToPage(self.pages[idx]._id);
                }
            });
        };

        self.completed = function (ev, page, isComplete) {


            //TODO only person it is assigned to can complete, if it is assigned?, else whoever completes it assigns to them and completes


            // Appending dialog to document.body to cover sidenav in docs app
            var dialogContent = $mdDialog.show({
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    //scope: self,        // use parent scope in template
                    preserveScope: true,  // do not forget this if use parent scope
                    templateUrl: 'templates/completeTaskDialog.html',
                    controller: function DialogController($scope, $mdDialog) {
                        $scope.completed = {};
                        $scope.completed.date = new Date();
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function (answer) {
                            $mdDialog.hide(answer);
                        };
                    }
                })
                .then(function (answer) {
                    //TODO update the page to set date completed and hours taken
                    //call function in pagesFactory( need to make) to set the hours and date
                    //put the setcomplete method within the then part OR combine the two promises using $q.all
                    pagesFactory.setComplete(project._id, page._id, {isComplete: isComplete}).then(function (resp) {
                        pagesFactory.setCompletionDetails(project._id, page._id, answer).then(function (resp) {
                            page.completed = isComplete;
                            $mdToast.showSimple('You have completed this page');
                        });
                    });
                });
        };

        self.uncompleted = function (page, isComplete) {
            pagesFactory.setComplete(project._id, page._id, {isComplete: isComplete}).then(function (resp) {
                page.completed = isComplete;
                $mdToast.showSimple('You have unarchived this page');
            });
        };
    }])


    .controller('PageController', ['page', 'project', 'pagesFactory', '$mdToast', function (page, project, pagesFactory, $mdToast) {
        var self = this;
        self.page = page;
        self.minDate = new Date();
        self.team = project.team;


        if (self.page.startDate) {
            self.page.startDate = new Date(Date.parse(self.page.startDate));
        }
        if (self.page.endDate) {
            self.page.endDate = new Date(Date.parse(self.page.endDate));
        }
        if (self.page.reminderDate) {
            self.page.reminderDate = new Date(Date.parse(self.page.reminderDate));
        }

        self.updatePage = function () {
            pagesFactory.updatePage(page.project, self.page).then(function (data) {
                $mdToast.showSimple('Page Updated');
            });
        };

        self.addComment = function () {
            if (self.commentBody === '') {
                return;
            }
            pagesFactory.addComment(page.project, self.page._id, {body: self.commentBody})
                .then(function (data) {
                    var date = new Date(Date.parse(data.createdAt));
                    var day = date.getUTCDate();
                    if (day < 10) {
                        day = "0" + day
                    }
                    var month = date.getMonth() + 1;
                    if (month < 10) {
                        month = "0" + month
                    }
                    var year = date.getFullYear();

                    data.createdAt = day + "-" + month + "-" + year;
                    self.page.comments.push(data);
                    self.commentBody = '';
                });
        };

    }])
;

