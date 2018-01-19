angular.module('fringeApp').component('my-fringe-generator', {
    templateUrl: 'app/myFringe/generator/generator.html',
    controller: ['$scope', '$uibModal', '$q', 'Schedule', function($scope, $uibModal, $q, Schedule) {
        $scope.hasSelectedShows = false;

        var desiredShows = Schedule.getDesiredShows();

        $scope.desiredShowCount = desiredShows.length;
        $scope.hasSelectedShows = $scope.desiredShowCount > 0;
        $scope.onScheduleCount = Schedule.getPerformancesAttending.length;
        $scope.toPlaceCount = $scope.desiredShowCount - $scope.onScheduleCount;

        $scope.desiredPerformanceCount = 0;
        $scope.generatePossible = false;

        angular.forEach(desiredShows, function(showId) {
            Schedule.isUserAttendingShow(showId).then(function(isAttending) {
                if (! isAttending) {
                    $scope.desiredPerformanceCount ++;

                    Schedule.canShowBeAddedToSchedule(showId).then(function(canBeAdded) {
                        if (canBeAdded) {
                            Schedule.canUserAttendShow(showId).then(function(canAttend) {
                                if (canAttend) {
                                    $scope.generatePossible = true;
                                }
                            });
                        }
                    });
                }
            });
        });

        $scope.generate = function() {
            $uibModal.open({
                templateUrl: 'createScheduleModal.html',
                controller: 'CreateScheduleModalCtrl',
                controllerAs: '$ctrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                scope: $scope
            });
        };

        // $scope.generate();
    }]
});