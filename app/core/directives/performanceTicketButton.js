angular.module('fringeApp').directive('performanceTicketButton', function() {
    return {
        scope: {
            'performance': '='
        },
        controller: ['$scope', function($scope) {
            $scope.now = Date.now() / 1000;
        }],
        template: '<span>' +
            '<a ng-if="performance.storeUrl && performance.start >= now && !performance.soldOut" href="{{performance.storeUrl}}" target="fringeshop" class="btn btn-default" style="padding: 6px 8px" analytics-event="Click" analytics-label="Buy Tickets">' +
            '<img src="img/ticket.svg" style="width:1.5em" bs-tooltip="{title:\'Buy Tickets\'}">\n' +
            '</a>' +
            '<a ng-if="performance.storeUrl && performance.start >= now && performance.soldOut" class="btn btn-danger" disabled style="padding: 6px 8px">' +
            '<img src="img/ticket-white.svg" style="width:1.5em" bs-tooltip="{title:\'Sold Out!\'}">\n' +
            '</a>' +
            '</span>',
        replace: true
    };
});