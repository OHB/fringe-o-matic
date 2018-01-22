angular.module('fringeApp').directive('innerHeight', function() {
    return {
        restrict: 'A',
        scope: {
            model: '=innerHeight'
        },
        controller: ['$scope', '$window', 'debounce', function($scope, $window, debounce) {
            $scope.model = $window.innerHeight;

            angular.element($window).on('resize', debounce(function() {
                $scope.$apply(function() {
                    $scope.model = $window.innerHeight;
                });
            }, 100));
        }]
    };
});