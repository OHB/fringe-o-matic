angular.module('fringeApp').directive('showFilters', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/shows/showFilters/showFilters.html'
    }
});