angular.module('fringeApp').controller('LoginModalCtrl', [
    '$uibModalInstance', '$scope', '$timeout', 'User', 'Error',
    function($uibModalInstance, $scope, $timeout, User, Error) {
        $scope.signingIn = false;

        $timeout(function() {
            gapi.signin2.render('google-sign-in-button', {
                'scope': 'profile',
                'width': 200,
                'height': 36,
                'longtitle': true,
                'theme': 'dark',
                'onsuccess': function(googleUser) {
                    var profile = googleUser.getBasicProfile();

                    $scope.$apply(function() {
                        $scope.signingIn = true;
                    });

                    User.signIn(googleUser.getAuthResponse().id_token).then(function() {
                        $uibModalInstance.close(profile.getName());
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