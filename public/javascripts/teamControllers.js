/**
 * Created by sulmanali on 01/03/2016.
 */


angular.module("projectManager")
    .controller('TeamController', ['project', 'projectsFactory', '$state', '$mdToast', function (project, projectsFactory, $state, $mdToast) {
        var self = this;
        self.team = project.team;
        self.pending = project.pendingEmails;
        self.invite = {email: "", message: ""};
        self.inviteMember = function () {
            projectsFactory.inviteMember(project._id, self.invite).then(
                function (data) {
                    $mdToast.showSimple(data.msg);
                    if (data.newInvite) {
                        self.pending.push(self.invite.email);
                    }
                    self.invite = {};
                }
            );
        };

        self.goToMember = function (memberId) {
            //TODO individual member pages
            $state.go('user', {userID: memberId});
        };
        //TODO CANCEL INVITES??
    }]);