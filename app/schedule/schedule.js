angular.module('fringeApp').component('schedule', {
    templateUrl: 'app/schedule/schedule.html',
    controller: ['$scope', '$q', '$timeout', '$routeParams', '$location', 'UserData', 'Data', 'Schedule', 'Availability', 'Plurals',
        function($scope, $q, $timeout, $routeParams, $location, UserData, Data, Schedule, Availability, Plurals) {
            $scope.moment = moment;
            $scope.plurals = Plurals;

            $scope.settings = {scheduleMode: UserData.getSettings().scheduleMode};
            $scope.preferences = UserData.getPreferences();

            var desiredDay;
            if ($routeParams.param1) {
                if (['full', 'smart'].indexOf($routeParams.param1) > -1) {
                    $scope.settings.scheduleMode = $routeParams.param1;
                    if ($routeParams.param2) {
                        desiredDay = $routeParams.param2;
                    }
                } else {
                    desiredDay = $routeParams.param1;
                }
            }

            var baseSchedule;

            var refresh = function() {
                if (! baseSchedule) {
                    return;
                }

                $q.all([
                    Schedule.getPossiblePerformances(),
                    Schedule.getShowsAttending()
                ]).then(function(results) {
                    var possiblePerformances = results[0],
                        showsAttending = results[1],
                        performancesAttending = Schedule.getSchedule();

                    $scope.schedule = baseSchedule.filter(function(entry) {
                        var dayStart = $scope.days[$scope.currentDay - 1];

                        if ($scope.settings.scheduleMode === 'smart' && Schedule.getShowDesire(entry.showId) < 1) {
                            return false;
                        }

                        return (! (entry.performance.start < dayStart || entry.performance.start > dayStart + 86400));
                    }).map(function(entry) {
                        entry.isAttending = performancesAttending.indexOf(entry.id) > -1;
                        entry.canAttend = Availability.isUserAvailable(entry.performance.start, entry.performance.stop);
                        entry.canBeScheduled = possiblePerformances.indexOf(entry.id) > -1;
                        entry.attendState = Schedule.getPerformanceScheduleState(entry.id);

                        return entry;
                    }).filter(function(entry) {
                        if ($scope.settings.scheduleMode === 'full' || entry.attendState === 'yes') {
                            return true;
                        }

                        return entry.canBeScheduled && showsAttending.indexOf(entry.showId) === -1;
                    });
                });
            };

            $timeout(function() {
                $q.all([
                    Data.getAvailabilitySlots(),
                    Data.getSortedPerformances(),
                    Data.getPerformances(),
                    Data.getShows(),
                    Data.getVenues(),
                    Data.getRatings()
                ]).then(function(results) {
                    var sortedPerformances = results[1],
                        performances = results[2],
                        shows = results[3],
                        venues = results[4],
                        ratings = results[5];

                    baseSchedule = sortedPerformances.map(function(pId) {
                        var performance = performances[pId],
                            show = shows[performance.show];

                        return {
                            id: pId,
                            performance: performance,
                            showId: performance.show,
                            show: show,
                            venueId: show.venue,
                            venue: venues[show.venue],
                            rating: ratings[show.rating],
                            isAttending: false,
                            canAttend: false,
                            canBeScheduled: false,
                            attendState: 'no'
                        };
                    });

                    var days = $scope.days = Object.keys(results[0]).map(function(i) {
                        return +i;
                    });

                    $scope.setDay((days.indexOf(moment(desiredDay).unix()) + 1) || (days.indexOf(moment().startOf('day').unix()) + 1) || 1);
                });
            });

            var updatePath = function() {
                if ($scope.days === undefined) {
                    return;
                }
                $location.updatePath(
                    '/schedule/' + $scope.settings.scheduleMode + '/' + moment($scope.days[$scope.currentDay - 1], 'X').format('Y-MM-DD')
                );
            };

            $scope.$watch('settings', function() {
                var settings = UserData.getSettings();
                settings.scheduleMode = $scope.settings.scheduleMode;
                UserData.setSettings(settings);
                updatePath();
                refresh();
            }, true);
            $scope.$watch('userData.preferences', refresh, true);

            $scope.setDay = function(dayId) {
                $scope.currentDay = dayId;
                updatePath();
                refresh();
                setTimeout(function() {
                    window.scroll(0, 196);
                });
            };

            $scope.addToSchedule = function(performanceId) {
                Schedule.add(performanceId);
                refresh();
            };
            $scope.removeFromSchedule = function(performanceId) {
                Schedule.remove(performanceId);
                refresh();
            };
            $scope.addMaybe = function(performanceId) {
                Schedule.addMaybe(performanceId);
                refresh();
            };

        }
    ]
});