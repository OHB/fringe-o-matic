angular.module('fringeApp').controller('GenerateModalCtrl', ['$uibModalInstance', '$q', '$scope', '$timeout', 'Data', 'Schedule', 'UserData', 'generatorFactory', function($uibModalInstance, $q, $scope, $timeout, Data, Schedule, UserData, generatorFactory) {
    var config, data, sortedShows;

    $scope.moment = moment;
    $scope.uiap = Schedule.isUserAttendingPerformance;
    $scope.userData = {settings: UserData.getSettings()};
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
        $scope.populationSize = Math.floor(Math.max(500, Math.min(20000, Math.pow(possiblePerformances.length, 1.2))));
        $scope.crossoverRate = 0.9;
        $scope.mutationRate = 0.2;
        $scope.desireFitnessPoints = [0, 3, 7, 15, 31];
        $scope.arrivalThreshold = 600;

        config = {
            iterations: $scope.generationCount,
            size: $scope.populationSize,
            crossover: $scope.crossoverRate,
            mutation: $scope.mutationRate,
            skip: 10
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

        angular.forEach($scope.shows, function(show, showId) {
            var desire = Schedule.getShowDesire(showId),
                possibleShowPerformances = show.performances.filter(function(performanceId) {
                    return possiblePerformances.indexOf(performanceId) > -1;
                });

            if (desire === 0 || possibleShowPerformances.length === 0 || alreadyAttending.indexOf(showId) > -1) {
                return true;
            }

            $scope.progressByDesireMax[desire] ++;

            // shows user wants and isn't already going to and are even possible

            data.showIds.push(showId);

            // @todo consider adding distances here to speed up fitness slightly
            data.shows[showId] = {
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
            }

            // @todo this isn't working correctly.
            // if ($scope.getPossiblePerformancesInRange(performance.start, performance.stop).length === 1) {
            //     $scope.accept[schedule[i]] = true;
            // }
        }

        for (i = 0; i < sortedShows.length; i ++) {
            if (conflicts.indexOf(sortedShows[i]) > -1) {
                $scope.unscheduled.push(sortedShows[i]);
            }
        }

        for (i = 4; i > 0; i --) {
            if ($scope.progressByDesire[i] !== $scope.progressByDesireMax[i]) {
                break;
            }

            for (var j = 0; j < proposedByDesire[i].length; j ++) {
                $scope.accept[proposedByDesire[i][j]] = true;
            }
        }
    };

    var generator;

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

            if (isFinished) {
                $scope.progress = this.userData.idealFitness;
                $scope.done = true;
                $timeout(function() {
                    processGeneratedSchedule(best.entity, bestDetails.conflicts);
                }, 500);
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
        $timeout(run, 500);
    };

    $scope.stop = function() {
        generator.stop();
        $scope.progress = $scope.idealFitness;
        $timeout(function() {
            processGeneratedSchedule($scope.bestSchedule, $scope.bestConflicts);
        }, 1000);
    };

    $scope.restart = function() {
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
}]);