var modules = [
    'ngAnimate',
    'ngRoute',
    'ui.bootstrap',
    'mgcrea.ngStrap.affix',
    'mgcrea.ngStrap.alert',
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.dropdown',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.select',
    'mgcrea.ngStrap.tab',
    'mgcrea.ngStrap.tooltip',
    'qImproved',
    'infinite-scroll',
    'angulartics',
    'angulartics.google.analytics',
    'googlechart',
    'ngTap'
];

if (ENVIRONMENT === 'dev') {
    modules.push('angulartics.debug');
}
angular.module('fringeApp', modules);

angular.module('fringeApp').run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);
