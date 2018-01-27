angular.module('fringeApp').directive('interest', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            showId: '=',
            desire: '='
        },
        template: function(elem, attr) {
            var clickable = attr.showId !== undefined,
                html = '<span';

            if (! clickable) {
                html += ' bs-tooltip="{title:interestText[get()]}"';
            } else {
                html += ' ng-mouseleave="reset()"'
            }

            html += '>';

            for (var i = 0; i < 4; i ++) {
                html += '<i class="rating-icon glyphicon" ng-class="icon(' + i + ')"';

                if (clickable) {
                    html += ' bs-tooltip="{title: interestText[' + (i + 1) + ']}" ng-click="click(' + (i + 1) + ')" ng-mouseenter="enter(' + i + ')"';
                }
                html += '></i>';
            }

            html += '</span>';

            return html;
        },
        controller: ['$scope', 'Schedule', 'Configuration', function($scope, Schedule, Configuration) {
            var hoveredOver;

            $scope.interestText = Configuration.interestText;

            $scope.get = function() {
                return $scope.desire || Schedule.getShowDesire($scope.showId);
            };

            $scope.icon = function(i) {
                return i < (hoveredOver || $scope.get()) ? 'glyphicon-ok-sign' : 'glyphicon-ok-circle';
            };

            $scope.click = function(i) {
                Schedule.setShowDesire($scope.showId, i === $scope.get() ? 0 : i);
            };

            $scope.enter = function(i) {
                hoveredOver = i + 1;
            };
            $scope.reset = function() {
                hoveredOver = undefined;
            };
        }]
    };
});