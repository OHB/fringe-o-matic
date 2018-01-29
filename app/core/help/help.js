angular.module('fringeApp').controller('HelpCtrl', ['$scope', '$route', '$routeParams', function($scope, $route, $routeParams) {
    var parts = $route.current.$$route.originalPath.split('/');
    $scope.currentRoute = parts[1];

    if (parts[1] === 'my-fringe' && $routeParams.subpage) {
        $scope.currentRoute += '/' + $routeParams.subpage;
    }

    $scope.topics = [];
}]);