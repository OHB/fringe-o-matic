angular.module('fringeApp').controller('CoreCtrl', [
    '$rootScope', '$scope', '$route', '$location', '$timeout', '$window', '$q', '$aside', '$uibModal',
    'Data', 'Menu', 'UserData', 'Error', 'Configuration',
    function($rootScope, $scope, $route, $location, $timeout, $window, $q, $aside, $uibModal, Data, Menu, UserData, Error, Configuration) {
        UserData.onSave(function(promise) {
            $timeout(function() {
                $scope.saving = true;
            });
            promise.then(function() {
                $timeout(function() {
                    $scope.saving = false;
                });
            });
        });

        Error.onError(function(error) {
            $scope.error = error;
        });

        $scope.menu = Menu;

        var firstRouteLoaded = $q.defer();
        $rootScope.$on('$routeChangeSuccess', function() {
            if ($route.current.$$route) {
                firstRouteLoaded.resolve();
                var parts = $route.current.$$route.originalPath.split('/');
                $scope.currentRoute = '/' + parts[1];
                $window.scroll(0, 0);
            }
        });

        $scope.signIn = function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/core/loginModal/loginModal.html',
                controller: 'LoginModalCtrl',
                size: 'md'
            });
            modalInstance.result.then(function(user) {
                $scope.signedIn = true;
                $scope.signedInName = user.name;
                $scope.isUserAdmin = Configuration.adminUsers.indexOf(user.id) > -1;
                $route.reload();
            });
        };

        var signInCheck = $q.defer();
        gapi.load('auth2', function() {
            gapi.auth2.init({client_id: Configuration.googleAuthClientId}).then(function () {
                var googleAuth = gapi.auth2.getAuthInstance();

                if (googleAuth.isSignedIn.get()) {
                    var profile = googleAuth.currentUser.get().getBasicProfile(),
                        userId = 'g' + profile.getId();

                    $scope.signedIn = true;
                    $scope.signedInName = profile.getName();
                    $scope.isUserAdmin = Configuration.adminUsers.indexOf(userId) > -1;
                    UserData.load(userId).then(signInCheck.resolve);
                } else {
                    $scope.signedIn = false;
                    signInCheck.resolve();
                }
            });
        });

        $q.all([Data.load(), firstRouteLoaded.promise, signInCheck.promise]).then(function() {
            $scope.loaded = true;
        }, function() {
            Error.error('Unable to retrieve data from server', 'Please wait a moment and try again.');
        });

        if (Blob === undefined || Worker === undefined || window.URL === undefined || window.URL.createObjectURL === undefined) {
            Error.error('Unsupported Browser', 'Your browser does not support Web Workers. Please use a modern browser like Google Chrome.');
        }

        $scope.signOut = function() {
            gapi.auth2.getAuthInstance().signOut().then(function () {
                $scope.$apply(function() {
                    UserData.reset();
                    $scope.isUserAdmin = false;
                    $scope.signedIn = false;
                    $route.reload();
                });
            });
        };

        $scope.openHelp = function() {
            $aside({
                templateUrl: 'app/core/help/help.html',
                placement: 'right',
                controller: 'HelpCtrl'
            });
        };
    }]
);
