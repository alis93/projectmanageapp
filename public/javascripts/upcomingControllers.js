/**
 * Created by sulmanali on 01/03/2016.
 */
angular.module("projectManager")
    .controller('upcomingController', ['upcomingUserEvents', '$state', function (upcomingUserEvents, $state) {
        var self = this;
        self.eventList = upcomingUserEvents.filter(function (event) {
            var now = Date.parse(new Date());
            var date = Date.parse(event.date);

            if (date >= now) {
                return event;
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
            }
        }


    }]);