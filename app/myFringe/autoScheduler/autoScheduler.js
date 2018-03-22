angular.module('fringeApp').component('myFringeAutoScheduler', {
    templateUrl: 'app/myFringe/autoScheduler/autoScheduler.html',
    controller: [
        '$scope', '$q', '$timeout', '$uibModal', '$location', 'Data', 'Schedule', 'User', 'Availability', 'Configuration', 'Plurals', '$analytics', '$sce',
        function($scope, $q, $timeout, $uibModal, $location, Data, Schedule, User, Availability, Configuration, Plurals, $analytics, $sce) {
            $scope.plurals = Plurals;
            $scope.moment = moment;
            $scope.interestText = Configuration.interestText;
            $scope.instantAddScreenCount = 0;
            $scope.trustAsHtml = $sce.trustAsHtml;

            var generateRun = false;

            var _analyze = function() {
                var desiredShows = Schedule.getDesiredShows(),
                    schedule = Schedule.getSchedule();

                if (! desiredShows.length) {
                    $analytics.eventTrack('Show Screen', {category: 'Auto-Scheduler', label: 'No Interests'});
                    return 'no-interests';
                }

                $scope.progressByDesireMax = {4: 0, 3: 0, 2: 0, 1: 0};
                $scope.progressByDesire = {4: 0, 3: 0, 2: 0, 1: 0};
                desiredShows.map(function(showId) {
                    $scope.progressByDesireMax[Schedule.getShowDesire(showId)] ++;
                });

                var performances = Data.getPerformances(),
                    shows = Data.getShows(),
                    venues = Data.getVenues(),
                    venueDistances = Data.getVenueDistances(),
                    possiblePerformances = Schedule.getPossiblePerformances(),
                    showsAttending = Schedule.getShowsAttending(),
                    desiredShowsNotOnSchedule = desiredShows.diff(showsAttending),
                    now = Date.now() / 1000;

                $scope.shows = shows;
                $scope.performances = performances;
                $scope.genres = Data.getGenres();
                $scope.ratings = Data.getRatings();
                $scope.venues = Data.getVenues();
                $scope.venueDistances = Data.getVenueDistances();
                $scope.venueHosts = Data.getVenueHosts();

                schedule.map(function(performanceId) {
                    $scope.progressByDesire[Schedule.getShowDesire(performances[performanceId].show)] ++;
                });

                $scope.availablePerformanceCount = 0;
                angular.forEach(performances, function(performance) {
                    if (performance.start > now && Availability.isUserAvailable(performance.start, performance.stop)) {
                        $scope.availablePerformanceCount ++;
                    }
                });

                $scope.possiblePerformanceCount = possiblePerformances.length;
                $scope.allDesiredShowsOnSchedule = desiredShowsNotOnSchedule.length === 0;

                if (! possiblePerformances.length) {
                    if (generateRun) {
                        $location.path('/my-fringe');
                    }

                    $analytics.eventTrack('Show Screen', {category: 'Auto-Scheduler', label: 'Schedule Full'});

                    return 'schedule-full';
                }

                // get non-desired suggestions
                var likedGenres = {};
                angular.forEach(shows, function(show, showId) {
                    if (showsAttending.indexOf(showId) > -1 || Schedule.getShowDesire(showId) > 0) {
                        var multiplier = Math.max(1, Schedule.getShowDesire(showId));
                        for (var i = 0; i < show.genres.length; i ++) {
                            ! likedGenres[show.genres[i]] ? likedGenres[show.genres[i]] = multiplier : likedGenres[show.genres[i]] += multiplier;
                        }
                    }
                });

                var recommendedShows = {}, maxScore = 0;
                angular.forEach(shows, function(show, showId) {
                    var score = 0;
                    for (var i = 0; i < show.genres.length; i ++) {
                        score += likedGenres[show.genres[i]] || 0;
                    }

                    recommendedShows[showId] = score;
                    maxScore = Math.max(maxScore, score);
                });

                var suggestedShows = [];
                $scope.suggestedPerformances = possiblePerformances.map(function(pId1) {
                    var performance1 = performances[pId1],
                        showId = performance1.show,
                        venueId1  = shows[showId].venue;

                    if (recommendedShows[showId] !== undefined && recommendedShows[showId] / maxScore > .5 && suggestedShows.indexOf(showId) === -1) {
                        for (var i = 0; i < schedule.length; i ++) {
                            var pId2 = schedule[i],
                                performance2 = performances[pId2],
                                venueId2 = shows[performance2.show].venue,
                                distances = venueDistances[venueId1][venueId2],
                                offset = (distances[1] === undefined ? distances[0] : Math.min(distances[0], distances[1]));

                            if (offset > 300) {
                                continue;
                            }

                            // the venue is good. but does the show start within 30 minutes?

                            var diff = performance2.start > performance1.stop ? performance2.start - performance1.stop : performance1.start - performance2.stop;

                            if (diff > 1800) {
                                continue;
                            }

                            suggestedShows.push(showId);

                            return {
                                performance: pId1,
                                adjacentPerformance: pId2,
                                score: recommendedShows[showId] / maxScore
                            };
                        }
                    }

                    return null;
                }).filter(function(i) {
                    return !!i;
                }).sort(function(a, b) {
                    return b.score - a.score;
                });


                // everything the user wants is scheduled, and there may be extra room.
                if (desiredShowsNotOnSchedule.length === 0) {
                    if (generateRun) {
                        $location.path('/my-fringe');
                    }

                    $analytics.eventTrack('Show Screen', {category: 'Auto-Scheduler', label: 'Schedule Complete'});

                    return 'schedule-complete';
                }

                var possiblePerformancesDesired = possiblePerformances.filter(function(performance) {
                    return desiredShows.indexOf(performances[performance].show) > -1;
                });

                // there are possible performances, but not desired performances
                if (! possiblePerformancesDesired.length) {
                    if (generateRun) {
                        $location.path('/my-fringe');
                    }

                    $analytics.eventTrack('Show Screen', {category: 'Auto-Scheduler', label: 'No Possible Desired'});

                    return 'no-possible-desired';
                }

                // find shows which can be added without repercussion
                var possibleInstantAddPerformances = possiblePerformancesDesired.filter(function(pId1) {
                    var performance1 = performances[pId1],
                        start1 = performance1.start,
                        stop1 = performance1.stop,
                        venue1 = shows[performance1.show].venue;

                    for (var i = 0; i < possiblePerformancesDesired.length; i ++) {
                        var pId2 = possiblePerformancesDesired[i];

                        if (pId1 === pId2) {
                            continue;
                        }

                        var performance2 = performances[pId2],
                            distances = venueDistances[venue1][shows[performance2.show].venue],
                            offset = (distances[1] === undefined ? distances[0] : Math.min(distances[0], distances[1])) + Configuration.minimumArriveBeforeShowTime;

                        if (! (stop1 < performance2.start - offset || start1 > performance2.stop + offset)) {
                            return false;
                        }
                    }

                    return true;
                }).map(function(pId) {
                    return {
                        id: pId,
                        performance: performances[pId],
                        showId: performances[pId].show,
                        show: shows[performances[pId].show],
                        venueId: shows[performances[pId].show].venue,
                        venue: venues[shows[performances[pId].show].venue]
                    };
                });

                possibleInstantAddPerformances = possibleInstantAddPerformances.filter(function(entry) {
                    for (var i = 0; i < possibleInstantAddPerformances.length; i ++) {
                        if (possibleInstantAddPerformances[i].id !== entry.id && possibleInstantAddPerformances[i].showId === entry.showId) {
                            return false;
                        }
                    }

                    return true;
                });

                $scope.instantAddScreenCount ++;

                if (possibleInstantAddPerformances.length) {
                    $scope.instantAddPerformances = possibleInstantAddPerformances;
                    $analytics.eventTrack('Show Screen', {category: 'Auto-Scheduler', label: 'Instant Add'});

                    return 'instant-add';
                }

                $scope.showsOnScheduleCount = showsAttending.length;

                if (generateRun) {
                    return 'done';
                }

                $analytics.eventTrack('Show Screen', {category: 'Auto-Scheduler', label: 'Generator'});

                return 'generator';
            };

            $scope.getProgressType = function(number, max) {
                if (number === max) {
                    return 'success';
                }

                return number < max / 2 ? 'danger' : 'warning';
            };

            $scope.addInstantAdd = function() {
                angular.forEach($scope.instantAddPerformances, function(entry) {
                    Schedule.add(entry.id);
                });

                analyze();
            };

            $scope.addPerformance = function(performanceId) {
                Schedule.add(performanceId);
                analyze();
            };

            $scope.generate = function() {
                $uibModal.open({
                    templateUrl: 'app/myFringe/autoScheduler/autoSchedulerModal/autoSchedulerModal.html',
                    controller: 'AutoSchedulerModalCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                }).result.then(function() {
                    generateRun = true;
                    analyze();
                }, function() {
                    $scope.screen = 'done';
                });
            };

            var analyze = function() {
                $scope.screen = '';
                $timeout(function() {
                    $scope.screen = _analyze();
                }, 500);
            };

            if (! User.getSettings().autoScheduleIntroComplete) {
                $scope.screen = 'intro';

                $scope.completeIntro = function() {
                    var settings = User.getSettings();
                    settings.autoScheduleIntroComplete = true;
                    User.setSettings(settings);

                    analyze();
                };
            } else {
                analyze();
            }
        }
    ]
});