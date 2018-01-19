angular.module('fringeApp').directive('staticMap', function() {
    return {
        scope: {
            center: '=',
            zoom: '=',
            size: '=',
            markers: '='
        },
        replace: true,
        template: '<img ng-src="{{url}}" />',
        controller: ['$scope', function($scope) {
            var params = [];

            if ($scope.center) {
                params.push('center=' + $scope.center);
            }
            if ($scope.zoom) {
                params.push('zoom=' + $scope.zoom);
            }
            if ($scope.size) {
                params.push('size=' + $scope.size);
            }
            if ($scope.markers) {
                params.push('markers=' + $scope.markers);
            }
            $scope.url = 'https://maps.googleapis.com/maps/api/staticmap?' + params.join('&');
        }]
    };
});