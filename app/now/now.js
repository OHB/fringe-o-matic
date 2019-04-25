angular.module('fringeApp').component('now', {
    templateUrl: 'app/now/now.html',
    controller: [
        '$scope', 'Data',
        function ($scope, Data) {
            $scope.moment = moment;
            $scope.shows = Data.getShows();
            $scope.venues = Data.getVenues();

            var sortedPerformances = Data.getSortedPerformances(),
                performances = Data.getPerformances();

            $scope.update = function() {
                $scope.now = Date.now() / 1000;
                $scope.now += 60 * 60 * 24 * 30;
                $scope.now += 49.5 * 60;

                $scope.nowShows = [];
                angular.forEach($scope.venues, function(venue, venueId) {
                    var currentPerformance, nextPerformance;

                    for (var i = 0; i < sortedPerformances.length; i ++) {
                        var pId = sortedPerformances[i],
                            performance = performances[pId];

                        // console.log(performance);

                        if ($scope.shows[performance.show].venue !== venueId) {
                            continue;
                        }

                        if (performance.stop <= $scope.now) {
                            continue;
                        }

                        if (performance.start <= $scope.now) {
                            currentPerformance = performance;
                        } else {
                            nextPerformance = performance;
                        }

                        if (nextPerformance) {
                            break;
                        }
                    }

                    $scope.nowShows.push({
                        id: venueId,
                        currentPerformance: currentPerformance,
                        nextPerformance: nextPerformance
                    });
                });

                setTimeout($scope.update, 30000);
            };

            $scope.update();
        }
    ]
});