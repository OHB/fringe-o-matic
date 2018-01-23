angular.module('fringeApp').controller('AutoSchedulerModalCtrl', [
    '$uibModalInstance', '$q', '$scope', '$timeout', 'Configuration', 'Data', 'Schedule', 'UserData', 'generatorFactory', 'Plurals',
    function($uibModalInstance, $q, $scope, $timeout, Configuration, Data, Schedule, UserData, generatorFactory, Plurals) {
        var config, data, sortedShows;

        $scope.moment = moment;
        $scope.plurals = Plurals;
        $scope.infoMessages = Configuration.generatorMessages;
        $scope.isUserAttendingPerformance = Schedule.isUserAttendingPerformance;

        $scope.userData = {settings: UserData.getSettings(), preferences: UserData.getPreferences()};
        $scope.$watch('userData.settings', function() {
            UserData.setSettings($scope.userData.settings);
        });

        $q.all([
            Schedule.getPossiblePerformances(),
            Schedule.getShowsAttending(),
            Data.getShows(),
            Data.getPerformances(),
            Data.getVenueDistances(),
            Data.getSortedShows(),
            Data.getSortedPerformances(),
            Data.getVenues()
        ]).then(function(results) {
            var possiblePerformances = results[0],
                alreadyAttending = results[1];

            $scope.shows = results[2];
            $scope.performances = results[3];
            $scope.distances = results[4];
            sortedShows = results[5];
            $scope.sortedPerformances = results[6];
            $scope.venues = results[7];

            $scope.generationCount = Math.max(500, Math.min(1000, possiblePerformances.length * 2));
            $scope.populationSize = Math.floor(Math.max(500, Math.min(3000, Math.pow(possiblePerformances.length, 1.175))));

            $scope.crossoverRate = 0.9;
            $scope.mutationRate = 0.2;
            $scope.desireFitnessPoints = [0, 3, 7, 15, 31];
            $scope.arrivalThreshold = Configuration.minimumArriveBeforeShowTime;

            config = {
                iterations: $scope.generationCount,
                size: $scope.populationSize,
                crossover: $scope.crossoverRate,
                mutation: $scope.mutationRate,
                skip: Math.ceil((($scope.generationCount * $scope.populationSize) - (500*500)) / 920000) + 2,
                maxResults: 1
            };
            data = {
                shows: {},
                showIds: [],
                performances: {},
                venueDistances: $scope.distances,
                desireToFitnessMap: $scope.desireFitnessPoints,
                extraPointsForAdjacentVenues: 1,
                extraPointsForTimeOff: 1,
                timeOffThreshold: 7200,
                adjacentVenueThreshold: 600,
                extraPointsForEmptyDays: 1,
                idealFitness: 0,
                iterations: $scope.generationCount,
                populationSize: $scope.populationSize,
                arrivalThreshold: $scope.arrivalThreshold
            };

            $scope.progressByDesireMax = {1: 0, 2: 0, 3: 0, 4: 0};
            $scope.progressByDesireBase = {1: 0, 2: 0, 3: 0, 4: 0};

            angular.forEach($scope.shows, function(show, showId) {
                var desire = Schedule.getShowDesire(showId),
                    possibleShowPerformances = show.performances.filter(function(performanceId) {
                        return possiblePerformances.indexOf(performanceId) > -1;
                    });

                if (alreadyAttending.indexOf(showId) > -1) {
                    $scope.progressByDesireMax[desire] ++;
                    $scope.progressByDesireBase[desire] ++;
                }

                if (desire === 0 || possibleShowPerformances.length === 0 || alreadyAttending.indexOf(showId) > -1) {
                    return true;
                }

                $scope.progressByDesireMax[desire] ++;

                data.showIds.push(showId);

                // @todo consider adding distances here to speed up fitness slightly
                data.shows[showId] = {
                    name: show.name,
                    desire: desire,
                    venue: show.venue,
                    performances: []
                };

                data.idealFitness += data.desireToFitnessMap[desire];

                angular.forEach(possibleShowPerformances, function(performanceId) {
                    var performance = $scope.performances[performanceId];

                    data.performances[performanceId] = {
                        start: performance.start,
                        stop: performance.stop,
                        show: showId,
                        offsetTimes: {}
                    };

                    data.shows[showId].performances.push(performanceId);

                    angular.forEach($scope.distances, function(venueDistances, venueId) {
                        data.performances[performanceId].offsetTimes[venueId] = {
                            start: performance.start - venueDistances[show.venue] - $scope.arrivalThreshold,
                            stop: performance.stop + venueDistances[show.venue] + $scope.arrivalThreshold
                        };
                    });
                });
            });

            data.performanceIds = Object.keys(data.performances).shuffle();

            var sortedPerformanceIds = Object.keys(data.performances).sort(function(a, b) {
                var pa = data.performances[a], pb = data.performances[b];

                return pb.start - pa.start || pb.stop - pa.stop;
            });

            for (var i = 0; i < sortedPerformanceIds.length; i ++) {
                data.performances[sortedPerformanceIds[i]].sortOrder = i;
            }

            $scope.idealFitness = data.idealFitness;

            console.log("Generator Config: ", data);

            $scope.start();
        });

        var processGeneratedSchedule = function(schedule, conflicts) {
            $scope.proposed = [];
            $scope.unscheduled = [];
            $scope.accept = {};

            var proposedByDesire = {4: [], 3: [], 2: [], 1: []},
                i = schedule.length;

            while (i --) {
                $scope.accept[schedule[i]] = false;
                var performance = data.performances[schedule[i]],
                    showId = performance.show;

                if (conflicts.indexOf(showId) === -1) {
                    $scope.proposed.push(schedule[i]);
                    proposedByDesire[Schedule.getShowDesire(showId)].push(schedule[i]);
                    $scope.accept[schedule[i]] = true;
                }
            }

            for (i = 0; i < sortedShows.length; i ++) {
                if (conflicts.indexOf(sortedShows[i]) > -1) {
                    $scope.unscheduled.push(sortedShows[i]);
                }
            }
        };

        var generator, disableMessageRotation;

        var startMessageRotation = function() {
            $scope.currentMessage = 0;
            var enabled = true,
                rotateMessage = function() {
                    if (! enabled) {
                        return;
                    }

                    $scope.currentMessage = ++$scope.currentMessage % Configuration.generatorMessages.length;
                    $timeout(rotateMessage, 10000);
                };

            $timeout(rotateMessage, 10000);

            return function() {
                enabled = false;
            };
        };

        var run = function() {
            var lastNotificationTime = Date.now(), lastGeneration = 0, generationTimes = [];
            generator = generatorFactory.create();

            generator.notification = function notification(best, generation, stats, isFinished) {
                var bestDetails = this.fitness(best.entity, true);
                $scope.bestFitness = stats.maximum;
                $scope.bestExtraPoints = bestDetails.extraPoints;
                $scope.worstFitness = stats.minimum;
                $scope.currentGeneration = generation;
                $scope.progressByDesire = bestDetails.groups;

                $scope.progressByDesire = {
                    1: bestDetails.groups[1] + $scope.progressByDesireBase[1],
                    2: bestDetails.groups[2] + $scope.progressByDesireBase[2],
                    3: bestDetails.groups[3] + $scope.progressByDesireBase[3],
                    4: bestDetails.groups[4] + $scope.progressByDesireBase[4]
                };

                if (isFinished) {
                    $scope.progress = 100;
                    $scope.done = true;
                    $timeout(function() {
                        processGeneratedSchedule(best.entity, bestDetails.conflicts);
                    }, 750);
                    disableMessageRotation();
                } else {
                    $scope.progress = (best.fitness - bestDetails.extraPoints) / $scope.idealFitness * 90;
                    $scope.progress += (generation / $scope.generationCount) * 10;
                    $scope.bestSchedule = best.entity;
                    $scope.bestConflicts = bestDetails.conflicts;

                    if (generation > 0) {
                        generationTimes.push((Date.now() - lastNotificationTime) / (generation - lastGeneration));

                        if (generationTimes.length > 5) {
                            generationTimes.shift();
                        }

                        $scope.timeRemaining = generationTimes.reduce(function(a, b) {
                            return a + b;
                        }) / generationTimes.length * ($scope.generationCount - generation);
                    }
                    lastNotificationTime = Date.now();
                    lastGeneration = generation;
                }

                $scope.$apply();
            };

            $timeout(function() {
                generator.evolve(config, data);
                disableMessageRotation = startMessageRotation();
            }, 100);

            return generator;
        };

        $scope.getProgressType = function(number, max) {
            if (number === max) {
                return 'success';
            }

            return number < max / 2 ? 'danger' : 'warning';
        };

        $scope.start = function() {
            $scope.progress = 0;
            $scope.currentGeneration = 0;
            $scope.progressByDesire = {1: 0, 2: 0, 3: 0, 4: 0};
            $scope.proposed = undefined;
            $scope.accept = {};
            $scope.bestFitness = 0;
            $scope.bestExtraPoints = 0;
            $scope.worstFitness = 0;
            $scope.done = false;
            $scope.currentMessage = 0;
            $timeout(run, 500);
        };

        $scope.stop = function() {
            disableMessageRotation();
            generator.stop();
            $scope.progress = 100;
            $timeout(function() {
                processGeneratedSchedule($scope.bestSchedule, $scope.bestConflicts);
            }, 1000);
        };

        $scope.restart = function() {
            disableMessageRotation();
            generator.stop();
            $scope.start();
        };

        $scope.save = function() {
            angular.forEach($scope.accept, function(value, key) {
                if (value === true) {
                    Schedule.add(key);
                }
            });

            $uibModalInstance.close();
        };

        $scope.close = function() {
            $uibModalInstance.dismiss();
        };

        $scope.examplePowers = [{
            w: 5,
            p: [
                {i: 1, p: '6'},
                {i: 2, p: '36'},
                {i: 3, p: '216'},
                {i: 4, p: '1,296'},
                {i: 5, p: '7,776'},
                {i: 6, p: '46,656'},
                {i: 7, p: '279,936'},
                {i: 8, p: '1,679,616'},
                {i: 9, p: '10,077,696'}
            ]
        }, {
            w: 7,
            p: [
                {i: 10, p: '60,466,176'},
                {i: 15, p: '470,184,984,576'},
                {i: 20, p: '3,656,158,440,062,976'},
                {i: 25, p: '28,430,288,029,929,700,000'},
                {i: 30, p: '221,073,919,720,733,357,899,776'},
                {i: 35, p: '1,719,070,799,748,422,591,028,658,176'},
                {i: 40, p: '13,367,494,538,843,734,067,838,845,976,576'},
                {i: 45, p: '103,945,637,534,048,876,111,514,866,313,854,976'},
                {i: 50, p: '808,281,277,464,764,060,643,139,600,456,536,293,376'}
            ]
        }
        ];
    }
]);