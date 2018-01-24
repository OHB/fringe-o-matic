angular.module('fringeApp').controller('slotPerformancesModalCtrl', [
    '$uibModalInstance', '$scope', 'Data', 'Schedule', 'Sorters', 'slotStart', 'slotStop', 'slotPerformances',
    function($uibModalInstance, $scope, Data, Schedule, Sorters, slotStart, slotStop, slotPerformances) {
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
            Schedule.remove(performanceId);
            $scope.slotPerformances.remove(performanceId);

            if ($scope.slotPerformances.length === 0) {
                $scope.ok();
            }
        };
    }
]);