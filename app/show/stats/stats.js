angular.module('fringeApp').component('showStats', {
    templateUrl: 'app/show/stats/stats.html',
    controller: ['$scope', '$routeParams', '$http', 'Data', 'User', function ($scope, $routeParams, $http, Data, User) {
        $scope.showId = Data.findShowIdBySlug($routeParams.show);
        $scope.show = Data.getShow($scope.showId);
        $scope.shows = Data.getShows();
        $scope.genres = Data.getGenres();
        $scope.performances = Data.getPerformances();
        $scope.moment = moment;

        $http.get('api/getShowStats.php?show=' + $scope.showId + '&privateHash=' + User.getAccount().privateHash, {cache: false}).then(function(response) {
            $scope.stats = response.data;
            $scope.loaded = true;
        });

        $scope.tooltip = function(interest, item) {
            return (Math.round(item.count / $scope.stats.interestCounts[interest] * 1000) / 10) + '% of people ' +
                (interest > 0 ? (
                    ' who gave "' + $scope.show.name + '" ' + interest + ' ' +
                    (interest === 1 ? 'checkmark' : 'checkmarks') +
                    (interest == item.interest ? ' also' : '')
                ) : (' who are not interested in "' + $scope.show.name + '"')) +
                ' gave ' + item.interest + ' ' +
                (item.interest === 1 ? 'checkmark' : 'checkmarks') + ' to "' +
                $scope.shows[item.show].name + '".';
        };
    }]
});
