angular.module('fringeApp').controller('LoginModalCtrl', [
    '$uibModalInstance', '$scope', '$timeout', 'UserData', 'Error',
    function($uibModalInstance, $scope, $timeout, UserData, Error) {
        $scope.signingIn = false;

        $timeout(function() {
            gapi.signin2.render('google-sign-in-button', {
                'scope': 'profile',
                'width': 200,
                'height': 36,
                'longtitle': true,
                'theme': 'dark',
                'onsuccess': function(googleUser) {
                    var profile = googleUser.getBasicProfile(),
                        userId = 'g' + profile.getId();

                    $scope.$apply(function() {
                        $scope.signingIn = true;
                    });

                    UserData.load(userId).then(function() {
                        $uibModalInstance.close({id: userId, name: profile.getName()});
                    }, function() {
                        $uibModalInstance.dismiss();
                        Error.error('Unable to retrieve data from server', 'Please wait a moment and try again.');
                    });
                }
            });
        });

        $scope.close = $uibModalInstance.dismiss;
    }
]);