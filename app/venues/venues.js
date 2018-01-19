angular.module('fringeApp').component('venues', {
    templateUrl: 'app/venues/venues.html',
    controller: ['$q', '$scope', 'Data', function($q, $scope, Data) {
        $q.all([Data.getVenues(), Data.getVenueHosts(), Data.getVenueDistances()]).then(function(results) {
            $scope.venues = results[0];
            $scope.venueHosts = results[1];
            $scope.distances = results[2];

            $scope.venueOptions = Object.keys($scope.venues).map(function(id) {
                return {value: id, label: $scope.venues[id].name};
            }).sort(function(a, b) {
                return a.label.localeCompareSmart(b.label);
            });

            $scope.distanceCalcFrom = $scope.venueOptions.randomElement();

            while ($scope.distanceCalcTo === undefined || $scope.distanceCalcTo === $scope.distanceCalcFrom) {
                $scope.distanceCalcTo = $scope.venueOptions.randomElement();
            }

        });

        $scope.getHostVenues = function(hostId) {
            return Object.keys($scope.venues).filter(function(venue) {
                return $scope.venues[venue].host === hostId;
            }).sort(function(a, b) {
                return $scope.venues[a].name.localeCompareSmart($scope.venues[b].name);
            });
        };

        var updateDrivingCalc = function() {
            var list = [
                    $scope.venueHosts[$scope.venues[$scope.distanceCalcFrom.value].host].driving,
                    $scope.venueHosts[$scope.venues[$scope.distanceCalcTo.value].host].driving
                ],
                priority = ['assumed', 'recommended', 'possible'];

            $scope.drivingCalc = false;

            for (var i = 0; i < priority.length; i ++) {
                if (list.indexOf(priority[i]) > -1) {
                    $scope.drivingCalc = priority[i];

                    return;
                }
            }
        };

        $scope.$watch('distanceCalcFrom', updateDrivingCalc);
        $scope.$watch('distanceCalcTo', updateDrivingCalc);
    }]
});