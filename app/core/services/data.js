angular.module('fringeApp').service('Data', ['$http', '$q', 'Sorters', function($http, $q, Sorters) {
    var filename = 'api/getData.php',
        data,
        fringeStart,
        fringeStop,
        showSlugs,
        venueSlugs,
        venueHostSlugs;

    this.load = function() {
        var deferred = $q.defer();
        $http.get(filename, {cache: true}).then(function(result) {
            data = result.data;

            var days = Object.keys(data.availabilitySlots);
            fringeStart = Math.min.apply(null, days);
            fringeStop = Math.max.apply(null, days);

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
    this.findShowIdBySlug = function(slug) {
        if (showSlugs === undefined) {
            showSlugs = {};
            angular.forEach(data.shows, function(show, showId) {
                showSlugs[show.slug] = showId;
            });
        }

        return showSlugs[slug];
    };
    this.getPerformance = function(performanceId) {
        return data.performances[performanceId];
    };

    this.getSortedPerformances = function() {
        return Object.keys(data.performances).sort(function(a, b) {
            return Sorters.performance(data.performances[a], data.performances[b]);
        });
    };

    this.getVenue = function(venueId) {
        return data.venues[venueId];
    };

    this.getVenueHost = function(venueHostId) {
        return data.venueHosts[venueHostId];
    };

    this.findVenueIdBySlug = function(slug) {
        if (venueSlugs === undefined) {
            venueSlugs = {};
            angular.forEach(data.venues, function(venue, venueId) {
                venueSlugs[venue.slug] = venueId;
            });
        }

        return venueSlugs[slug];
    };

    this.findVenueHostIdBySlug = function(slug) {
        if (venueHostSlugs === undefined) {
            venueHostSlugs = {};
            angular.forEach(data.venueHosts, function(venueHost, hostId) {
                venueHostSlugs[venueHost.slug] = hostId;
            });
        }

        return venueHostSlugs[slug];
    };

    // this.getFringeStart = function() {
    //     return fringeStart;
    // };
    //
    // this.getFringeStop = function() {
    //     return fringeStop;
    // };
    //
    this.isFringeOngoing = function() {
        var now = Date.now() / 1000;

        return fringeStart < now && fringeStop > now;
    }
}]);