angular.module('fringeApp').factory('generatorFactory', function() {
    var create = function() {
        var genetic = Genetic.create();

        genetic.seed = function () {
            var schedule = [],
                j = this.userData.showIds.length;

            while (j --) {
                var performances = this.userData.shows[this.userData.showIds[j]].performances;
                schedule.push(performances[Math.floor(Math.random() * performances.length)]);
            }

            return schedule;
        };

        genetic.mutate = function mutate(schedule) {
            var toMake = 2;

            while (toMake --) {
                var idx = Math.floor(Math.random() * schedule.length),
                    performances = this.userData.shows[this.userData.performances[schedule[idx]].show].performances;

                schedule[idx] = performances[Math.floor(Math.random() * performances.length)];
                toMake --;
            }

            return schedule;
        };

        genetic.crossover = function crossover(mother, father) {
            var performances = this.userData.performances,
                len = mother.length,
                ca = Math.floor(Math.random() * len),
                cb = Math.floor(Math.random() * len),
                parents = [mother, father].map(function(schedule) {
                    return schedule.slice(0).sort(function(a, b) {
                        return performances[a].show - performances[b].show;
                    });
                });

            if (ca > cb) {
                var tmp = cb;
                cb = ca;
                ca = tmp;
            }

            return [
                parents[0].slice(0, ca).concat(parents[1].slice(ca, cb)).concat(parents[0].slice(cb)),
                parents[1].slice(0, ca).concat(parents[0].slice(ca, cb)).concat(parents[1].slice(cb))
            ];
        };

        genetic.fitness = function fitness(unsortedSchedule, returnDetails) {
            var tudPerformances = this.userData.performances,
                tudShows = this.userData.shows,
                schedule = unsortedSchedule.slice().sort(function sorter(a, b) {
                    return tudPerformances[a].sortOrder - tudPerformances[b].sortOrder;
                }),
                fitness = 0,
                extraPoints = 0,
                groups = [0, 0, 0, 0, 0],
                performanceConflicts = {},
                conflicts = [],
                conflictFound = false,
                l = schedule.length,
                i = l, j = 0, k = 0,
                pId1, pId2, p1, p2, show1, show2;

            while (i --) {
                pId1 = schedule[i];
                p1 = tudPerformances[pId1];
                show1 = tudShows[p1.show];
                conflictFound = false;
                j = 0;
                k = 0;

                performanceConflicts[pId1] = [];

                var desire1 = show1.desire;

                // minus is next!
                for (j = 1; j < l; j ++) {
                    k = i - j;

                    if (schedule[k] === undefined) {
                        break;
                    }

                    pId2 = schedule[k];
                    p2 = tudPerformances[pId2];
                    show2 = tudShows[p2.show];

                    if (desire1 <= show2.desire && p2.start < p1.offsetTimes[show2.venue].stop) {
                        performanceConflicts[pId1].push(pId2);
                        conflicts.push(p1.show);
                        conflictFound = true;
                    }

                    if (p2.start > p1.stop + 3600) {
                        break;
                    }
                }

                // plus is previous!
                for (j = 1; j < l; j ++) {
                    k = i + j;

                    if (schedule[k] === undefined) {
                        break;
                    }

                    pId2 = schedule[k];
                    p2 = tudPerformances[schedule[k]];
                    show2 = tudShows[p2.show];

                    if (desire1 <= show2.desire && p2.stop > p1.offsetTimes[show2.venue].start) {
                        performanceConflicts[pId1].push(pId2);
                        conflicts.push(p1.show);
                        conflictFound = true;
                    }

                    if (p2.stop < p1.start - 3600) {
                        break;
                    }
                }

                if (! conflictFound) {
                    fitness += this.userData.desireToFitnessMap[desire1];
                    groups[desire1] ++;
                }
            }

            if (conflicts.length) {
                var unconflictedPerformances = [];

                for (var desire = 5; --desire;) {
                    nextConflict: for (i = 0; i < this.userData.performanceIds.length; i ++) {
                        pId1 = this.userData.performanceIds[i];
                        p1 = tudPerformances[pId1];

                        if (! performanceConflicts[pId1] || ! performanceConflicts[pId1].length || tudShows[p1.show].desire !== desire) {
                            continue;
                        }

                        for (j = 0; j < performanceConflicts[pId1].length; j ++) {
                            pId2 = performanceConflicts[pId1][j];

                            // conflicts with an unconflicted
                            if (unconflictedPerformances.indexOf(pId2) > -1) {
                                continue nextConflict;
                            }

                            // conflicts with a conflict
                            if (performanceConflicts[pId2] !== undefined && performanceConflicts[pId2].length > 0) {
                                continue;
                            }

                            continue nextConflict;
                        }


                        // doesn't conflict, add to unconflicted
                        unconflictedPerformances.push(pId1);
                        fitness += this.userData.desireToFitnessMap[desire];
                        groups[desire] ++;
                        conflicts.splice(conflicts.indexOf(tudPerformances[pId1].show), 1);
                    }
                }
            }

            // assign extra points
            i = schedule.length - 1;
            while (i --) {
                p1 = tudPerformances[schedule[i]];
                p2 = tudPerformances[schedule[i + 1]];

                if (this.userData.adjacentVenueThreshold > this.userData.venueDistances[tudShows[p1.show].venue][tudShows[p2.show].venue]) {
                    extraPoints += this.userData.extraPointsForAdjacentVenues;
                }

                // extra points for time off
                extraPoints += Math.floor((p1.start - p2.stop) / this.userData.timeOffThreshold) * this.userData.extraPointsForTimeOff;
            }

            fitness += extraPoints;

            return returnDetails ? {
                fitness: fitness,
                groups: groups,
                extraPoints: extraPoints,
                conflicts: conflicts
            } : fitness;
        };

        genetic.generation = function generation(pop, generation) {
            if (this.userData.genState === undefined || this.userData.genState.lastFitness < pop[0].fitness) {
                this.userData.genState = {
                    lastFitness: pop[0].fitness,
                    sinceGeneration: generation
                };

                return true;
            }

            return generation - this.userData.genState.sinceGeneration <= 100;
        };

        return genetic;
    };

    return {
        create: create
    };
});