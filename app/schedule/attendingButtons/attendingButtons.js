angular.module('fringeApp').directive('attendingButtons', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/schedule/attendingButtons/attendingButtons.html'
    };
});