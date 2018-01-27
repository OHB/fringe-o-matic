angular.module('fringeApp').directive('monthDayPicker', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/core/directives/monthDayPicker.html',
        replace: true,
        scope: {
            days: '=',
            model: '='
        },
        controller: ['$scope', function($scope) {
            $scope.click = function(time) {
                $scope.model = time;
            };

            var months = [],
                years = [],
                days = angular.copy($scope.days),
                i;

            for (i = 0; i < days.length; i ++) {
                var day = moment(days[i], 'X'),
                    month = day.startOf('month').unix(),
                    year = day.startOf('year').unix();

                if (months.indexOf(month) === -1) {
                    months.push(month);
                }
                if (years.indexOf(year) === -1) {
                    years.push(year);
                }
            }

            $scope.months = months.map(function(monthStartTime) {
                var monthStart = moment(monthStartTime, 'X'),
                    days = [],
                    today = moment().startOf('day').unix();

                for (i = 0; i < monthStart.day(); i ++) {
                    days.push({number: '', time: -1});
                }

                for (i = 1; i <= monthStart.daysInMonth(); i ++) {
                    var time = monthStart.date(i).unix();

                    days.push({
                        number: i,
                        time: time,
                        allowed: $scope.days.indexOf(time) > -1,
                        today: time === today
                    });
                }

                for (i = 0; i < monthStart.day() % 7; i ++) {
                    days.push(0);
                }

                return {
                    header: monthStart.format('MMMM YYYY'),
                    weeks: days.chunk(7).map(function(days) {
                        return {days: days};
                    })
                };
            });
        }]
    };
});