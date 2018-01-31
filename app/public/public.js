angular.module('fringeApp').component('public', {
    templateUrl: 'app/public/public.html',
    controller: ['$scope', '$http', '$routeParams', 'Data', 'Error', function($scope, $http, $routeParams, Data, Error) {
        $scope.moment = moment;

        $scope.sortedPerformances = Data.getSortedPerformances();
        $scope.performances = Data.getPerformances();
        $scope.shows = Data.getShows();
        $scope.venues = Data.getVenues();

        $http.get('api/public.php?hash=' + $routeParams.id).then(function(response) {
            $scope.title = response.data.title;
            $scope.schedule = response.data.schedule;
        }, function() {
            Error.error('Unable to retrieve data from server', 'Please wait a moment and try again.');
        });
    }]
});