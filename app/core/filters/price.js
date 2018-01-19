angular.module('fringeApp').filter('price', function() {
    return function(price) {
        return price === 0 ? 'FREE' : '$' + price;
    };
});