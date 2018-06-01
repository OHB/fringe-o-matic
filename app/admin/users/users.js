angular.module('fringeApp').component('adminUsers', {
    templateUrl: 'app/admin/users/users.html',
    controller: ['$scope', 'Data', 'User', 'Error', '$http', function($scope, Data, User, Error, $http) {
        $scope.isAdmin = User.getAccount().isAdmin;
        if (! User.getAccount().isAdmin) {
            Error.error('Access Denied', 'You do not have access to this page.');

            return;
        }

        $scope.moment = moment;

        $scope.refresh = function() {
            $http.get('api/getAccounts.php?privateHash=' + User.getAccount().privateHash, {cache: false}).then(function(response) {
                $scope.accounts = response.data;
            });
        };

        $scope.refresh();

        $scope.copyData = function(sourceHelpCode) {
            $http.post('api/copyData.php?privateHash=' + User.getAccount().privateHash + '&fromHelpCode=' + sourceHelpCode).then(function() {
                location.reload();
            });
        };
    }]
});