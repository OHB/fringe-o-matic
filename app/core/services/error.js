angular.module('fringeApp').service('Error', function() {
    var onError = function() {};

    this.onError = function(fn) {
        onError = fn;
    };

    this.error = function(title, text) {
        onError({title: title, more: text});
    };
});