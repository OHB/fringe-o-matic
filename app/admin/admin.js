angular.module('fringeApp').component('admin', {
    templateUrl: 'app/admin/admin.html',
    controller: ['$scope', 'Data', 'User', 'Error', '$http', function($scope, Data, User, Error, $http) {
        $scope.isAdmin = User.getAccount().isAdmin;
        if (! User.getAccount().isAdmin) {
            Error.error('Access Denied', 'You do not have access to this page.');

            return;
        }

        $scope.shows = Data.getShows();

        $scope.refresh = function() {
            $scope.loaded = false;
            $http.get('api/getStats.php', {cache: false}).then(function(response) {
                $scope.loaded = true;
                $scope.stats = response.data;
            });
        };

        $scope.refresh();
    }]
});