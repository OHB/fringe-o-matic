angular.module('fringeApp').directive('showRating', function() {
    return {
        restrict: 'E',
        scope: {
            value: '='
        },
        template: '<span class="label label-info"><i class="glyphicon glyphicon-check"></i> {{value}}</span>'
    };
});