angular.module('fringeApp').directive('interest', function() {
    return {
        restrict: 'E',
        scope: {
            showId: '=',
            desire: '='
        },
        template: function(elem, attr) {
            var clickable = attr.showId !== undefined,
                html = '<span';

            if (! clickable) {
                html += ' bs-tooltip="{title:interestText[get() - 1]}"';
            } else {
                html += ' ng-mouseleave="reset()"'
            }

            html += '>';

            for (var i = 0; i < 4; i ++) {
                html += '<i class="rating-icon glyphicon" ng-class="icon(' + i + ')"';

                if (clickable) {
                    html += ' bs-tooltip="{title: interestText[' + i + ']}" ng-click="click(' + (i + 1) + ')" ng-mouseenter="enter(' + i + ')"';
                }
                html += '></i>';
            }

            html += '</span>';

            return html;
        },
        controller: ['$scope', 'Schedule', 'InterestText', function($scope, Schedule, InterestText) {
            var hoveredOver;

            $scope.interestText = InterestText;

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