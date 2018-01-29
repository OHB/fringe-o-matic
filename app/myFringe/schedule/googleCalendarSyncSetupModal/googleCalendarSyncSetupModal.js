angular.module('fringeApp').controller('GoogleCalendarSyncSetupModalCtrl', [
    '$uibModalInstance', '$scope', '$timeout', 'GoogleCalendarSync', function($uibModalInstance, $scope, $timeout, GoogleCalendarSync) {

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
            } else {
                promise = GoogleCalendarSync.setupInExisting($scope.setupConfig.secondary);
            }

            promise.then(function() {
                $timeout(function() {
                    $scope.$apply(function() {
                        $scope.progress = $scope.max;
                        $timeout(refresh, 500);
                    });
                });
            }, function() {
                refresh();
            }, function(notification) {
                $scope.progress = notification.progress;
                $scope.max = notification.max;
                timeoutApply();
            });
        };

        $scope.turnOff = function() {
            GoogleCalendarSync.disconnect();
            $scope.close();
        };
    }
]);