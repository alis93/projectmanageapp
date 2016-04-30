/**
 * Created by sulmanali on 29/02/2016.
 */
angular.module("projectManager")
    .controller('updatesController', ['projectsFactory', 'allProjects', '$state', function (projectsFactory, allProjects, $state) {

        console.log(allProjects);
        var self = this;
        self.projects = allProjects;
        self.updatesList = [];

        self.projects.forEach(function (project) {
            if (project.updates.length > 0) {
                Array.prototype.push.apply(self.updatesList, project.updates);
            }
        });


        self.goToLink = function (urlString) {
            //replace match with split at / and use
            //resultant array? ie split at /
            //if length 2 then go project, if 3 then pages
            //if 4 then a page????
            if (urlString.match('(^\/projects\/.{24}$)')) {
                console.log('go to a project');
                $state.go('project.pages', {projectId: urlString.split('/')[2]});

            } else if (urlString.match('(^\/projects\/.{24}\/pages$)')) {
                console.log('go to all pages in a project');
                $state.go('project.pages', {projectId: urlString.split('/')[2]});
            }
            else if ('(^\/projects\/.{24}\/pages\/.{24}$)') {
                console.log('go to a page');
                var splitString = urlString.split('/');
                $state.go('project.pages.page',
                    {projectId: splitString[2], pageId: splitString[4]});
            } else if ('(^\/projects\/.{24}\/team') {
                console.log('go to project team');
                var splitString = urlString.split('/');
                $state.go('project.team', {projectId: splitString[2]});
            }
        }

    }]);

