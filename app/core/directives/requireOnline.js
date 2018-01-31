angular.module('fringeApp').directive('requireOnline', function() {
    return {
        restrict: 'E',
        template: '<div>' +
            '<div class="visible-offline-block">' +
            '<div class="alert alert-danger">' +
            '<p><i class="glyphicon glyphicon-off"></i> This page is not available while offline.</p>' +
            '</div>' +
            '</div>' +
            '<div class="hidden-offline"><ng-transclude></ng-transclude></div>' +
            '</div>',
        replace: true,
        transclude: true
    };
});