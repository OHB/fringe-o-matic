angular.module('fringeApp').filter('highlight', ['$sce', function($sce) {
    return function(input, text) {
        if (! input) {
            return input;
        }

        text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").trim();
        if (!text || text === '') {
            return $sce.trustAsHtml(input);
        }

        return $sce.trustAsHtml(input.replace(new RegExp('(' + text + ')(?![^<]*>|[^<>]*<\\/)', 'gi'), '<mark>$1</mark>'));
    };
}]);