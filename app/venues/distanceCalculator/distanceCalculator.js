angular.module('fringeApp').component('distanceCalculator', {
    templateUrl: 'app/venues/distanceCalculator/distanceCalculator.html',
    controller: ['$scope', 'Data', '$analytics', function($scope, Data, $analytics) {

        $scope.distanceCalc = {from: 0, to: undefined, driving: ''};
        $scope.venues = Data.getVenues();
        $scope.venueHosts = Data.getVenueHosts();
        $scope.distances = Data.getVenueDistances();

        var first = 2;
        var updateDrivingCalc = function() {
            if (! $scope.distanceCalc.from || ! $scope.distanceCalc.to) {
                return;
            }

            if (! first) {
                $analytics.eventTrack('Calculate Distance', {
                    category: 'Venues',
                    label: $scope.venues[$scope.distanceCalc.from.value].name + ' to ' + $scope.venues[$scope.distanceCalc.to.value].name});
            }
            first --;

            var list = [
                    $scope.venueHosts[$scope.venues[$scope.distanceCalc.from.value].host].driving,
                    $scope.venueHosts[$scope.venues[$scope.distanceCalc.to.value].host].driving
                ],
                priority = ['assumed', 'recommended', 'possible'];

            $scope.distanceCalc.driving = '';

            for (var i = 0; i < priority.length; i ++) {
                if (list.indexOf(priority[i]) > -1) {
                    $scope.distanceCalc.driving = priority[i];

                    return;
                }
            }
        };

        $scope.$watch('distanceCalc.from', updateDrivingCalc);
        $scope.$watch('distanceCalc.to', updateDrivingCalc);

        $scope.venueOptions = Object.keys($scope.venues).map(function(id) {
            return {value: id, label: $scope.venues[id].name};
        }).sort(function(a, b) {
            return a.label.localeCompareSmart(b.label);
        });

        $scope.distanceCalc.from = $scope.venueOptions.randomElement();

        while ($scope.distanceCalc.to === undefined || $scope.distanceCalc.to === $scope.distanceCalc.from) {
            $scope.distanceCalc.to = $scope.venueOptions.randomElement();
        }
    }]
});