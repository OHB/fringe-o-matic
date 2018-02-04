angular.module('fringeApp').directive('offsetHeight', function() {
    return {
        restrict: 'A',
        scope: {
            model: '=offsetHeight'
        },
        controller: ['$scope', '$element', '$window', 'debounce', '$timeout', function($scope, $element, $window, debounce, $timeout) {
            angular.element($window).on('resize', debounce(function() {
                $timeout(function() {
                    $scope.model = $element[0].offsetHeight;
                });
            }, 100));
            angular.element($window).on('click', function() {
                $timeout(function() {
                    $scope.model = $element[0].offsetHeight;
                });
            });
            $scope.$watch(function() {
                return $element[0].offsetHeight;
            }, function() {
                $timeout(function() {
                    $scope.model = $element[0].offsetHeight;
                });
            });
        }]
    };
});