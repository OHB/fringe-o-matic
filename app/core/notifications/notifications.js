angular.module('fringeApp').controller('NotificationsCtrl', [
    '$scope', '$timeout', 'Schedule', 'Data', 'Plurals',
    function($scope, $timeout, Schedule, Data, Plurals) {
        $scope.plurals = Plurals;
        $scope.moment = moment;

        $scope.shows = Data.getShows();
        $scope.performances = Data.getPerformances();
        $scope.venues = Data.getVenues();

        var refresh = function() {
            var todayStart = moment().startOf('day').unix(),
                todayEnd = todayStart + 86400,
                now = Date.now() / 1000;

            if (! Data.isFringeOngoing()) {
                $scope.show = false;

                return;
            }

            $scope.show = true;

            $scope.remainingTodayPerformances = Schedule.getSortedSchedule().filter(function(performanceId) {
                var start = Data.getPerformance(performanceId).start;

                return start > now && start <= todayEnd;
            });
            $scope.futurePerformances = Schedule.getSortedSchedule().filter(function(performanceId) {
                return Data.getPerformance(performanceId).start > todayEnd;
            });

            $timeout(refresh, 300);
        };

        refresh();
    }
]);