angular.module('fringeApp').controller('ShareModalCtrl', ['$uibModalInstance', '$scope', 'User', '$analytics', function($uibModalInstance, $scope, User, $analytics) {
    $analytics.eventTrack('Open', {category: 'Schedule Share Modal'});

    $scope.publicHash = User.getAccount().publicHash;
    $scope.newScheduleName = $scope.scheduleName = User.getSettings().publicScheduleName;

    $scope.editScheduleName = $scope.scheduleName === null;

    $scope.save = function() {
        $analytics.eventTrack('Save', {category: 'Schedule Share Modal', label: 'Public Schedule Title'});

        $scope.scheduleName = $scope.newScheduleName;
        var settings = User.getSettings();
        settings.publicScheduleName = $scope.scheduleName;
        User.setSettings(settings);
        $scope.editScheduleName = false;
    };

    $scope.close = $uibModalInstance.dismiss;
}]);