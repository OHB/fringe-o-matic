angular.module('fringeApp').controller('GoogleCalendarSyncSetupModalCtrl', [
    '$uibModalInstance', '$scope', '$timeout', 'GoogleCalendarSync', '$analytics', function($uibModalInstance, $scope, $timeout, GoogleCalendarSync, $analytics) {

        $analytics.eventTrack('Open', {category: 'Google Calendar Sync Modal'});

        var timeoutApply = function() {
            $timeout(function() {
                $scope.$apply();
            });
        };

        var refresh = function() {
            $scope.isSetup = GoogleCalendarSync.isSetup();
            $scope.hasPermission = $scope.isSetup || GoogleCalendarSync.hasPermission();
            $scope.isSyncing = false;

            if (! $scope.hasPermission) {
                return;
            }

            if (! $scope.isSetup) {
                GoogleCalendarSync.getCalendars().then(function(calendars) {
                    $scope.primaryCalendar = calendars.shift();
                    $scope.secondaryCalendars = calendars;
                });

                $scope.setupConfig = {
                    target: 'primary',
                    secondary: 'NEW',
                    secondaryName: 'My Fringe'
                };
            } else {
                $scope.calendarUrl = GoogleCalendarSync.getCalendarLink();
            }

            timeoutApply();
        };

        refresh();

        $scope.close = $uibModalInstance.dismiss;

        $scope.requestPermission = function() {
            GoogleCalendarSync.requestPermission().then(function() {
                $scope.apply(refresh);
            });
        };

        $scope.setup = function() {
            var promise;

            $scope.isSetup = true;
            $scope.isSyncing = true;

            if ($scope.setupConfig.target === 'primary') {
                promise = GoogleCalendarSync.setupInExisting($scope.primaryCalendar.id);
            } else if ($scope.setupConfig.secondary === 'NEW') {
                promise = GoogleCalendarSync.setupInNew($scope.setupConfig.secondaryName);
                $analytics.eventTrack('Setup New', {category: 'Google Calendar Sync Modal'});
            } else {
                promise = GoogleCalendarSync.setupInExisting($scope.setupConfig.secondary);
                $analytics.eventTrack('Setup Existing', {category: 'Google Calendar Sync Modal'});
            }

            promise.then(function() {
                $timeout(function() {
                    $scope.$apply(function() {
                        $scope.progress = $scope.max;
                        $timeout(refresh, 500);
                    });
                });
            }, function() {
                $analytics.eventTrack('Setup Failure', {category: 'Google Calendar Sync Modal'});
                refresh();
            }, function(notification) {
                $scope.progress = notification.progress;
                $scope.max = notification.max;
                timeoutApply();
            });
        };

        $scope.turnOff = function() {
            $analytics.eventTrack('Disconnect', {category: 'Google Calendar Sync Modal'});
            GoogleCalendarSync.disconnect();
            $scope.close();
        };
    }
]);