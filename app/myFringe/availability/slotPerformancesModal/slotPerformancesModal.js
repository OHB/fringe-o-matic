angular.module('fringeApp').controller('slotPerformancesModalCtrl', [
    '$uibModalInstance', '$scope', 'Data', 'Schedule', 'Sorters', 'slotStart', 'slotStop', 'slotPerformances', '$analytics',
    function($uibModalInstance, $scope, Data, Schedule, Sorters, slotStart, slotStop, slotPerformances, $analytics) {
        $analytics.eventTrack('Open', {category: 'Slot Performances Modal'});

        $scope.slotStart = slotStart;
        $scope.slotStop = slotStop;

        $scope.shows = Data.getShows();
        $scope.performances = Data.getPerformances();
        $scope.venues = Data.getVenues();

        $scope.slotPerformances = slotPerformances.sort(function(a, b) {
            return Sorters.performance($scope.performances[a], $scope.performances[b]);
        });

        $scope.ok = function() {
            $uibModalInstance.close();
        };

        $scope.remove = function(performanceId) {
            $analytics.eventTrack('Remove Performance', {category: 'Slot Performances Modal'});
            Schedule.remove(performanceId);
            $scope.slotPerformances.remove(performanceId);

            if ($scope.slotPerformances.length === 0) {
                $scope.ok();
            }
        };
    }
]);