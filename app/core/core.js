angular.module('fringeApp').controller('CoreCtrl', [
    '$rootScope', '$scope', '$route', '$location', '$timeout', '$window', '$q', 'Data', 'Menu', 'UserData', 'Error',
    function($rootScope, $scope, $route, $location, $timeout, $window, $q, Data, Menu, UserData, Error) {
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

        var userDataLoaded = $q.defer();

        $q.all([Data.load(), firstRouteLoaded.promise, userDataLoaded.promise]).then(function() {
            $timeout(function() {
                $scope.loaded = true;
            }, 100);
        }, function() {
            Error.error('Unable to retrieve data from server', 'Please wait a moment and try again.');
        }, function() {
            console.log(arguments);
        });

        if (Blob === undefined || Worker === undefined || window.URL === undefined || window.URL.createObjectURL === undefined) {
            Error.error('Unsupported Browser', 'Your browser does not support Web Workers. Please use a modern browser like Google Chrome.');
        }



        $scope.signedIn = false;
        gapi.signin2.render('google-sign-in-button', {
            'scope': 'profile',
            'width': 150,
            'height': 36,
            'longtitle': false,
            'theme': 'dark',
            'onsuccess': function(googleUser) {
                var profile = googleUser.getBasicProfile();
                $scope.$apply(function() {
                    $scope.signedIn = true;
                    $scope.signedInName = profile.getName();

                    UserData.load('g' + profile.getId()).then(userDataLoaded.resolve);
                });
            },
            'onfailure': userDataLoaded.reject
        });

        $scope.signOut = function() {
            gapi.auth2.getAuthInstance().signOut().then(function () {
                UserData.reset();
                $scope.$apply(function() {
                    $scope.signedIn = false;
                });
            });
        };
    }]
);
