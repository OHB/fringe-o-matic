angular.module('fringeApp').component('adminUsersView', {
    templateUrl: 'app/admin/users/view/view.html',
    controller: ['$scope', 'Data', 'User', 'Error', '$routeParams', '$http', function($scope, Data, User, Error, $routeParams, $http) {
        $scope.isAdmin = User.getAccount().isAdmin;
        if (! User.getAccount().isAdmin) {
            Error.error('Access Denied', 'You do not have access to this page.');

            return;
        }

        $http.get('api/getUser.php?privateHash=' + User.getAccount().privateHash + '&helpCode=' + $routeParams.helpCode).then(function(response) {
            $scope.data = response.data;

            $scope.availability = {};
            angular.forEach($scope.availabilitySlots, function(slots) {
                angular.forEach(slots, function(slot) {
                    $scope.availability[slot] = response.data.unavailability.indexOf('' + slot) === -1;
                });
            });

            $scope.loaded = true;
        });

        $scope.moment = moment;
        $scope.helpCode = $routeParams.helpCode;
        $scope.sortedShows = Data.getSortedShows();
        $scope.sortedPerformances = Data.getSortedPerformances();
        $scope.shows = Data.getShows();
        $scope.performances = Data.getPerformances();
        $scope.availabilitySlots = Data.getAvailabilitySlots();
        $scope.availabilitySlotsAll = Data.getAvailabilitySlotsAll();
    }]
});