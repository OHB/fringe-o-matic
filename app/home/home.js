angular.module('fringeApp').component('home', {
    templateUrl: 'app/home/home.html',
    controller: ['$scope', '$timeout', '$location', function($scope, $timeout, $location) {

        var colors = ['#D5D6DB', '#337ab7', '#C33C54', '#731DD8', '#59cd90', '#fabc3c', '#337ab7', '#C33C54', '#731DD8', '#59cd90', '#fabc3c'],
            days = Array.from(document.querySelectorAll('#calendar-image .day'));

        colors = [
            '#D5D6DB',
            '#f15921',
            '#a2238d',
            '#93c841',
            '#80c4d8',
            '#e60a76',
            '#00b6b3',
            '#f15921',
            '#a2238d',
            '#93c841',
            '#80c4d8',
            '#e60a76',
            '#00b6b3'
        ];

        var changeRandomDay = function() {
            days.randomElement().style.fill = colors.randomElement();
        };

        var timeout;

        var timer = function() {
            changeRandomDay();
            timeout = $timeout(timer, 1500);
        };

        for (var i = 0; i < 15; i ++) {
            changeRandomDay();
        }

        timer();

        $scope.$on('$destroy', function(){
            $timeout.cancel(timeout);
        });

        $scope.getStartedDisabled = ! $scope.$parent.signedIn && ! navigator.onLine;

        $scope.getStarted = function() {
            if (! $scope.$parent.signedIn) {
                $scope.$parent.signIn();
            } else {
                $location.path('/my-fringe');
            }
        };
    }]
});