angular.module('fringeApp').component('schedule', {
    templateUrl: 'app/schedule/schedule.html',
    controller: ['$scope', '$timeout', '$location', '$routeParams', 'User', 'Data', 'Schedule', 'Availability', 'Plurals', '$analytics',
        function($scope, $timeout, $location, $routeParams, User, Data, Schedule, Availability, Plurals, $analytics) {
            $scope.signedIn = User.isSignedIn();
            $scope.moment = moment;
            $scope.plurals = Plurals;
            $scope.online = navigator.onLine;

            $scope.settings = {scheduleMode: User.getSettings().scheduleMode};
            $scope.preferences = User.getPreferences();

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

            if (! $scope.signedIn) {
                $scope.settings.scheduleMode = 'full';
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
                        minutes: (performances[show.performances[0]].stop - performances[show.performances[0]].start) / 60,
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

                $scope.dataLoaded = false;

                var possiblePerformances = Schedule.getPossiblePerformances(),
                    showsAttending = Schedule.getShowsAttending(),
                    performancesAttending = Schedule.getSchedule(),
                    now = Date.now() / 1000;

                $scope.schedule = baseSchedule.filter(function(entry) {
                    return (! (entry.performance.start < $scope.filter.currentDay || entry.performance.start > $scope.filter.currentDay + 86400));
                }).map(function(entry) {
                    entry.isAttending = performancesAttending.indexOf(entry.id) > -1;
                    entry.canAttend = Availability.isUserAvailable(entry.performance.start, entry.performance.stop);
                    entry.canBeScheduled = possiblePerformances.indexOf(entry.id) > -1;
                    entry.attendState = Schedule.getPerformanceScheduleState(entry.id);
                    entry.inPast = entry.performance.start < now;

                    return entry;
                }).filter(function(entry) {
                    if ($scope.settings.scheduleMode === 'full' || entry.attendState === 'yes') {
                        return true;
                    }

                    return ! entry.inPast && entry.canBeScheduled && showsAttending.indexOf(entry.showId) === -1;
                });
                $scope.dataLoaded = true;
                $scope.displayedSchedule = $scope.schedule.slice(0, 10);
            };

            $scope.addMoreItems = function() {
                var displayed = $scope.displayedSchedule.length;

                for (var i = displayed; i < displayed + 5; i ++) {
                    if ($scope.schedule[i] === undefined) {
                        break;
                    }

                    $scope.displayedSchedule.push($scope.schedule[i]);
                }
            };

            var updatePath = function() {
                if ($scope.days === undefined || $scope.days.indexOf($scope.filter.currentDay) === -1) {
                    return;
                }

                $location.path('/schedule/' + $scope.settings.scheduleMode + '/' + moment($scope.filter.currentDay, 'X').format('Y-MM-DD'), false);
            };

            $scope.$watch('settings', function() {
                if ($scope.online) {
                    var settings = User.getSettings();
                    settings.scheduleMode = $scope.settings.scheduleMode;
                    User.setSettings(settings);

                    $analytics.eventTrack('Click', {
                        category: 'Schedule',
                        label: 'Schedule Mode: ' + ($scope.settings.scheduleMode === 'full' ? 'Full' : 'Smart')
                    });
                }
                updatePath();
                refresh();
            }, true);
            $scope.$watch('userData.preferences', refresh, true);

            $scope.filter = {currentDay: 0, dayId: 0};
            if (days.indexOf(moment(desiredDay).unix()) > -1) {
                $scope.filter.currentDay = moment(desiredDay).unix();
            } else if (days.indexOf(moment().startOf('day').unix()) > -1) {
                $scope.filter.currentDay = moment().startOf('day').unix();
            } else {
                $scope.filter.currentDay = days[0];
            }

            $scope.$watch('filter.currentDay', function() {
                $scope.filter.dayId = $scope.days.indexOf($scope.filter.currentDay) + 1;
                updatePath();
                refresh();
                setTimeout(function() {
                    window.scroll(0, 196);
                });
            });

            $scope.addToSchedule = function(performanceId) {
                $analytics.eventTrack('Click', {category: 'Schedule', label: 'Add to Schedule'});
                Schedule.add(performanceId);
                refresh();
            };
            $scope.removeFromSchedule = function(performanceId) {
                $analytics.eventTrack('Click', {category: 'Schedule', label: 'Remove to Schedule'});
                Schedule.remove(performanceId);
                refresh();
            };
            $scope.addMaybe = function(performanceId) {
                $analytics.eventTrack('Click', {category: 'Schedule', label: 'Add to Maybe'});
                Schedule.addMaybe(performanceId);
                refresh();
            };

            $timeout(function() {
                $scope.loaded = true;
            });
        }
    ]
});