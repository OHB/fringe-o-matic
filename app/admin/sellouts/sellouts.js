angular.module('fringeApp').component('adminSellouts', {
    templateUrl: 'app/admin/sellouts/sellouts.html',
    controller: ['$scope', 'Data', 'User', 'Error', '$http', function($scope, Data, User, Error, $http) {
        $scope.isAdmin = User.getAccount().isAdmin;
        if (! User.getAccount().isAdmin) {
            Error.error('Access Denied', 'You do not have access to this page.');

            return;
        }

        $scope.moment = moment;

        $scope.sortedShows = Data.getSortedShows();
        $scope.shows = Data.getShows();
        $scope.performances = Data.getPerformances();

        $scope.now = Date.now() / 1000;

        $scope.setSellout = function(performanceId) {
            var data = {
                privateHash: User.getAccount().privateHash,
                performanceId: performanceId
            };

            $http.post('api/setSellout.php', data).then(function(data) {
                Data.getPerformance(performanceId).soldOut = true;
            });
        };
    }]
});