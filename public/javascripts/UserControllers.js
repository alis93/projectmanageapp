/**
 * Created by sulmanali on 04/04/2016.
 */
angular.module("projectManager")
    .controller('UserController', ['user', function (user) {

        var self = this;

        console.log(user);

        self.user = user;


    }]);

