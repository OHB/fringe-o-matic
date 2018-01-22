angular.module('fringeApp').component('venues', {
    templateUrl: 'app/venues/venues.html',
    controller: ['$q', '$scope', 'Data', function($q, $scope, Data) {
        $scope.distanceCalc = {from: 0, to: undefined, driving: ''};

        $scope.getHostVenues = function(hostId) {
            return Object.keys($scope.venues).filter(function(venue) {
                return $scope.venues[venue].host === hostId;
            }).sort(function(a, b) {
                return $scope.venues[a].name.localeCompareSmart($scope.venues[b].name);
            });
        };

        var updateDrivingCalc = function() {
            if (! $scope.distanceCalc.from || ! $scope.distanceCalc.to) {
                return;
            }

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

        $q.all([Data.getVenues(), Data.getVenueHosts(), Data.getVenueDistances()]).then(function(results) {
            $scope.venues = results[0];
            $scope.venueHosts = results[1];
            $scope.distances = results[2];

            $scope.venueOptions = Object.keys($scope.venues).map(function(id) {
                return {value: id, label: $scope.venues[id].name};
            }).sort(function(a, b) {
                return a.label.localeCompareSmart(b.label);
            });

            $scope.distanceCalc.from = $scope.venueOptions.randomElement();

            while ($scope.distanceCalc.to === undefined || $scope.distanceCalc.to === $scope.distanceCalc.from) {
                $scope.distanceCalc.to = $scope.venueOptions.randomElement();
            }
        });
    }]
});