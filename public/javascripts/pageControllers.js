angular.module("projectManager")

    .controller('PagesController', ['project', 'pagesFactory', '$state', '$mdToast', function (project, pagesFactory, $state, $mdToast) {
        var self = this;
        self.pages = project.pages;
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

        self.completed = function (page, isComplete) {
            pagesFactory.setComplete(project._id, page._id, {isComplete: isComplete}).then(function (resp) {
                page.completed = isComplete;
                $mdToast.showSimple('You have completed this page');
            });
        };

    }])

    .controller('PageController', ['page', 'pagesFactory', '$mdToast', function (page, pagesFactory, $mdToast) {
        var self = this;
        self.page = page;
        self.minDate = new Date();

        console.log(page);


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

    }]);