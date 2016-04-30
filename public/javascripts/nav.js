angular.module("projectManager")
.controller('NavCtrl',[
    'navItems',
    '$mdSidenav',
    'auth',
    '$state',
    function(navItems,$mdSidenav,auth,$state){
        var self = this;
        self.menuItems = navItems.items;
        self.openedNav = false;
        self.toggleSidenav = function(menuId) {
            $mdSidenav(menuId).toggle();
            self.openedNav = !self.openedNav;
        };
        self.isLoggedIn = auth.isLoggedIn;
        self.name  = auth.currentUser().name;
        self.email = auth.currentUser().email;

        self.logout = function(){
            auth.logOut();
            $state.go('login');
        }
    }])

.factory('navItems',[function(){
    return {
        items:[
            //{ link : 'pages',title: 'Pages',icon: 'dashboard' },
            { link : 'projects',title: 'Projects',icon: 'folder'},
            { link : 'updates',title: 'Updates',icon: 'update' },
            {link: 'upcoming', title: 'Upcoming', icon: 'flag'}
            //{ link : 'calendar',title: 'Calendar',icon: 'date_range' },
            //{link: 'timeline', title: 'Timeline', icon: 'timeline'}
        ],
        //pinned projects array??
        pinned: [{}]
    };
    //return obj;
}]);