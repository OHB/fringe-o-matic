angular.module('fringeApp').controller('ShareModalCtrl', ['$uibModalInstance', '$scope', 'User', function($uibModalInstance, $scope, User) {
    $scope.publicHash = User.getAccount().publicHash;
    $scope.newScheduleName = $scope.scheduleName = User.getSettings().publicScheduleName;

    $scope.editScheduleName = $scope.scheduleName === null;

    $scope.save = function() {
        $scope.scheduleName = $scope.newScheduleName;
        var settings = User.getSettings();
        settings.publicScheduleName = $scope.scheduleName;
        User.setSettings(settings);
        $scope.editScheduleName = false;
    };

    $scope.close = $uibModalInstance.dismiss;
}]);