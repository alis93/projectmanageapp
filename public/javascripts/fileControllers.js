angular.module("projectManager")

    .controller('FilesController', ['project', 'filesFactory', '$mdToast', '$mdDialog', '$filter', function (project, filesFactory, $mdToast, $mdDialog, $filter) {
        var self = this;
        self.files = project.files;

        console.log(self.files);

        self.files.map(function (file) {
            file.uploadDate = $filter('date')(file.uploadDate, 'dd/MM/yyyy');
        });

        self.deleteFile = function (file) {
            filesFactory.deleteFile(project._id, file);
            //.then();
        };

    }])

    .controller('FileController', ['project', 'filesFactory', '$state', function (project, filesFactory, $state) {
        var self = this;
        self.file = ' ';

        self.uploadFile = function () {
            filesFactory.uploadFile(self.file, project._id)
                .then(function (file) {
                    project.files.push(file);
                    $state.go('project.files')
                });
        };

    }]);