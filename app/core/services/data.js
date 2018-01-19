angular.module('fringeApp').service('Data', ['$http', '$q', 'Sorters', function($http, $q, Sorters) {
    var filename = 'api/getTestSchedule.php',
        data;

    filename = 'api/cache.json';

    var getData = function() {
        if (data) {
            return $q.when(data);
        }

        var deferred = $q.defer();
        $http.get(filename, {cache: true}).then(function(result) {
            deferred.resolve(result.data);
        }, function() {
            deferred.reject();
        });

        return deferred.promise;
    };

    var basicGetter = function(type) {
        return function() {
            return getData().then(function(data) {
                return data[type];
            });
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
        return this.getShows().then(function(shows) {
            return Object.keys(shows).sort(function(a, b) {
                return shows[a].name.localeCompareSmart(shows[b].name);
            });
        });
    };

    this.getPrices = function() {
        return this.getShows().then(function(shows) {
            var p = {};
            angular.forEach(shows, function(show) {
                p[show.price] = true;
            });

            return Object.keys(p).map(function(i) {
                return parseInt(i);
            }).sort(function(a, b) {
                return a > b;
            });
        })
    };

    this.getShow = function(showId) {
        return this.getShows().then(function(shows) {
            return shows[showId];
        })
    };
    this.getPerformance = function(performanceId) {
        return this.getPerformances().then(function(performances) {
            return performances[performanceId];
        })
    };

    this.getSortedPerformances = function() {
        return this.getPerformances().then(function(performances) {
            return Object.keys(performances).sort(function(a, b) {
                return Sorters.performance(performances[a], performances[b]);
            });
        });
    };
}]);