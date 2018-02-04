angular.module('fringeApp').component('venues', {
    templateUrl: 'app/venues/venues.html',
    controller: ['$scope', 'Data', '$analytics', function($scope, Data) {
        $scope.getHostVenues = function(hostId) {
            return Object.keys($scope.venues).filter(function(venue) {
                return $scope.venues[venue].host === hostId;
            }).sort(function(a, b) {
                return $scope.venues[a].name.localeCompareSmart($scope.venues[b].name);
            });
        };

        $scope.venues = Data.getVenues();
        $scope.venueHosts = Data.getVenueHosts();
    }]
});