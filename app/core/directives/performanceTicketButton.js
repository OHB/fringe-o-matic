angular.module('fringeApp').directive('performanceTicketButton', function() {
    return {
        scope: {
            'storeUrl': '='
        },
        template: '<span><a ng-if="storeUrl" href="{{storeUrl}}" target="fringeshop" class="btn btn-default" style="padding: 6px 8px" analytics-event="Click" analytics-label="Buy Tickets">' +
        '<img src="img/ticket.svg" style="width:1.5em" bs-tooltip="{title:\'Buy Tickets\'}">\n' +
        '</a></span>',
        replace: true
    };
});