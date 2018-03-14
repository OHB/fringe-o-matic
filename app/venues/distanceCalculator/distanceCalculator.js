angular.module('fringeApp').component('distanceCalculator', {
    templateUrl: 'app/venues/distanceCalculator/distanceCalculator.html',
    controller: ['$scope', 'Data', '$analytics', function($scope, Data, $analytics) {

        $scope.distanceCalc = {from: 0, to: undefined};
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

            var distances = $scope.distances[$scope.distanceCalc.from.value][$scope.distanceCalc.to.value];

            console.log($scope.distanceCalc, distances);
            $scope.timeWalk = distances[0];
            $scope.timeDrive = distances[1];
            $scope.timeMinimum = $scope.timeDrive !== undefined ? Math.min($scope.timeWalk, $scope.timeDrive) : $scope.timeWalk;
            $scope.recommend = 'walk';
            if ($scope.timeDrive && $scope.timeWalk - $scope.timeDrive > 600) {
                $scope.recommend = 'drive';
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