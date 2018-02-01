angular.module('fringeApp').controller('CoreCtrl', [
    '$rootScope', '$scope', '$route', '$location', '$window', '$q', '$timeout', '$uibModal', '$alert', 'Data', 'Menu', 'User', 'Error', '$analytics',
    function($rootScope, $scope, $route, $location, $window, $q, $timeout, $uibModal, $alert, Data, Menu, User, Error, $analytics) {
        User.onSave(function(promise) {
            promise.then(function() {}, function() {
                Error.error('Unable to save data to the server.', 'Have you lost your internet connection?');
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
            $analytics.eventTrack('Open', {category: 'User', label: 'Sign In Modal'});
            var modalInstance = $uibModal.open({
                templateUrl: 'app/core/loginModal/loginModal.html',
                controller: 'LoginModalCtrl',
                size: 'md'
            });
            modalInstance.result.then(function(name) {
                $scope.signedIn = true;
                $scope.signedInName = name;
                $scope.isUserAdmin = User.getAccount().isAdmin;
                $analytics.eventTrack('Sign In', {category: 'User'});
                $analytics.setUsername(User.getAccount().privateHash);

                if ($location.path() === '/') {
                    $location.path('/my-fringe');
                } else {
                    $route.reload();
                }
            });
        };

        var signInCheck = $q.defer();

        gapi.load('client:auth2:signin2', function() {
            gapi.client.init({
                apiKey: 'AIzaSyD0y40AVRhf_DDSsFCRT0mBXhjdkQZP4Ys',
                clientId: '728570220201-1qnk6fh4nkdl3vqnpq8gphbk9t51i29m.apps.googleusercontent.com',
                scope: 'profile',
                prompt: 'select_account',
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
            }).then(function () {
                var googleAuth = gapi.auth2.getAuthInstance();

                if (googleAuth.isSignedIn.get()) {
                    var profile = googleAuth.currentUser.get().getBasicProfile();

                    return User.signIn(googleAuth.currentUser.get().getAuthResponse().id_token).then(function() {
                        $scope.signedIn = true;
                        $scope.signedInName = profile.getName();
                        $scope.isUserAdmin = User.getAccount().isAdmin;
                        $analytics.setUsername(User.getAccount().privateHash);
                        $analytics.eventTrack('Sign In Auto', {category: 'User'});
                        signInCheck.resolve();
                    }, signInCheck.reject);
                } else {
                    $scope.signedIn = false;
                    signInCheck.resolve();
                }
            });
        });

        var dataLoaded = Data.load().then(function() {

            $scope.loadingMessage = function(fringeStart, fringeStop) {
                var now = Date.now() / 1000,
                    duration;

                if (now < fringeStart) {
                    duration = moment.duration(fringeStart - now, 'seconds');
                    if (duration.asDays() > 10) {
                        return null;
                    } else if (duration.asDays() >= 1) {
                        return ['Get ready!', 'Fringe starts ' + duration.humanize(true) + '.'];
                    } else {
                        return ["It's almost time!", moment(fringeStart, 'X').format('[Fringe starts at] h:mm a!')];
                    }
                } else if (now < fringeStop) {
                    duration = moment.duration(fringeStop - now, 'seconds');

                    if (duration.asDays() >= 2) {
                        return ["It's Fringe!", 'There are ' + Math.floor(duration.asDays()) + ' days left.'];
                    } else if (duration.asDays() >= 1) {
                        return ["It's almost over!", 'There is only one more day of Fringe! :('];
                    } else {
                        return ['On no!', 'Today is the last day of Fringe! :('];
                    }
                } else {
                    return ['Are you excited?', 'Fringe 2019 is less than a year away!']
                }
            }(Data.getFringeStart(), Data.getFringeStop());
        });

        $q.all([dataLoaded, firstRouteLoaded.promise, signInCheck.promise]).then(function() {
            $scope.loaded = true;

            if ($scope.loadingMessage) {
                $timeout(function() {
                    $alert({
                        title: $scope.loadingMessage[0],
                        content: $scope.loadingMessage[1],
                        placement: 'top-right',
                        animation: 'am-fade-and-slide-top',
                        type: 'info',
                        show: true,
                        duration: 10
                    });
                }, 1000);
            }

        }, function() {
            Error.error('Unable to retrieve data from server', 'Please wait a moment and try again.');
        });

        if (Blob === undefined || Worker === undefined || window.URL === undefined || window.URL.createObjectURL === undefined) {
            Error.error('Unsupported Browser', 'Your browser does not support Web Workers. Please use a modern browser like Google Chrome.');
        }

        $scope.signOut = function() {
            gapi.auth2.getAuthInstance().signOut().then(function () {
                $scope.$apply(function() {
                    User.signOut();
                    $analytics.eventTrack('Sign Out', {category: 'User'});
                    $analytics.setUsername(undefined);
                    $scope.isUserAdmin = false;
                    $scope.signedIn = false;

                    if ($location.path().indexOf('my-fringe') > -1) {
                        $location.path('/');
                    } else {
                        $route.reload();
                    }

                    $route.reload();
                });
            });
        };

        $scope.isOnline = navigator.onLine;
        var updateOnlineStatus = function() {
            $scope.isOnline = navigator.onLine;
            $route.reload();

            if ($scope.isOnline) {
                $alert({
                    title: "You're back online!",
                    placement: 'top-right',
                    animation: 'am-fade-and-slide-top',
                    type: 'success',
                    show: true,
                    duration: 5
                });
            } else {
                $alert({
                    title: "You've got offline!",
                    content: $scope.signedIn ? "You won't be able to edit anything until you go back online." : "You won't be able to sign-in.",
                    placement: 'top-right',
                    animation: 'am-fade-and-slide-top',
                    type: 'danger',
                    show: true,
                    duration: 5
                });
            }
        };
        window.addEventListener('offline', updateOnlineStatus);
        window.addEventListener('online', updateOnlineStatus);
    }]
);
