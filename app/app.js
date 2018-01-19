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
    'ngRoute',
    'ui.bootstrap',
    'mgcrea.ngStrap.affix',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.select',
    'mgcrea.ngStrap.tab',
    'mgcrea.ngStrap.tooltip',
    'ngMap',
    'ngLocationUpdate'
]);

