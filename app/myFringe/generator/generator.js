angular.module('fringeApp').component('myFringeGenerator', {
    templateUrl: 'app/myFringe/generator/generator.html',
    controller: ['$scope', '$uibModal', '$q', 'Data', 'Schedule', 'Plurals', function($scope, $uibModal, $q, Data, Schedule, Plurals) {
        $scope.plurals = Plurals;
        $scope.desiredShowCount = Schedule.getDesiredShows().length;
        $scope.onScheduleCount = Schedule.getPerformancesAttending().length;

        $q.all([Data.getPerformances(), Schedule.getPossiblePerformances()]).then(function(results) {
            var performances = results[0],
                possiblePerformances = results[1];

            $scope.possiblePerformanceCount = possiblePerformances.length;
            $scope.possibleDesiredCount = possiblePerformances.filter(function(performance) {
                return Schedule.getShowDesire(performances[performance]) > 0;
            }).length;

            console.log($scope.possibleDesiredCount);
            $scope.loaded = true;
        });

        $scope.generate = function() {
            $uibModal.open({
                templateUrl: 'app/myFringe/generator/generateModal/generateModal.html',
                controller: 'GenerateModalCtrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });
        };
    }]
});