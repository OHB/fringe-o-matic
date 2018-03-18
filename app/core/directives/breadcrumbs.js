angular.module('fringeApp').directive('breadcrumbs', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            items: '='
        },
        template: '<script type="application/ld+json" ng-bind="json|json"></script>',
        controller: ['$scope', function($scope) {
            var i = 0;
            $scope.json = {
                "@context": "http://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": $scope.items.map(function(item) {
                    i ++;
                    return {
                        "@type": "ListItem",
                        "position": i,
                        "item": {
                            "@id": "https://fringeomatic.com/" + item[0],
                            "name": item[1]
                        }
                    };
                })
            };
        }]
    };
});