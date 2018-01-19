angular.module('fringeApp').component('schedule', {
    templateUrl: 'app/schedule/schedule.html',
    controller: [
        '$scope', '$timeout', '$window', '$q', 'Data', 'Schedule', 'UserData', 'Plurals',
        function($scope, $timeout, $window, $q, Data, Schedule, UserData, Plurals) {
            var baseSchedule;

            $scope.moment = moment;
            $scope.plurals = Plurals;

            $scope.userData = {settings: UserData.getSettings(), preferences: UserData.getPreferences()};

            $q.all([
                Data.getAvailabilitySlots(),
                Data.getSortedPerformances(),
                Data.getPerformances(),
                Data.getShows(),
                Data.getVenues(),
                Data.getRatings()
            ]).then(function(results) {
                var availabilitySlots = results[0],
                    sortedPerformances = results[1],
                    performances = results[2],
                    shows = results[3],
                    venues = results[4],
                    ratings = results[5];

                $scope.days = Object.keys(availabilitySlots).map(function(i) {
                    return +i;
                });

                $scope.currentDay = ($scope.days.indexOf(moment().startOf('day').unix()) + 1) || 1;

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
                        canAttend: false,
                        canBeScheduled: false,
                        attendState: 'no'
                    };
                });

                refresh();
            });

            $scope.attendState = {};

            var refresh = function() {
                if (! baseSchedule) {
                    return;
                }

                var entries = baseSchedule.filter(function(entry) {
                    var dayStart = $scope.days[$scope.currentDay - 1];

                    return (! (entry.performance.start < dayStart || entry.performance.start > dayStart + 86400));
                });

                var qLists = {
                    canUserAttendPerformance: {},
                    canPerformanceBeAddedToSchedule: {},
                    isUserAttendingShow: {}
                };
                entries.map(function(entry) {
                    entry.isAttending = Schedule.isUserAttendingPerformance(entry.id);
                    entry.attendState = Schedule.getPerformanceScheduleState(entry.id);
                    if (entry.isAttending) {
                        qLists.canUserAttendPerformance[entry.id] = Schedule.canUserAttendPerformance(entry.id);
                        qLists.canPerformanceBeAddedToSchedule[entry.id] = Schedule.canPerformanceBeAddedToSchedule(entry.id);
                        qLists.isUserAttendingShow[entry.show.id] = Schedule.isUserAttendingShow(entry.showId);
                    }

                    return entry;
                });
                $q.all([
                    qLists.canUserAttendPerformance,
                    qLists.canPerformanceBeAddedToSchedule,
                    qLists.isUserAttendingShow
                ]).then(function(results) {
                    var canUserAttendPerformance = results[0],
                        canPerformanceBeAddedToSchedule = results[1],
                        isUserAttendingShow = results[2];

                    $scope.schedule = entries.map(function(entry) {
                        entry.canAttend = ! entry.isAttending && canUserAttendPerformance[entry.id];
                        entry.canBeScheduled = entry.canAttend && canPerformanceBeAddedToSchedule[entry.id];

                        return entry;

                    }).filter(function(entry) {
                        if ($scope.userData.settings.scheduleMode === 'smart') {
                            if (entry.attendState === 'yes') {
                                return true;
                            }
                            if (! entry.canAttend) {
                                return false;
                            }
                            if (isUserAttendingShow[entry.showId]) {
                                return false;
                            }
                        }

                        return true;
                    });
                });
            };

            $scope.$watch('userData.settings', function() {
                UserData.setSettings($scope.userData.settings);

                refresh();
            });
            $scope.$watch('userData.preferences', refresh);

            $scope.setDay = function(dayId) {
                $scope.currentDay = dayId;
                refresh();
                $timeout(function() {
                    $window.scroll(0, 196);
                });

            };
        }
    ]
});