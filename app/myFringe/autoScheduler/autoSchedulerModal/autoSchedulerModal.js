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
            $scope.populationSize = Math.floor(Math.max(500, Math.min(20000, Math.pow(possiblePerformances.length, 1.05))));

            // $scope.generationCount = 2;
            // $scope.populationSize = 5;

            $scope.crossoverRate = 0.9;
            $scope.mutationRate = 0.2;
            $scope.desireFitnessPoints = [0, 3, 7, 15, 31];
            $scope.arrivalThreshold = Configuration.minimumArriveBeforeShowTime;

            config = {
                iterations: $scope.generationCount,
                size: $scope.populationSize,
                crossover: $scope.crossoverRate,
                mutation: $scope.mutationRate,
                skip: 5,
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

                data.shows[showId].performances = data.shows[showId].performances.shuffle();
            });

            data.showIds = data.showIds.shuffle();

            $scope.idealFitness = data.idealFitness;


            if (false) {
                data.shows = {
                    '1': {desire: 2, name:'A', performances: ['10'], venue: 'V'},
                    '2': {desire: 1, name:'B', performances: ['20'], venue: 'V'}
                };
                data.performances = {
                    '10': {start: 1495304400, stop: 1495311000, show: '1', offsetTimes: {'V': {start: 1495304400, stop: 1495311000}}},
                    '20': {start: 1495304400, stop: 1495311000, show: '2', offsetTimes: {'V': {start: 1495304400, stop: 1495311000}}}
                };
                data.idealFitness = 6;
                data.showIds = ['1', '2'];
                data.venueDistances = {'V': {'V': 0}};
                config.iterations = $scope.generationCount = 10;
                config.size = $scope.populationSize = 10;
            }



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
                }
            }

            for (i = 0; i < sortedShows.length; i ++) {
                if (conflicts.indexOf(sortedShows[i]) > -1) {
                    $scope.unscheduled.push(sortedShows[i]);
                }
            }

            for (i = 4; i > 0; i --) {
                if ($scope.progressByDesire[i] !== $scope.progressByDesireMax[i]) {
                    // break;
                }

                for (var j = 0; j < proposedByDesire[i].length; j ++) {
                    $scope.accept[proposedByDesire[i][j]] = true;
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
                    $scope.progress = this.userData.idealFitness;
                    $scope.done = true;
                    $timeout(function() {
                        processGeneratedSchedule(best.entity, bestDetails.conflicts);
                    }, 500);
                    disableMessageRotation();
                } else {
                    $scope.progress = Math.max(best.fitness - bestDetails.extraPoints, this.userData.idealFitness) / 2;
                    $scope.progress += this.userData.idealFitness / 2 / this.userData.iterations * generation;
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
            $scope.progress = $scope.idealFitness;
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
    }
]);