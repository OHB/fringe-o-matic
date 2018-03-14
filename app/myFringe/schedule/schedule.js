angular.module('fringeApp').component('myFringeSchedule', {
    templateUrl: 'app/myFringe/schedule/schedule.html',
    controller: ['$scope', '$uibModal', '$timeout', 'Schedule', 'Data', 'GoogleCalendarSync', 'Configuration', function($scope, $uibModal, $timeout, Schedule, Data, GoogleCalendarSync, Configuration) {
        var performances = Data.getPerformances(),
            venueDistances = Data.getVenueDistances();

        $scope.moment = moment;
        $scope.interestText = Configuration.interestText;
        $scope.filter = {currentDay: 0};

        $scope.shows = Data.getShows();
        $scope.venues = Data.getVenues();

        $scope.refresh = function() {
            $scope.amazingSchedule = {};
            $scope.calendarSyncEnabled = GoogleCalendarSync.isSetup();
            $scope.hasPreferences = Schedule.getDesiredShows().length > 0;
            $scope.hasSchedule = Schedule.getSchedule().length > 0;

            angular.forEach(Schedule.getSortedSchedule(), function(performanceId) {
                var performance = performances[performanceId],
                    day = moment(performance.start, 'X').startOf('day').unix();

                if ($scope.amazingSchedule[day] === undefined) {
                    $scope.amazingSchedule[day] = [];
                }

                $scope.amazingSchedule[day].push({
                    as: 'performance',
                    id: performanceId,
                    start: performance.start,
                    stop: performance.stop,
                    show: performance.show,
                    storeUrl: performance.storeUrl
                });
            });

            $scope.days = Object.keys($scope.amazingSchedule).map(function(i) {
                return +i;
            });

            $timeout(function() {
                $scope.loaded = true;
            });
        };

        $scope.removeFromSchedule = function(performanceId) {
            Schedule.remove(performanceId);
            $scope.refresh();
        };

        $scope.refresh();

        if ($scope.days.indexOf(moment().startOf('day').unix()) > -1) {
            $scope.filter.currentDay = moment().startOf('day').unix();
        } else {
            $scope.filter.currentDay = 0;
        }

        $scope.openShareModal = function() {
            $uibModal.open({
                templateUrl: 'app/myFringe/schedule/shareModal/shareModal.html',
                controller: 'ShareModalCtrl',
                size: 'md'
            });
        };

        $scope.openGoogleCalendarSyncSetup = function() {
            $uibModal.open({
                templateUrl: 'app/myFringe/schedule/googleCalendarSyncSetupModal/googleCalendarSyncSetupModal.html',
                controller: 'GoogleCalendarSyncSetupModalCtrl',
                size: 'md'
            }).result.then(function() {
                $scope.refresh();
            }, function() {
                $scope.refresh();
            });
        };
    }]
});