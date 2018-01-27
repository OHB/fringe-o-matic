Array.prototype.chunk = function(size){
    var sets = [],
        chunks = this.length / size;

    for (var i = 0, j = 0; i < chunks; i++, j += size) {
        sets[i] = this.slice(j, j + size);
    }

    return sets;
};

Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};

Array.prototype.shuffle = function() {
    var array = this.slice(0),
        j = 0,
        temp = null;

    for (var i = this.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
};

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
};

Array.prototype.remove = function(value) {
    var i = this.indexOf(value);

    if (i > -1) {
        this.splice(i, 1);
    }
};

String.prototype.chunk = function(length) {
    return this.match(new RegExp('.{1,' + length + '}', 'g'));
};

String.prototype.localeCompareSmart = function(other) {
    return this.localeCompare(other, 'en', {
        sensitivity: 'base',
        ignorePunctuation: true,
        numeric: true
    });
};

angular.module('fringeApp', [
    'ngAnimate',
    'ngRoute',
    'ui.bootstrap',
    'mgcrea.ngStrap.affix',
    'mgcrea.ngStrap.aside',
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.dropdown',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.select',
    'mgcrea.ngStrap.tab',
    'mgcrea.ngStrap.tooltip',
    'ngMap'
]);

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