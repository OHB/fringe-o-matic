angular.module('fringeApp').component('myFringe', {
    templateUrl: 'app/myFringe/myFringe.html',
    controller: ['$scope', '$route', '$routeParams', 'Schedule', 'UserData', 'Configuration', 'Plurals', function($scope, $route, $routeParams, Schedule, UserData, Configuration, Plurals) {
        $scope.plurals = Plurals;
        $scope.tabs = {
            activeTab: 'My Schedule'
        };
        if ($routeParams.subpage === 'availability') {
            $scope.tabs.activeTab = 'My Availability';
        } else if ($routeParams.subpage === 'auto-scheduler') {
            $scope.tabs.activeTab = 'Auto-Scheduler';
        }

        $scope.statuses = Configuration.fringeLevels;

        var update = function() {
            $scope.goingCount = Schedule.getSchedule().length;
            $scope.level = 0;
            $scope.nextLevelCount = 0;
            $scope.nextLevelRemaining = 0;

            for (var i = 0; i < $scope.statuses.length; i ++) {
                $scope.maxLevel = $scope.statuses[i].min;
                if ($scope.goingCount >= $scope.statuses[i].min) {
                    $scope.level = $scope.maxLevel;
                    $scope.status = i;

                    if ($scope.statuses[i+1] !== undefined) {
                        $scope.nextLevelCount = $scope.goingCount - $scope.statuses[i].min;
                        $scope.nextLevelRemaining = Math.max(0, $scope.statuses[i+1].min - $scope.level - $scope.nextLevelCount);
                    }
                }
            }
        };

        $scope.userData = {schedule: UserData.getSchedule()};

        $scope.$watch('userData.schedule', update);

        $scope.$watch('tabs.activeTab', function() {
            if ($scope.tabs.activeTab === 'My Schedule') {
                $route.updateParams({subpage: ''});
            } else if ($scope.tabs.activeTab === 'My Availability') {
                $route.updateParams({subpage: 'availability'});
            } else if ($scope.tabs.activeTab === 'Auto-Scheduler') {
                $route.updateParams({subpage: 'auto-scheduler'});
            }
        });
    }]
});