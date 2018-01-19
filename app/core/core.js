angular.module('fringeApp').controller('CoreCtrl', [
    '$rootScope', '$scope', '$route', '$location', '$timeout', '$window', '$q', 'Data', 'Menu', 'UserData', 'Error',
    function($rootScope, $scope, $route, $location, $timeout, $window, $q, Data, Menu, UserData, Error) {
        var dataLoadedPromise = Data.getShows().then(function() {
            $scope.loaded = true;
        }, function() {
            Error.error('Unable to retrieve data from server', 'Please wait a moment and try again.');
        });

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

        $q.all([dataLoadedPromise, firstRouteLoaded.promise]).then(function() {
            $timeout(function() {
                $scope.loaded = true;
            }, 100);
        });

        if (Blob === undefined || Worker === undefined || window.URL === undefined || window.URL.createObjectURL === undefined) {
            Error.error('Unsupported Browser', 'Your browser does not support Web Workers. Please use a modern browser like Google Chrome.');
        }
    }]
);
