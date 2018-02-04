angular.module('fringeApp').directive('mapControls', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/map/mapControls/mapControls.html'
    };
});