angular.module('fringeApp').component('schedule', {
    templateUrl: 'app/schedule/schedule.html',
    controller: ['$scope', '$timeout', '$route', '$routeParams', 'UserData', 'Data', 'Schedule', 'Availability', 'Plurals',
        function($scope, $timeout, $route, $routeParams, UserData, Data, Schedule, Availability, Plurals) {
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

            var sortedPerformances = Data.getSortedPerformances(),
                performances = Data.getPerformances(),
                shows = Data.getShows(),
                venues = Data.getVenues(),
                ratings = Data.getRatings(),
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
                }),
                days = $scope.days = Object.keys(Data.getAvailabilitySlots()).map(function(i) {
                    return +i;
                })
            ;

            var refresh = function() {
                if (! baseSchedule) {
                    return;
                }

                var possiblePerformances = Schedule.getPossiblePerformances(),
                    showsAttending = Schedule.getShowsAttending(),
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
            };

            var updatePath = function() {
                if ($scope.days === undefined) {
                    return;
                }
                $route.updateParams({
                    param1: $scope.settings.scheduleMode,
                    param2: moment($scope.days[$scope.currentDay - 1], 'X').format('Y-MM-DD')
                });
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

            $scope.setDay((days.indexOf(moment(desiredDay).unix()) + 1) || (days.indexOf(moment().startOf('day').unix()) + 1) || 1);
            
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

            $timeout(function() {
                $scope.loaded = true;
            });
        }
    ]
});