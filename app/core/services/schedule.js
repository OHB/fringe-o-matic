angular.module('fringeApp').service('Schedule', ['$q', 'Configuration', 'UserData', 'Data', 'Availability', 'Sorters', function($q, Configuration, UserData, Data, Availability, Sorters) {
    var self = this;

    this.getSchedule = function() {
        return UserData.getSchedule();
    };
    this.getShowDesire = function(showId) {
        return UserData.getPreferences()[showId] || 0;
    };
    this.setShowDesire = function(showId, desire) {
        var preferences = UserData.getPreferences();

        if (desire === 0) {
            delete preferences[showId];
        } else {
            preferences[showId] = desire;
        }

        UserData.setPreferences(preferences);
    };
    this.getDesiredShows = function() {
        return Object.keys(UserData.getPreferences()).filter(function(showId) {
            return self.getShowDesire(showId) > 0;
        });
    };

    this.add = function(performanceId) {
        var schedule = UserData.getSchedule();
        if (schedule.indexOf(performanceId) === -1) {
            schedule.push(performanceId);
            UserData.setSchedule(schedule);
        }

        Data.getPerformance(performanceId).then(function(performance) {
            return Data.getShow(performance.show);
        }).then(function(show) {
            self.removeMaybe(show.performance);
            return show.performances;
        });
    };
    this.remove = function(performanceId) {
        this.removeMaybe(performanceId);

        var schedule = UserData.getSchedule();
        schedule.remove(performanceId);
        UserData.setSchedule(schedule);
    };

    this.addMaybe = function(performanceId) {
        this.remove(performanceId);

        var maybes = UserData.getMaybes();
        if (maybes.indexOf(performanceId) === -1) {
            maybes.push(performanceId);
            UserData.setMaybes(maybes);
        }
    };
    this.removeMaybe = function(performanceId) {
        var maybes = UserData.getMaybes();
        maybes.remove(performanceId);
        UserData.setMaybes(maybes);
    };

    this.getSortedSchedule = function() {
        return Data.getPerformances().then(function(performances) {
            return UserData.getSchedule().sort(function(a, b) {
                return Sorters.performance(performances[a], performances[b]);
            });
        });
    };

    this.isUserAttendingPerformance = function(performanceId) {
        return UserData.getSchedule().indexOf(performanceId) > -1;
    };

    this.isUserMaybeAttendingPerformance = function(performanceId) {
        return UserData.getMaybes().indexOf(performanceId) > -1;
    };

    this.getPerformanceScheduleState = function(performanceId) {
        return this.isUserMaybeAttendingPerformance(performanceId) ? 'maybe' : (this.isUserAttendingPerformance(performanceId) ? 'yes' : 'no');
    };

    this.getPerformancesAttending = function() {
        return UserData.getSchedule();
    };

    this.getShowsAttending = function() {
        return Data.getPerformances().then(function(performances) {
            var shows = [],
                attendingPerformances = self.getPerformancesAttending();

            for (var i = 0; i < attendingPerformances.length; i ++) {
                shows.push(performances[attendingPerformances[i]].show);
            }

            return shows;
        });
    };

    this.isUserAttendingShow = function(showId) {
        return Data.getShow(showId).then(function(show) {
            for (var i = 0; i < show.performances.length; i ++) {
                if (self.isUserAttendingPerformance(show.performances[i])) {
                    return true;
                }
            }

            return false;
        });
    };

    this.canUserAttendPerformance = function(performanceId) {
        return Data.getPerformance(performanceId).then(function(performance) {
            return Availability.isUserAvailable(performance.start, performance.stop);
        });
    };

    this.canPerformanceBeAddedToSchedule = function(performanceId) {
        return $q.all({
            performances: Data.getPerformances(),
            shows: Data.getShows(),
            venueDistances: Data.getVenueDistances()
        }).then(function(results) {
            var performances = results.performances,
                shows = results.shows,
                venueDistances = results.venueDistances,
                performance1 = performances[performanceId],
                start = performance1.start,
                stop = performance1.stop,
                userSchedule = UserData.getSchedule(),
                i = userSchedule.length;

            while (i --) {
                var performance2 = performances[userSchedule[i]],
                    offset = venueDistances[shows[performance1.show].venue][shows[performance2.show].venue];

                if (! (stop < performance2.start - offset || start > performance2.stop + offset)) {
                    return false;
                }
            }

            return true;
        });
    };

    // this.canUserAttendShow = function(showId) {
    //     return Data.getShow(showId).then(function(show) {
    //         return $q.all(show.performances.map(function(performanceId) {
    //             return self.canUserAttendPerformance(performanceId);
    //         }));
    //     }).then(function(results) {
    //         return results.indexOf(true) > -1;
    //     });
    // };

    // performances that can be added to the schedule, unless user is already seeing the show, includes undesired
    this.getPossiblePerformances = function() {
        return $q.all([Data.getPerformances(), Data.getShows(), Data.getVenueDistances()]).then(function(results) {
            var performances = results[0],
                shows = results[1],
                venueDistances = results[2],
                possiblePerformances = [],
                userSchedule = UserData.getSchedule(),
                i = 0;

            angular.forEach(performances, function(performance1, performanceId) {
                if (userSchedule.indexOf(performanceId) > -1 || ! Availability.isUserAvailable(performance1.start, performance1.stop)) {
                    return true;
                }

                var show1 = shows[performance1.show];

                for (i = 0; i < show1.performances.length; i ++) {
                    if (userSchedule.indexOf(show1.performances[i]) > -1) {
                        return true;
                    }
                }

                var start = performance1.start,
                    stop = performance1.stop;

                i = userSchedule.length;

                while (i --) {
                    var performance2 = performances[userSchedule[i]],
                        offset = venueDistances[show1.venue][shows[performance2.show].venue] + Configuration.minimumArriveBeforeShowTime;

                    if (! (stop < performance2.start - offset || start > performance2.stop + offset)) {
                        return true;
                    }
                }

                possiblePerformances.push(performanceId);
            });

            return possiblePerformances;
        });
    };
}]);