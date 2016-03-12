/**
 * Created by sulmanali on 01/03/2016.
 */


angular.module("projectManager")
    .controller('TeamController', ['project', 'projectsFactory', '$state', '$mdToast', function (project, projectsFactory, $state, $mdToast) {
        var self = this;
        self.team = project.team;
        self.pending = project.pending;
        self.invite = {email: "", message: ""};

        self.inviteMember = function () {
            console.log(self.invite);
            projectsFactory.inviteMember(project._id, self.invite).then(
                function (data) {
                    console.log(data);
                    //if(!data.exists && data.invite){
                    //    self.pending.push(data.invite);
                    //}
                    //if(self.team.includes(data)) {
                    //    $mdToast.showSimple(data.name + "has been sent an invite!");
                    //}else if(self.invite.includes(data)) {
                    //    $mdToast.showSimple(data.name + "has been sent another invite!");
                    //}else{
                    //    $mdToast.showSimple(data.name + "has been sent an invite!");
                    //}
                }
            );
        };

        self.goToMember = function (memberId) {
            console.log('member id: ' + memberId);
            //$state.go(/to the user {userID:memberId});
        };

    }]);