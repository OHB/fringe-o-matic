angular.module('fringeApp').component('myFringe', {
    templateUrl: 'app/myFringe/myFringe.html',
    controller: ['$scope', '$location', 'Schedule', 'UserData', 'FringeLevels', function($scope, $location, Schedule, UserData, FringeLevels) {
        $scope.tabs = {
            activeTab: 'My Schedule'
        };
        if ($location.path() === '/my-fringe/availability') {
            $scope.tabs.activeTab = 'My Availability';
        } else if ($location.path() === '/my-fringe/generate') {
            $scope.tabs.activeTab = 'Schedule Generator';
        }

        $scope.statuses = FringeLevels;

        var update = function() {
            $scope.goingCount = Schedule.getPerformancesAttending().length;
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
                $location.updatePath('/my-fringe');
            } else if ($scope.tabs.activeTab === 'My Availability') {
                $location.updatePath('/my-fringe/availability');
            } else if ($scope.tabs.activeTab === 'Schedule Generator') {
                $location.updatePath('/my-fringe/generate');
            }
        });
    }]
});