angular.module('fringeApp').service('Data', ['$http', '$q', 'Sorters', function($http, $q, Sorters) {
    var filename = 'api/getData.php',
        data;

    this.load = function() {
        var deferred = $q.defer();
        $http.get(filename, {cache: true}).then(function(result) {
            data = result.data;
            console.log('Data loaded');
            deferred.resolve();
        }, function() {
            deferred.reject();
        });

        return deferred.promise;
    };

    var basicGetter = function(type) {
        return function() {
            return data[type];
        };
    };

    this.getShows = basicGetter('shows');
    this.getPerformances = basicGetter('performances');
    this.getRatings = basicGetter('ratings');
    this.getVenues = basicGetter('venues');
    this.getVenueHosts = basicGetter('venueHosts');
    this.getVenueDistances = basicGetter('distances');
    this.getAvailabilitySlots = basicGetter('availabilitySlots');
    this.getAvailabilitySlotsAll = basicGetter('availabilitySlotsAll');

    this.getSortedShows = function() {
        return Object.keys(data.shows).sort(function(a, b) {
            return data.shows[a].name.localeCompareSmart(data.shows[b].name);
        });
    };

    this.getPrices = function() {
        var p = {};
        angular.forEach(data.shows, function(show) {
            p[show.price] = true;
        });

        return Object.keys(p).map(function(i) {
            return parseInt(i);
        }).sort(function(a, b) {
            return a > b;
        });
    };

    this.getShow = function(showId) {
        return data.shows[showId];
    };
    this.getPerformance = function(performanceId) {
        return data.performances[performanceId];
    };

    this.getSortedPerformances = function() {
        return Object.keys(data.performances).sort(function(a, b) {
            return Sorters.performance(data.performances[a], data.performances[b]);
        });
    };
}]);