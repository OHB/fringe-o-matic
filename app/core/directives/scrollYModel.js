angular.module('fringeApp').directive('scrollYModel', function() {
    return {
        restrict: 'A',
        scope: {
            model: '=scrollYModel'
        },
        controller: ['$scope', '$document', '$window', function($scope, $document, $window) {
            $scope.model = Math.min($window.scrollY, 205);
            $document.on('scroll', function() {
                var v = Math.min($window.scrollY, 205);

                if ($scope.model !== v) {
                    $scope.$apply(function() {
                        $scope.model = v;
                    });
                }
            });
        }]
    };
});