angular.module('fringeApp').component('myFringe', {
    templateUrl: 'app/myFringe/myFringe.html',
    controller: ['$scope', '$route', '$routeParams', 'Schedule', 'User', 'Configuration', 'Plurals', function($scope, $route, $routeParams, Schedule, User, Configuration, Plurals) {
        $scope.plurals = Plurals;
        $scope.tabs = {
            activeTab: 'Schedule'
        };
        if ($routeParams.subpage === 'availability') {
            $scope.tabs.activeTab = 'Availability';
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

        $scope.userData = {schedule: User.getSchedule()};

        $scope.$watch('userData.schedule', update);

        $scope.$watch('tabs.activeTab', function() {
            if ($scope.tabs.activeTab === 'Schedule' && $route.subpage) {
                $route.updateParams({subpage: null});
            } else if ($scope.tabs.activeTab === 'Availability' && $route.subpage !== 'availability') {
                $route.updateParams({subpage: 'availability'});
            } else if ($scope.tabs.activeTab === 'Auto-Scheduler' && $route.subpage !== 'auto-scheduler') {
                $route.updateParams({subpage: 'auto-scheduler'});
            } else {
                $route.updateParams({subpage: null});
            }
        });
    }]
});