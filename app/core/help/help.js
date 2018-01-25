angular.module('fringeApp').controller('HelpCtrl', ['$scope', '$route', '$routeParams', function($scope, $route, $routeParams) {
    var parts = $route.current.$$route.originalPath.split('/');
    $scope.currentRoute = parts[1];

    if (parts[1] === 'my-fringe' && $routeParams.subpage) {
        $scope.currentRoute += '/' + $routeParams.subpage;
    }

    var help = {
        'my-fringe': {
            title: 'My Fringe',
            topics: []
        },
        'my-fringe/availability': {
            title: 'My Availability',
            topics: []
        },
        'my-fringe/auto-scheduler': {
            title: 'Auto-Scheduler',
            topics: []
        },
        shows: {
            title: 'Shows',
            topics: []
        },
        schedule: {
            title: 'Schedule',
            topics: []
        },
        venues: {
            title: 'Venues',
            topics: []
        },
        map: {
            title: 'Map',
            topics: []
        },
        about: {
            title: 'About',
            topics: []
        }
    };

    $scope.title = help[$scope.currentRoute].title;
    $scope.topics = help[$scope.currentRoute].topics;
}]);