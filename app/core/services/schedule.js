angular.module('fringeApp').service('Schedule', ['$q', 'UserData', 'Data', 'Availability', 'Sorters', function($q, UserData, Data, Availability, Sorters) {
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

    this.getPerformancesInSlot = function(slotStart, slotStop) {
        if (slotStart === 0) {
            return $q.when([]);
        }

        return Data.getPerformances().then(function(performances) {
            var performancesInSlot = [],
                schedule = UserData.getSchedule(),
                i = schedule.length;

            while (i --) {
                var pId = schedule[i],
                    performance = performances[pId];

                if (! (performance.stop <= slotStart || performance.start >= slotStop)) {
                    performancesInSlot.push(pId)
                }
            }

            return performancesInSlot;
        });
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

    this.getPossiblePerformancesInRange = function(rangeStart, rangeStop) {
        $q.all({
            performances: Data.getPerformances(),
            attendingShows: this.getShowsAttending()
        }).then(function(results) {
            var performances = results.performances,
                attendingShows = results.attendingShows;

            var possiblePerformances = [];

            angular.forEach(performances, function(p, performanceId) {
                if (! (p.start > rangeStop || p.stop < rangeStart) && self.getShowDesire(p.show) > 0 && attendingShows.indexOf(p.show) === -1) {
                    possiblePerformances.push(performanceId);
                }
            });

            return possiblePerformances;

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

    this.canShowBeAddedToSchedule = function(showId) {
        return Data.getShow(showId).then(function(show) {
            return $q.all(show.performances.map(function(performanceId) {
                return self.canPerformanceBeAddedToSchedule(performanceId);
            }));
        }).then(function(results) {
            return results.indexOf(true) > -1;
        });
    };

    this.canUserAttendShow = function(showId) {
        return Data.getShow(showId).then(function(show) {
            return $q.all(show.performances.map(function(performanceId) {
                return self.canUserAttendPerformance(performanceId);
            }));
        }).then(function(results) {
            return results.indexOf(true) > -1;
        });
    };

    this.getPossiblePerformances = function() {
        return $q.all([Data.getPerformances(), Data.getShows(), Data.getVenueDistances()]).then(function(results) {
            var performances = results[0],
                shows = results[1],
                venueDistances = results[2],
                possiblePerformances = [],
                userSchedule = UserData.getSchedule();

            angular.forEach(performances, function(performance1, performanceId) {
                if (userSchedule.indexOf(performanceId) > -1 || ! Availability.isUserAvailable(performance1.start, performance1.stop)) {
                    return true;

                }

                var start = performance1.start,
                    stop = performance1.stop,
                    i = userSchedule.length;

                while (i --) {
                    var performance2 = performances[userSchedule[i]],
                        offset = venueDistances[shows[performance1.show].venue][shows[performance2.show].venue];

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