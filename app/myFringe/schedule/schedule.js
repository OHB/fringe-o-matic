angular.module('fringeApp').component('myFringeSchedule', {
    templateUrl: 'app/myFringe/schedule/schedule.html',
    controller: ['$scope', 'Schedule', 'Data', function($scope, Schedule, Data) {
        var shows, performances, venues, venueDistances;

        $scope.moment = moment;

        $scope.refresh = function() {
            $scope.amazingSchedule = {};
            var previousOfDay;

            $scope.hasPreferences = Schedule.getDesiredShows().length > 0;
            $scope.hasSchedule = Schedule.getSchedule().length > 0;

            var sortedSchedule = Schedule.getSortedSchedule();

            angular.forEach(sortedSchedule, function(performanceId) {
                var performance = performances[performanceId],
                    day = moment(performance.start, 'X').startOf('day').format('X');

                if ($scope.amazingSchedule[day] === undefined) {
                    previousOfDay = undefined;
                    $scope.amazingSchedule[day] = [];
                }

                if (previousOfDay) {
                    var venue1 = shows[previousOfDay.show].venue,
                        venue2 = shows[performance.show].venue,
                        minutes = venueDistances[venue1][venue2] / 60,
                        type = minutes < 15 ? 'Walk' : 'Travel';

                    if (performance.start - previousOfDay.stop > 3600) {
                        var hour = moment(previousOfDay.stop, 'X').hour(),
                            text = '';
                        if (hour > 15 && hour < 19) {
                            text = 'Dinner time!';
                        } else if (hour > 10 && hour < 14) {
                            text = 'Lunch time!';
                        } else {
                            text = [
                                'Snack time!',
                                'Drinks on the Great Green Lawn of Fabulousness!',
                                'Eat some cheese curds.',
                                'See what\'s happening in the ourdoor tent.'
                            ].randomElement();
                        }
                        $scope.amazingSchedule[day].push({
                            as: 'break',
                            text: text
                        });
                    } else {
                        $scope.amazingSchedule[day].push({
                            as: 'travel',
                            text: type + ' to ' + venues[venue2].name
                        });
                    }
                }

                $scope.amazingSchedule[day].push({
                    as: 'performance',
                    id: performanceId,
                    start: performance.start,
                    stop: performance.stop,
                    show: performance.show
                });

                previousOfDay = performance;
            });
        };

        $scope.removeFromSchedule = function(performanceId) {
            Schedule.remove(performanceId);
            $scope.refresh();
        };

        $scope.shows = shows = Data.getShows();
        performances = Data.getPerformances();
        $scope.venues = venues = Data.getVenues();
        venueDistances = Data.getVenueDistances();

        $scope.refresh();
    }]
});